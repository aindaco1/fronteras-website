const path = require('node:path');
const sharp = require('sharp');

// Read metadata only; originals and the CI-only optimization pipeline stay intact.
module.exports = async function imageDimensions(url) {
  if (typeof url !== 'string' || !url.startsWith('/img/')) {
    throw new Error('Image dimensions require a local /img/ URL');
  }
  const root = path.resolve(__dirname, '../src/_includes/img');
  const file = path.resolve(root, decodeURI(url.slice('/img/'.length)));
  if (!file.startsWith(root + path.sep)) throw new Error('Image path leaves the media directory');
  const metadata = await sharp(file).metadata();
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error(`Missing image dimensions: ${url}`);
  return `width="${width}" height="${height}"`;
};
