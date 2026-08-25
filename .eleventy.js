const { DateTime } = require("luxon");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const pluginRss = require("@11ty/eleventy-plugin-rss").default;
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

const isProduction = process.env.ELEVENTY_ENV === "production";
const outputDirectory = isProduction ? "docs" : "dev";

function contentHash(filePath) {
  return createHash("sha256")
    .update(readFileSync(filePath))
    .digest("hex")
    .slice(0, 12);
}

const assetFiles = {
  stylesheet: "src/_includes/css/index.css",
  colcade: "src/_includes/js/colcade.js",
  sega: "src/_includes/fonts/Sega.TTF",
  robotoMono400Normal:
    "node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff2",
  robotoMono400Italic:
    "node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-italic.woff2",
  robotoMono700Normal:
    "node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff2",
};
const assetPaths = {
  stylesheet: `/assets/css/index.${contentHash(assetFiles.stylesheet)}.css`,
  colcade: `/assets/js/colcade.${contentHash(assetFiles.colcade)}.js`,
  sega: `/assets/fonts/sega.${contentHash(assetFiles.sega)}.ttf`,
  robotoMono400Normal:
    `/assets/fonts/roboto-mono-latin-400-normal.${contentHash(assetFiles.robotoMono400Normal)}.woff2`,
  robotoMono400Italic:
    `/assets/fonts/roboto-mono-latin-400-italic.${contentHash(assetFiles.robotoMono400Italic)}.woff2`,
  robotoMono700Normal:
    `/assets/fonts/roboto-mono-latin-700-normal.${contentHash(assetFiles.robotoMono700Normal)}.woff2`,
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://fronterasmicrofilm.com",
    },
  });
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.ignores.add("**/.DS_Store");
  eleventyConfig.watchIgnores.add("**/.DS_Store");

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addGlobalData("assetPaths", assetPaths);

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Map navlogo display names to internal values
  eleventyConfig.addFilter("navlogoToValue", (logo) => {
    const logoMap = {
      '🎥 Film': 'emojianim',
      '📺 Installation': 'installation',
      '🌊 Wave': 'wave',
      '🚪 Door': 'door',
      '🖐️ Hand Wave': 'handwave',
      '🏆 Trophy': 'trophy',
      '💵 Cash': 'cash',
      '🚚 Truck': 'truck',
      '⛵ Boat': 'boat',
      '☁️ Clouds': 'clouds',
      '🗼 Tower': 'tower',
      '🔦 Flashlight': 'flashlight',
      '📢 Loudspeaker': 'loudspeaker'
    };
    return logoMap[logo] || logo;
  });

  // Map color names to hex codes
  eleventyConfig.addFilter("colorToHex", (color) => {
    const colorMap = {
      'Light Gray': 'F5F5F5',
      'Light Blue': '6fcae7',
      'Yellow': 'FEE283',
      'Aqua': '7fffd4',
      'Dark Green': '2E6021',
      'Neon Green': '39ff14',
      'Red': 'ff4760'
    };
    // If it's already a hex code (6 chars, alphanumeric), return as-is
    if (color && /^[0-9A-Fa-f]{6}$/.test(color)) {
      return color;
    }
    return colorMap[color] || color || 'F5F5F5';
  });

  // Convert newlines to <br> tags
  eleventyConfig.addFilter("nl2br", (str) => {
    if (!str) return "";
    return str.trim().replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
  });

  // Get first name from full name
  eleventyConfig.addFilter("firstName", (name) => {
    if (!name) return "";
    return name.split(" ")[0];
  });

  // Slugify a string
  eleventyConfig.addFilter("slugify", (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  });

  eleventyConfig.addCollection("tagList", require("./_11ty/getTagList"));

  // Helper to check if film year matches (supports string or array)
  const filmHasYear = (item, targetYear) => {
    const year = item.data.year;
    if (Array.isArray(year)) return year.includes(targetYear);
    return year === targetYear;
  };

  // Create a films collection for lookups
  eleventyConfig.addCollection("films", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/films/*.njk");
  });

  // Create films collection filtered by year 2023
  eleventyConfig.addCollection("films2023", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/films/*.njk")
      .filter(item => filmHasYear(item, "2023"));
  });

  // Create films collection filtered by year 2025
  eleventyConfig.addCollection("films2025", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/films/*.njk")
      .filter(item => filmHasYear(item, "2025"));
  });

  // Filter to look up film by input path
  eleventyConfig.addFilter("getFilmByPath", function(path, collections) {
    if (!path || !collections || !collections.films) return null;
    return collections.films.find(film => film.inputPath === path || film.inputPath === './' + path);
  });

  // Filter to look up film by title
  eleventyConfig.addFilter("getFilmByTitle", function(title, collections) {
    if (!title || !collections || !collections.films) return null;
    return collections.films.find(film => film.data.title === title);
  });

  // Filter to look up film by filename slug
  eleventyConfig.addFilter("getFilmBySlug", function(slug, collections) {
    if (!slug || !collections || !collections.films) return null;
    return collections.films.find(film => {
      // Match by filename (without extension and path)
      const filename = film.inputPath.split('/').pop().replace('.njk', '');
      return filename === slug;
    });
  });

  // Create an installations collection for lookups
  eleventyConfig.addCollection("installations", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/installations/*.njk");
  });

  // Helper to check if year matches (supports string or array)
  const hasYear = (item, targetYear) => {
    const year = item.data.year;
    if (Array.isArray(year)) return year.includes(targetYear);
    return year === targetYear;
  };

  // Create installations collection filtered by year 2023
  eleventyConfig.addCollection("installations2023", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/installations/*.njk")
      .filter(item => hasYear(item, "2023"));
  });

  // Create installations collection filtered by year 2025
  eleventyConfig.addCollection("installations2025", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/installations/*.njk")
      .filter(item => hasYear(item, "2025"));
  });

  // Helper to check if sponsor year matches (supports string or array)
  const sponsorHasYear = (item, targetYear) => {
    const year = item.data.year;
    if (Array.isArray(year)) return year.includes(targetYear);
    return year === targetYear;
  };

  // Helper to sort sponsors by tier
  const sortByTier = (a, b) => {
    const tierOrder = { organizer: 0, partner: 1, sponsor: 2 };
    const tierA = tierOrder[a.data.tier] ?? 3;
    const tierB = tierOrder[b.data.tier] ?? 3;
    if (tierA !== tierB) return tierA - tierB;
    return (a.data.name || '').localeCompare(b.data.name || '');
  };

  // Create a sponsors collection (all sponsors)
  eleventyConfig.addCollection("sponsors", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/sponsors/*.njk")
      .sort(sortByTier);
  });

  // Create sponsors filtered by year 2023
  eleventyConfig.addCollection("sponsors2023", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/sponsors/*.njk")
      .filter(item => sponsorHasYear(item, "2023"))
      .sort(sortByTier);
  });

  // Create sponsors filtered by year 2025
  eleventyConfig.addCollection("sponsors2025", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/sponsors/*.njk")
      .filter(item => sponsorHasYear(item, "2025"))
      .sort(sortByTier);
  });

  // Filter to look up installation by filename slug or by slugified title
  eleventyConfig.addFilter("getInstallationBySlug", function(slug, collections, installationsData) {
    if (!slug) return null;
    const slugify = (str) => {
      if (!str) return "";
      return str.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };
    // First check the .njk file collection
    if (collections && collections.installations) {
      const found = collections.installations.find(inst => {
        const filename = inst.inputPath.split('/').pop().replace('.njk', '');
        if (filename === slug) return true;
        if (inst.data.title && slugify(inst.data.title) === slug) return true;
        return false;
      });
      if (found) return found;
    }
    // Then check installations.json data
    if (installationsData && installationsData.list) {
      const jsonInst = installationsData.list.find(inst => slugify(inst.title) === slug);
      if (jsonInst) {
        return { data: { title: jsonInst.title }, url: '/' + slug + '/' };
      }
    }
    return null;
  });

  // During `--serve`, use source assets directly instead of duplicating them
  // in the local output directory. Production media is content-addressed by
  // the CI optimizer after Eleventy finishes.
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addPassthroughCopy({ "src/_includes/img": "img" });
  eleventyConfig.addPassthroughCopy({
    [assetFiles.stylesheet]: assetPaths.stylesheet.slice(1),
    [assetFiles.colcade]: assetPaths.colcade.slice(1),
    [assetFiles.sega]: assetPaths.sega.slice(1),
    [assetFiles.robotoMono400Normal]:
      assetPaths.robotoMono400Normal.slice(1),
    [assetFiles.robotoMono400Italic]:
      assetPaths.robotoMono400Italic.slice(1),
    [assetFiles.robotoMono700Normal]:
      assetPaths.robotoMono700Normal.slice(1),
  });
  eleventyConfig.addPassthroughCopy({ "src/_includes/favicons": "favicons" });
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy(".nojekyll");
  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink({
      class: "direct-link",
      symbol: "#",
    }),
  });
  eleventyConfig.setLibrary("md", markdownLibrary);
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    templateFormats: ["md", "njk", "html", "liquid", "yml", "pdf"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about those.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.io/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    // These are all optional, defaults are shown:
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: outputDirectory,
    },
  };
};
