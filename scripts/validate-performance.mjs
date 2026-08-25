import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(projectRoot, "docs");

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
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
  ["/js/colcade.js", "homepage Colcade runtime"],
]) {
  assertExcludes(home, value, label);
}

assertIncludes(home, 'fetchpriority="high"', "homepage LCP image");
assertIncludes(home, 'loading="lazy"', "homepage below-fold images");
assertIncludes(home, 'data-nav-toggle', "navigation toggle");
assertIncludes(home, 'aria-expanded="false"', "navigation toggle state");

for (const [contents, label] of [
  [films, "films page"],
  [installation, "installation page"],
]) {
  assertIncludes(contents, '<script src="/js/colcade.js" defer></script>', label);
}

const htmlFiles = await findHtmlFiles(outputDirectory);

for (const htmlFile of htmlFiles) {
  const contents = await readFile(htmlFile, "utf8");
  assertExcludes(contents, "/css/all.min.css", htmlFile);
  assertExcludes(contents, "/js/hammer.js", htmlFile);
  assertExcludes(contents, 'class="fa ', htmlFile);
  assertExcludes(contents, 'class="fab ', htmlFile);
}

console.log(
  `Validated scoped assets and native navigation markup in ${htmlFiles.length} HTML files.`
);
