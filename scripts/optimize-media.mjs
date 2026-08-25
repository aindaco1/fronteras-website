import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

if (process.env.GITHUB_ACTIONS !== "true") {
  console.error("Media optimization is restricted to GitHub Actions.");
  process.exit(1);
}

if (process.argv.includes("--check")) {
  process.exit(0);
}

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const buildDirectory = path.join(projectRoot, "docs");
const mediaDirectory = path.join(buildDirectory, "img");
const outputMediaDirectory = path.join(buildDirectory, "assets", "img");
const cacheDirectory = path.join(projectRoot, ".cache", "media");
const cacheVersion = "fronteras-media-v1";
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".webmanifest",
  ".xml",
]);
const mediaReference =
  /(?<!\/assets)\/img\/[^"'()< >\s?&#]+?\.(?:avif|gif|jpe?g|png|svg|webp|mp4|webm)\b/gi;
const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const videoExtensions = new Set([".mp4", ".webm"]);
const imageQuality = Number(process.env.MEDIA_IMAGE_QUALITY || 80);
const videoCrf = Number(process.env.MEDIA_VIDEO_CRF || 40);
const videoMaxDimension = Number(process.env.MEDIA_VIDEO_MAX_DIMENSION || 1280);

async function findFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function fileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const input = createReadStream(filePath);

    input.on("error", reject);
    input.on("data", (chunk) => hash.update(chunk));
    input.on("end", () => resolve(hash.digest("hex")));
  });
}

async function transformCachePath(reference, format) {
  const sourceHash = await fileHash(reference.mediaPath);
  const settings =
    format === "webp"
      ? `webp:${imageQuality}:effort-5:smart-subsample`
      : `vp9:${videoCrf}:${videoMaxDimension}:opus-96k:cpu-5`;
  const key = createHash("sha256")
    .update(`${cacheVersion}:${sourceHash}:${settings}`)
    .digest("hex");

  return path.join(cacheDirectory, `${key}.${format}`);
}

function getMediaPath(url) {
  const relativePath = decodeURI(url.slice("/img/".length));
  const mediaPath = path.resolve(mediaDirectory, relativePath);
  const mediaRoot = `${path.resolve(mediaDirectory)}${path.sep}`;

  if (!mediaPath.startsWith(mediaRoot)) {
    throw new Error(`Media reference escapes docs/img: ${url}`);
  }

  return mediaPath;
}

async function findReferencedMedia(textFiles) {
  const references = new Map();
  const missing = new Set();

  for (const textFile of textFiles) {
    const contents = await readFile(textFile, "utf8");

    for (const match of contents.matchAll(mediaReference)) {
      const url = match[0];
      const mediaPath = getMediaPath(url);

      if (!(await fileExists(mediaPath))) {
        missing.add(url);
        continue;
      }

      references.set(mediaPath, {
        extension: path.extname(mediaPath).toLowerCase(),
        mediaPath,
        urls: new Set([...(references.get(mediaPath)?.urls || []), url]),
      });
    }
  }

  if (missing.size > 0) {
    throw new Error(
      `Missing referenced media:\n${[...missing].sort().join("\n")}`
    );
  }

  return [...references.values()];
}

