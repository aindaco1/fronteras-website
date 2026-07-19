// Helper to slugify a string
function slugify(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

module.exports = {
  eleventyComputed: {
    permalink: data => {
      if (data.title) {
        return `/${slugify(data.title)}/`;
      }
      return data.permalink;
    },
    // Compute description from first author name for backwards compatibility
    description: data => {
      if (data.authors && data.authors.length > 0) {
        return data.authors.map(a => a.name).join(' & ');
      }
      return data.description;
    }
  }
};
