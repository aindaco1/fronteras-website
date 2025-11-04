# AGENTS.md

## Commands
- **Build**: `npm run build` (compiles Sass and builds Eleventy site)
- **Dev**: `npm start` (runs Sass + Eleventy with hot reload at http://localhost:8080/)
- **Serve**: `npm run serve` (start dev server only)
- **Watch**: `npm run watch` (watch for changes without server)
- **Debug**: `npm run debug` (verbose Eleventy debugging)

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
- **Passthrough**: Assets in `src/_includes/{img,css,js,fonts,favicons}` copied to output