async function mapWithConcurrency(items, concurrency, worker) {
  let nextIndex = 0;
  const results = [];
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await worker(items[index]);
      }
    }
  );

  await Promise.all(workers);
  return results;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });

    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`
          )
        );
      }
    });
  });
}

async function cachedImage(reference) {
  const cachePath = await transformCachePath(reference, "webp");

  if (await fileExists(cachePath)) {
    return { cacheHit: true, outputPath: cachePath };
  }

  const temporaryPath = `${cachePath}.${process.pid}.tmp`;

  try {
    await sharp(reference.mediaPath)
      .rotate()
      .webp({ effort: 5, quality: imageQuality, smartSubsample: true })
      .toFile(temporaryPath);
    await rename(temporaryPath, cachePath);
    return { cacheHit: false, outputPath: cachePath };
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

async function cachedVideo(reference) {
  const cachePath = await transformCachePath(reference, "webm");

  if (await fileExists(cachePath)) {
    return { cacheHit: true, outputPath: cachePath };
  }

  const temporaryPath = `${cachePath}.${process.pid}.tmp.webm`;
  const scale =
    `scale=w='min(${videoMaxDimension},iw)':` +
    `h='min(${videoMaxDimension},ih)':` +
    "force_original_aspect_ratio=decrease:force_divisible_by=2";

  console.log(`Transcoding ${path.relative(buildDirectory, reference.mediaPath)}`);

  try {
    await run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      reference.mediaPath,
      "-map",
      "0:v:0",
      "-map",
      "0:a:0?",
      "-sn",
      "-vf",
      scale,
      "-c:v",
      "libvpx-vp9",
      "-crf",
      String(videoCrf),
      "-b:v",
      "0",
      "-deadline",
      "good",
      "-cpu-used",
      "5",
      "-row-mt",
      "1",
      "-tile-columns",
      "2",
      "-threads",
      "4",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "libopus",
      "-b:a",
      "96k",
      "-map_metadata",
      "-1",
      temporaryPath,
    ]);
    await rename(temporaryPath, cachePath);
    return { cacheHit: false, outputPath: cachePath };
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

function encodeOutputPath(relativePath) {
  return relativePath.split(path.sep).map(encodeURIComponent).join("/");
}

async function fingerprint(reference, selectedPath, options = {}) {
  const { cacheHit = false, transformed = false } = options;
  const relativeInput = path.relative(mediaDirectory, reference.mediaPath);
  const parsed = path.parse(relativeInput);
  const selectedExtension = path.extname(selectedPath).toLowerCase();
  const selectedHash = (await fileHash(selectedPath)).slice(0, 12);
  const outputName =
    `${parsed.name}${transformed ? ".optimized" : ""}.` +
    `${selectedHash}${selectedExtension}`;
  const relativeOutput = path.join(parsed.dir, outputName);
  const outputPath = path.join(outputMediaDirectory, relativeOutput);
  const inputStats = await stat(reference.mediaPath);
  const outputStats = await stat(selectedPath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await copyFile(selectedPath, outputPath);

  const outputUrl = `/assets/img/${encodeOutputPath(relativeOutput)}`;

  return {
    cacheHit,
    inputBytes: inputStats.size,
    outputBytes: outputStats.size,
    replacements: [...reference.urls].map((url) => [url, outputUrl]),
    transformed,
  };
}

async function optimizeImage(reference) {
  const inputStats = await stat(reference.mediaPath);
  const cached = await cachedImage(reference);
  const outputStats = await stat(cached.outputPath);

  if (outputStats.size >= inputStats.size) {
    return fingerprint(reference, reference.mediaPath);
  }

  return fingerprint(reference, cached.outputPath, {
    cacheHit: cached.cacheHit,
    transformed: true,
  });
}

async function optimizeVideo(reference) {
  const inputStats = await stat(reference.mediaPath);
  const cached = await cachedVideo(reference);
  const outputStats = await stat(cached.outputPath);

  if (reference.extension === ".webm" && outputStats.size >= inputStats.size) {
    return fingerprint(reference, reference.mediaPath);
  }

  return fingerprint(reference, cached.outputPath, {
    cacheHit: cached.cacheHit,
    transformed: true,
  });
}

async function rewriteReferences(textFiles, replacements) {
  for (const textFile of textFiles) {
    const contents = await readFile(textFile, "utf8");
    let updatedContents = contents;

    for (const [sourceUrl, outputUrl] of replacements) {
      updatedContents = updatedContents.split(sourceUrl).join(outputUrl);
    }

    if (updatedContents !== contents) {
      await writeFile(textFile, updatedContents);
    }
  }
}

async function assertNoRawMediaReferences(textFiles) {
  const remaining = [];

  for (const textFile of textFiles) {
    const contents = await readFile(textFile, "utf8");
    const matches = [...contents.matchAll(mediaReference)].map(
      (match) => match[0]
    );

    if (matches.length > 0) {
      remaining.push(`${path.relative(buildDirectory, textFile)}: ${matches[0]}`);
    }
  }

  if (remaining.length > 0) {
    throw new Error(
      `Raw media references remain after fingerprinting:\n${remaining.join("\n")}`
    );
  }
}

function formatMiB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

async function main() {
  await mkdir(cacheDirectory, { recursive: true });

  const buildFiles = await findFiles(buildDirectory);
  const textFiles = buildFiles.filter((file) =>
    textExtensions.has(path.extname(file).toLowerCase())
  );
  const references = await findReferencedMedia(textFiles);
  const images = references.filter((reference) =>
    imageExtensions.has(reference.extension)
  );
  const videos = references.filter((reference) =>
    videoExtensions.has(reference.extension)
  );
  const passthrough = references.filter(
    (reference) =>
      !imageExtensions.has(reference.extension) &&
      !videoExtensions.has(reference.extension)
  );

  if (videos.length > 0) {
    await run("ffmpeg", ["-version"], { stdio: "ignore" });
  }

  const imageResults = await mapWithConcurrency(images, 4, optimizeImage);
  const videoResults = await mapWithConcurrency(videos, 1, optimizeVideo);
  const passthroughResults = await mapWithConcurrency(
    passthrough,
    4,
    (reference) => fingerprint(reference, reference.mediaPath)
  );
  const results = [
    ...imageResults,
    ...videoResults,
    ...passthroughResults,
  ];
  const replacements = results.flatMap((result) => result.replacements);

  await rewriteReferences(textFiles, replacements);
  await assertNoRawMediaReferences(textFiles);
  await rm(mediaDirectory, { recursive: true, force: true });

  const inputBytes = results.reduce((sum, result) => sum + result.inputBytes, 0);
  const outputBytes = results.reduce(
    (sum, result) => sum + result.outputBytes,
    0
  );
  const cacheHits = results.filter((result) => result.cacheHit).length;
  const transformed = results.filter((result) => result.transformed).length;

  console.log(
    `Processed ${images.length} images, ${videos.length} videos, and ` +
      `${passthrough.length} passthrough assets: ` +
      `${formatMiB(inputBytes)} -> ${formatMiB(outputBytes)} ` +
      `(${formatMiB(inputBytes - outputBytes)} saved).`
  );
  console.log(
    `Content-addressed ${results.length} media assets; ${transformed} transformed, ` +
      `${cacheHits} transform cache hits.`
  );
}

await main();
