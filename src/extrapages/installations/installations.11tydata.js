module.exports = {
  eleventyComputed: {
    title: data => data.installation?.title || data.title,
    description: data => data.installation ? data.installation.authors?.map(a => a.name).join(' and ') : data.description,
    navlogo: data => data.installation?.navlogo || data.navlogo,
    backgroundcolor: data => data.installation?.backgroundcolor || data.backgroundcolor,
    image: data => data.installation?.heroImage || data.image,
    heroImage: data => data.installation?.heroImage || data.heroImage,
    authors: data => data.installation?.authors || data.authors,
    bodyContent: data => data.installation?.description,
    filmsScreened: data => data.installation?.filmsScreened || data.filmsScreened,
    galleryFolder: data => data.installation?.galleryFolder || data.galleryFolder,
    galleryImages: data => data.installation?.galleryImages || data.galleryImages
  }
};
