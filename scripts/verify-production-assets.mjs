const siteUrl = "https://fronterasmicrofilm.com";
const attempts = Number(process.env.PRODUCTION_VERIFY_ATTEMPTS || 36);
const retryDelayMs = Number(process.env.PRODUCTION_VERIFY_DELAY_MS || 5000);

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function assertAssetHeaders(response, assetUrl, options = {}) {
  const { expectEdgeHit = false } = options;
  const cacheControl = response.headers.get("cache-control") || "";
  const cacheStatus = response.headers.get("cf-cache-status") || "";

  if (!cacheControl.includes("max-age=31536000")) {
    throw new Error(`${assetUrl} has unexpected Cache-Control: ${cacheControl}`);
  }

  if (!cacheControl.includes("immutable")) {
    throw new Error(`${assetUrl} is missing immutable: ${cacheControl}`);
  }

  if (["BYPASS", "DYNAMIC"].includes(cacheStatus.toUpperCase())) {
    throw new Error(`${assetUrl} has CF-Cache-Status: ${cacheStatus}`);
  }

  if (expectEdgeHit && cacheStatus.toUpperCase() !== "HIT") {
    throw new Error(`${assetUrl} did not reach an edge-cache HIT: ${cacheStatus}`);
  }

  return { cacheControl, cacheStatus };
}

async function verify() {
  const homeResponse = await fetch(`${siteUrl}/?verify=${Date.now()}`, {
    redirect: "follow",
  });

  if (!homeResponse.ok) {
    throw new Error(`Homepage returned ${homeResponse.status}`);
  }

  const home = await homeResponse.text();
  const stylesheet = home.match(
    /href="(\/assets\/css\/index\.[a-f0-9]{12}\.css)"/
  )?.[1];
  const font = home.match(
    /url\("(\/assets\/fonts\/roboto-mono-latin-400-normal\.[a-f0-9]{12}\.woff2)"\)/
  )?.[1];
  const image = home.match(
    /(?:src|content)="(\/assets\/img\/[^"?]+\.[a-f0-9]{12}\.(?:webp|gif|svg))"/
  )?.[1];

  if (!stylesheet || !font || !image) {
    throw new Error("Production HTML does not contain expected hashed assets");
  }

  if (home.includes("fonts.googleapis.com") || home.includes("/webfonts/")) {
    throw new Error("Production HTML retains an external or legacy font path");
  }

  const assets = [stylesheet, font, image];
  const results = [];

  for (const asset of assets) {
    const assetUrl = new URL(asset, siteUrl);
    const first = await fetch(assetUrl);

    if (!first.ok) {
      throw new Error(`${assetUrl} returned ${first.status}`);
    }

    assertAssetHeaders(first, assetUrl);

    const second = await fetch(assetUrl);

    if (!second.ok) {
      throw new Error(`${assetUrl} returned ${second.status} on repeat fetch`);
    }

    results.push({
      asset: assetUrl.pathname,
      ...assertAssetHeaders(second, assetUrl, { expectEdgeHit: true }),
    });
  }

  return results;
}

let lastError;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const results = await verify();
    console.log("Verified deployed immutable assets:");
    console.table(results);
    process.exit(0);
  } catch (error) {
    lastError = error;

    if (attempt < attempts) {
      console.log(`Production verification ${attempt}/${attempts} pending: ${error.message}`);
      await wait(retryDelayMs);
    }
  }
}

throw lastError;
