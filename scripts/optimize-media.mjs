import { spawn } from "node:child_process";
import {
  access,
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
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".webmanifest",
  ".xml",
]);
const mediaReference =
  /\/img\/[^"'()<>\s?&#]+?\.(?:jpe?g|png|mp4|webm)\b/gi;
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

  for (const textFile of textFiles) {
    const contents = await readFile(textFile, "utf8");

    for (const match of contents.matchAll(mediaReference)) {
      const url = match[0];
      const mediaPath = getMediaPath(url);

      if (await fileExists(mediaPath)) {
        references.set(mediaPath, {
          extension: path.extname(mediaPath).toLowerCase(),
          mediaPath,
          urls: new Set([...(references.get(mediaPath)?.urls || []), url]),
        });
      }
    }
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

function replaceExtension(value, extension) {
  return value.replace(/\.[^.]+$/, extension);
}

async function optimizeImage(reference) {
  const outputPath = replaceExtension(reference.mediaPath, ".optimized.webp");
  const inputStats = await stat(reference.mediaPath);

  await sharp(reference.mediaPath)
    .rotate()
    .webp({ effort: 5, quality: imageQuality, smartSubsample: true })
    .toFile(outputPath);

  const outputStats = await stat(outputPath);

  if (outputStats.size >= inputStats.size) {
    await rm(outputPath, { force: true });
    return {
      inputBytes: inputStats.size,
      outputBytes: inputStats.size,
      replacements: [],
    };
  }

  await rm(reference.mediaPath);

  return {
    inputBytes: inputStats.size,
    outputBytes: outputStats.size,
    replacements: [...reference.urls].map((url) => [
      url,
      replaceExtension(url, ".optimized.webp"),
    ]),
  };
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });

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

async function optimizeVideo(reference) {
  const outputPath =
    reference.extension === ".mp4"
      ? replaceExtension(reference.mediaPath, ".optimized.webm")
      : reference.mediaPath;
  const temporaryPath = `${outputPath}.${process.pid}.tmp.webm`;
  const inputStats = await stat(reference.mediaPath);
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

    const outputStats = await stat(temporaryPath);

    if (reference.extension === ".webm" && outputStats.size >= inputStats.size) {
      await rm(temporaryPath, { force: true });
      return {
        inputBytes: inputStats.size,
        outputBytes: inputStats.size,
        replacements: [],
      };
    }

    await rm(reference.mediaPath);
    await rename(temporaryPath, outputPath);

    return {
      inputBytes: inputStats.size,
      outputBytes: outputStats.size,
      replacements: [...reference.urls]
        .filter((url) => url.toLowerCase().endsWith(".mp4"))
        .map((url) => [url, replaceExtension(url, ".optimized.webm")]),
    };
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
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

function formatMiB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

async function main() {
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

  const imageResults = await mapWithConcurrency(images, 4, optimizeImage);
  const videoResults = await mapWithConcurrency(videos, 1, optimizeVideo);
  const results = [...imageResults, ...videoResults];
  const replacements = results.flatMap((result) => result.replacements);

  await rewriteReferences(textFiles, replacements);

  const inputBytes = results.reduce((sum, result) => sum + result.inputBytes, 0);
  const outputBytes = results.reduce(
    (sum, result) => sum + result.outputBytes,
    0
  );

  console.log(
    `Optimized ${images.length} images and ${videos.length} videos: ` +
      `${formatMiB(inputBytes)} -> ${formatMiB(outputBytes)} ` +
      `(${formatMiB(inputBytes - outputBytes)} saved).`
  );
}

await main();
