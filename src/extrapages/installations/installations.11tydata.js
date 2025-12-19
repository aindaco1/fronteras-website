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
    title: data => data.installation?.title || data.title,
    description: data => data.installation ? data.installation.authors?.map(a => a.name).join(' and ') : data.description,
    permalink: data => {
      if (data.installation?.title) {
        return `/${slugify(data.installation.title)}/`;
      }
      return data.permalink;
    },
    navlogo: data => data.installation?.navlogo || data.navlogo,
    backgroundcolor: data => data.installation?.backgroundcolor || data.backgroundcolor,
    image: data => data.installation?.heroImage || data.image,
    heroImage: data => data.installation?.heroImage || data.heroImage,
    authors: data => data.installation?.authors || data.authors,
    bodyContent: data => data.installation?.description,
    showAllFilms: data => data.installation?.showAllFilms ?? data.showAllFilms,
    filmsScreened: data => data.installation?.filmsScreened || data.filmsScreened,
    galleryImages: data => data.installation?.galleryImages || data.galleryImages
  }
};
