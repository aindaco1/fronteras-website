import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(projectRoot, "docs");
const expectFingerprintedMedia =
  process.env.EXPECT_FINGERPRINTED_MEDIA === "true";
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".webmanifest",
  ".xml",
]);
const coreAssetPattern =
  /\/assets\/(?:css|fonts|js)\/[^"'()< >\s?&#]+\.[a-f0-9]{12}\.(?:css|js|ttf|woff2)\b/g;
const mediaAssetPattern =
  /\/assets\/img\/[^"'()< >\s?&#]+\.[a-f0-9]{12}\.(?:avif|gif|jpe?g|png|svg|webp|webm)\b/gi;
const rawMediaPattern =
  /(?<!\/assets)\/img\/[^"'()< >\s?&#]+\.(?:avif|gif|jpe?g|png|svg|webp|mp4|webm)\b/gi;

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

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function assertIncludes(contents, value, label) {
  if (!contents.includes(value)) {
    throw new Error(`${label} is missing ${value}`);
  }
}

function assertExcludes(contents, value, label) {
  if (contents.includes(value)) {
    throw new Error(`${label} unexpectedly includes ${value}`);
  }
}

function assertMatches(contents, pattern, label) {
  if (!pattern.test(contents)) {
    throw new Error(`${label} does not match ${pattern}`);
  }
}

async function assertReferencedFilesExist(contents, pattern, label) {
  const urls = [...contents.matchAll(pattern)].map((match) => match[0]);

  if (urls.length === 0) {
    throw new Error(`${label} has no matching assets`);
  }

  for (const url of new Set(urls)) {
    const filePath = path.join(outputDirectory, decodeURI(url).slice(1));

    if (!(await pathExists(filePath))) {
      throw new Error(`${label} references missing asset ${url}`);
    }
  }
}

const home = await readFile(path.join(outputDirectory, "index.html"), "utf8");
const films = await readFile(
  path.join(outputDirectory, "films", "index.html"),
  "utf8"
);
const installation = await readFile(
  path.join(outputDirectory, "by-boat", "index.html"),
  "utf8"
);

for (const [value, label] of [
  ["/css/all.min.css", "Font Awesome stylesheet"],
  ["/js/hammer.js", "Hammer runtime"],
  ["colcade", "homepage Colcade runtime"],
  ["fonts.googleapis.com", "Google Fonts stylesheet"],
  ["fonts.gstatic.com", "Google Fonts asset host"],
]) {
  assertExcludes(home, value, label);
}

assertIncludes(home, 'fetchpriority="high"', "homepage LCP image");
assertIncludes(home, 'loading="lazy"', "homepage below-fold images");
assertMatches(
  home,
  /\/assets\/css\/index\.[a-f0-9]{12}\.css/,
  "content-addressed stylesheet URL"
);
assertMatches(
  home,
  /\/assets\/fonts\/sega\.[a-f0-9]{12}\.ttf/,
  "content-addressed Sega font URL"
);
assertMatches(
  home,
  /\/assets\/fonts\/roboto-mono-latin-400-normal\.[a-f0-9]{12}\.woff2/,
  "self-hosted Roboto Mono URL"
);
assertIncludes(home, 'data-nav-toggle', "navigation toggle");
assertIncludes(home, 'aria-expanded="false"', "navigation toggle state");

for (const [contents, label] of [
  [films, "films page"],
  [installation, "installation page"],
]) {
  assertMatches(
    contents,
    /<script src="\/assets\/js\/colcade\.[a-f0-9]{12}\.js" defer><\/script>/,
    label
  );
}

const buildFiles = await findFiles(outputDirectory);
const htmlFiles = buildFiles.filter((file) => file.endsWith(".html"));
const textFiles = buildFiles.filter((file) =>
  textExtensions.has(path.extname(file).toLowerCase())
);

for (const htmlFile of htmlFiles) {
  const contents = await readFile(htmlFile, "utf8");

  for (const value of [
    "/css/all.min.css",
    "/js/hammer.js",
    'class="fa ',
    'class="fab ',
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "/webfonts/",
    "Blackout",
    "Geist-RND",
  ]) {
    assertExcludes(contents, value, htmlFile);
  }
}

await assertReferencedFilesExist(home, coreAssetPattern, "homepage");
await assertReferencedFilesExist(films, coreAssetPattern, "films page");

const fontDirectory = path.join(outputDirectory, "assets", "fonts");
const deployedFonts = (await readdir(fontDirectory)).sort();

if (
  deployedFonts.length !== 4 ||
  deployedFonts.some(
    (font) =>
      !/^(?:sega|roboto-mono-latin-(?:400-(?:italic|normal)|700-normal))\.[a-f0-9]{12}\.(?:ttf|woff2)$/.test(
        font
      )
  )
) {
  throw new Error(
    `Unexpected deployed font allowlist: ${deployedFonts.join(", ")}`
  );
}

for (const retiredDirectory of ["css", "js", "webfonts"]) {
  if (await pathExists(path.join(outputDirectory, retiredDirectory))) {
    throw new Error(`Legacy asset directory was deployed: ${retiredDirectory}`);
  }
}

if (expectFingerprintedMedia) {
  if (await pathExists(path.join(outputDirectory, "img"))) {
    throw new Error("Raw docs/img directory remains after media fingerprinting");
  }

  let mediaReferences = 0;

  for (const textFile of textFiles) {
    const contents = await readFile(textFile, "utf8");
    const rawMedia = contents.match(rawMediaPattern);

    if (rawMedia) {
      throw new Error(
        `${path.relative(outputDirectory, textFile)} retains ${rawMedia[0]}`
      );
    }

    const matches = [...contents.matchAll(mediaAssetPattern)];
    mediaReferences += matches.length;

    for (const match of matches) {
      const url = match[0];
      const filePath = path.join(outputDirectory, decodeURI(url).slice(1));

      if (!(await pathExists(filePath))) {
        throw new Error(`Missing fingerprinted media asset ${url}`);
      }
    }
  }

  if (mediaReferences === 0) {
    throw new Error("No fingerprinted media references were found");
  }
}

console.log(
  `Validated self-hosted, scoped, content-addressed assets in ${htmlFiles.length} HTML files` +
    `${expectFingerprintedMedia ? " with fingerprinted media" : ""}.`
);
