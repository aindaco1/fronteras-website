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
    // Compute author names for backwards compatibility
    authorNames: data => {
      if (data.authors && data.authors.length > 0) {
        return data.authors.map(a => a.name).join(' & ');
      }
      return null;
    },
    // Use description field for body content in template
    bodyContent: data => data.description
  }
};
