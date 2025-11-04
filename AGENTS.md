# AGENTS.md

## Commands
- **Build**: `npm run build` (cleans docs/, compiles Sass, builds Eleventy site)
- **Dev**: `npm start` (runs Sass + Eleventy with hot reload at http://localhost:8080/)

## Architecture
- **SSG**: Eleventy v2 static site generator
- **Input**: `src/` directory (Markdown, Nunjucks, HTML, Liquid templates)
- **Output**: `docs/` directory (static HTML site)
- **Templates**: Nunjucks (`.njk`) for layouts, Liquid for Markdown processing
- **Styling**: Sass (compiled from `src/_includes/css/index.scss`)
- **Collections**: Posts in `src/posts/`, custom tag collections via `_11ty/getTagList`

## Code Style
- **Indentation**: 2 spaces (per `.editorconfig`)
- **Line endings**: LF, trim trailing whitespace, UTF-8 charset
- **Template formats**: `.md`, `.njk`, `.html`, `.liquid` for pages
- **Filters**: Use Luxon for date formatting (`readableDate`, `htmlDateString`)
- **Dates**: UTC zone, format "dd LLL yyyy" for display
- **Passthrough**: Assets in `src/_includes/{img,css,js,fonts,favicons}`, CNAME, .nojekyll copied to output
- **Masonry grid**: Use Colcade library with 2-column grid structure, wrap initialization in `window.addEventListener('load')`
