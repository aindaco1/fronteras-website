const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

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

  eleventyConfig.setDataDeepMerge(true);

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

  // Create a films collection for lookups
  eleventyConfig.addCollection("films", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/extrapages/films/*.njk");
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

  eleventyConfig.addPassthroughCopy({ "src/_includes/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/_includes/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/_includes/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/_includes/fonts": "webfonts" });
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
  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync("docs/404.html");

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

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
      output: "docs",
    },
  };
};
