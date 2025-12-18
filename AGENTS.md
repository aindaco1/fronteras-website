# AGENTS.md

## Commands

- **Dev**: `npm start` (runs Sass + Eleventy with hot reload at http://localhost:8080/)
- **Build**: `npm run build` (cleans output, compiles Sass, builds Eleventy site)

## Architecture

- **SSG**: Eleventy v2 static site generator
- **Input**: `src/` directory (Markdown, Nunjucks, HTML, Liquid templates)
- **Output**: `docs/` directory (generated locally, not committed - deployed via GitHub Actions)
- **Templates**: Nunjucks (`.njk`) for layouts, Liquid for Markdown processing
- **Styling**: Sass compiled from `src/_includes/css/index.scss` (uses `sass:math` for division)
- **Collections**: Posts in `src/posts/`, custom tag collections via `_11ty/getTagList`
- **Deployment**: GitHub Actions builds on push to `main`, deploys to GitHub Pages

## Code Style

- **Indentation**: 2 spaces (per `.editorconfig`)
- **Line endings**: LF, trim trailing whitespace, UTF-8 charset
- **Template formats**: `.md`, `.njk`, `.html`, `.liquid` for pages
- **Filters**: Use Luxon for date formatting (`readableDate`, `htmlDateString`)
- **Dates**: UTC zone, format "dd LLL yyyy" for display
- **Passthrough**: Assets in `src/_includes/{img,css,js,fonts,favicons}`, CNAME, .nojekyll
- **Masonry grid**: Use Colcade library with 2-column grid, wrap init in `window.addEventListener('load')`
- **Sass**: Use `math.div()` for division, not `/`