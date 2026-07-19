# AGENTS.md

## Commands

- **Dev**: `npm start` (runs Sass + Eleventy with hot reload at http://localhost:8080/; writes lightweight pages to `dev/` and cleans `dev/` plus `docs/` on startup and shutdown)
- **Build**: `npm run build` (cleans output, compiles Sass, builds Eleventy site with original media in `docs/`)
- **CI build**: `npm run build:ci` (GitHub Actions only; optimizes referenced images and videos after the production build)

## Architecture

- **SSG**: Eleventy v2 static site generator
- **Input**: `src/` directory (Markdown, Nunjucks, HTML, Liquid templates)
- **Dev output**: `dev/` directory (generated pages only; large passthrough assets are served directly from `src/`; removed when `npm start` stops)
- **Production output**: `docs/` directory (generated, not committed; retained by `npm run build`, cleaned by `npm start`, and deployed via GitHub Actions)
- **Templates**: Nunjucks (`.njk`) for layouts, Liquid for Markdown processing
- **Styling**: Sass compiled from `src/_includes/css/index.scss` (uses `sass:math` for division)
- **Collections**: Posts in `src/posts/`, custom tag collections via `_11ty/getTagList`
- **Deployment**: Pull requests run the CI build; pushes to `main` optimize referenced JPG/PNG files to WebP, transcode referenced MP4/WebM files to VP9/Opus WebM, and deploy to GitHub Pages

## Code Style

- **Indentation**: 2 spaces (per `.editorconfig`)
- **Line endings**: LF, trim trailing whitespace, UTF-8 charset
- **Template formats**: `.md`, `.njk`, `.html`, `.liquid` for pages
- **Filters**: Use Luxon for date formatting (`readableDate`, `htmlDateString`)
- **Dates**: UTC zone, format "dd LLL yyyy" for display
- **Passthrough**: Assets in `src/_includes/{img,css,js,fonts,favicons}`, CNAME, .nojekyll
- **Masonry grid**: Use Colcade library with 2-column grid, wrap init in `window.addEventListener('load')`
- **Sass**: Use `math.div()` for division, not `/`
