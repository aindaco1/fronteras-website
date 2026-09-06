# Development Guide

For developers maintaining the Fronteras website. See [CMS-GUIDE.md](CMS-GUIDE.md) for content editing and [CONTRIBUTING.md](../CONTRIBUTING.md) for documentation conventions.

## Local Setup

Use Node.js 24 to match the [GitHub Actions workflow](../.github/workflows/build-deploy.yml). From the repository root:

```bash
npm ci
npm start
```

The site is available at http://localhost:8080/ with Sass and Eleventy watching for changes. The development server writes lightweight generated pages to `dev/` and serves large passthrough assets directly from `src/`.

The [development runner](../scripts/start.js) removes both `dev/` and `docs/` at startup and shutdown, including Ctrl-C and normal termination. Source files and compiled local CSS remain under `src/`.

## Commands and Output

Run these commands from the repository root. [package.json](../package.json) defines the scripts.

| Command | Behavior |
|---------|----------|
| `npm start` | Starts the local development server and manages generated-output cleanup |
| `npm run build` | Cleans output, compiles Sass, builds the production site, and runs local performance checks |
| `npm run sass` | Compiles `src/_includes/css/index.scss` to compressed `index.css` without a source map |
| `npm run clean` | Removes `dev/` and `docs/` |
| `npm run test:performance` | Checks an existing production build in `docs/`; already included in `npm run build` |
| `npm run build:ci` | GitHub Actions only: builds, optimizes media, and validates the optimized output |
| `npm run test:performance:ci` | Checks an existing optimized build in `docs/`; included in `npm run build:ci` |

`npm run build` leaves the generated `docs/` directory available for local inspection and retains original media formats. Both output directories are ignored by Git. Store maintained documentation in `documentation/`; `docs/` is the website artifact uploaded for deployment.

### CI Media Processing

[optimize-media.mjs](../scripts/optimize-media.mjs) refuses to run outside GitHub Actions. The workflow installs FFmpeg and caches optimized media in `.cache/media`.

After the production build, the optimizer:

- Converts referenced JPG and PNG files to WebP when the result is smaller.
- Transcodes referenced MP4 and WebM files to VP9/Opus WebM.
- Writes media under `/assets/img/` with content hashes in filenames, rewrites generated references, and removes the raw output `img/` directory.
- Preserves the original media in `src/`.

CI defaults can be adjusted with `MEDIA_IMAGE_QUALITY` (80), `MEDIA_VIDEO_CRF` (40), and `MEDIA_VIDEO_MAX_DIMENSION` (1280 pixels).

## Architecture

- **Static site generator:** Eleventy v3, configured in [.eleventy.js](../.eleventy.js).
- **Templates:** Nunjucks layouts and HTML processing; Liquid processing for Markdown. Page source formats include `.md`, `.njk`, `.html`, and `.liquid`.
- **Styling:** Sass, compiled from [index.scss](../src/_includes/css/index.scss).
- **CMS:** Pages CMS, with collection paths, fields, defaults, and media upload folders defined in [.pages.yml](../.pages.yml).
- **Collections:** Posts in `src/posts/`, custom tags via [_11ty/getTagList.js](../_11ty/getTagList.js), and film, installation, and sponsor collections defined in `.eleventy.js`. Festival collections currently filter the 2023 and 2025 editions.
- **Site metadata:** [metadata.json](../src/_data/metadata.json); the configured domain is `fronterasmicrofilm.com`, also used in [CNAME](../CNAME) and the sitemap configuration.

### Source Map

| Location | Purpose |
|----------|---------|
| `src/_data/` | Shared metadata, navigation, and content data |
| `src/_includes/layouts/` | Base, page, post, film, installation, and redirect templates |
| `src/_includes/components/` | Shared navigation, header, footer, icons, and post-list components |
| `src/_includes/css/` | Sass source and compiled local CSS |
| `src/_includes/img/` | Original images, videos, and other downloadable media |
| `src/_includes/js/` | Browser scripts, including Colcade |
| `src/_includes/fonts/` | Local font assets; Roboto Mono is supplied by `@fontsource/roboto-mono` |
| `src/_includes/favicons/` | Favicons and related metadata |
| `src/posts/` | Blog posts in Markdown |
| `src/extrapages/films/` | Film entries in Nunjucks with YAML front matter |
| `src/extrapages/installations/` | Installation entries in Nunjucks with YAML front matter |
| `src/extrapages/sponsors/` | Sponsor entries in Nunjucks with YAML front matter |

The [base layout](../src/_includes/layouts/base.njk) provides the shared page shell; [film](../src/_includes/layouts/film.njk), [installation](../src/_includes/layouts/installation.njk), and [post](../src/_includes/layouts/post.njk) layouts render those content types.

Eleventy assigns content hashes to the compiled stylesheet, Colcade script, and four font files, and copies them under `/assets/`. It also passes through original media, favicons, `CNAME`, and `.nojekyll`. CI then fingerprints and optimizes media as described above.

### Code Conventions

- Use two-space indentation, UTF-8, LF line endings, a final newline, and no trailing whitespace, as specified in [.editorconfig](../.editorconfig).
- Use `math.div()` from `sass:math` for Sass division.
- Use Luxon through the `readableDate` and `htmlDateString` filters. Format display dates as `dd LLL yyyy` in UTC.
- Reuse the existing layouts and components. Use Colcade for two-column masonry grids and initialize it inside `window.addEventListener('load', ...)`.
- When adding CMS fields, update `.pages.yml`, the relevant layout or collection logic, and the corresponding section of the CMS guide together. Check existing entries as well as newly created content. Adding a festival year also requires reviewing Eleventy's year-specific collections and the pages that consume them.

## Validation

For code, template, stylesheet, or content changes, run `npm run build` and inspect affected pages in the local browser. The build already runs [validate-performance.mjs](../scripts/validate-performance.mjs), which checks generated HTML and assets for:

- Hashed stylesheet and font references, the expected four local font files, and removal of retired external fonts and libraries.
- Homepage image-loading priorities and navigation-toggle markup.
- Deferred Colcade loading on the film and installation pages that use masonry.
- Existence of referenced core assets on the homepage and films page.

The CI check additionally requires fingerprinted media, verifies its referenced files, and rejects remaining raw media references or the raw `docs/img/` output directory. These are generated-output checks; inspect the rendered site to assess layout and interaction.

For changes limited to repository documentation, check relative links, heading anchors, filenames, and `git diff --check`. These guides are outside Eleventy's `src/` input, so a website build is not needed solely to validate prose or documentation moves.

## Deployment

The [Build and Deploy workflow](../.github/workflows/build-deploy.yml) runs on pull requests targeting `main`, pushes to `main`, and manual dispatches. Pull requests build and validate without deploying. Pushes to `main` and manual dispatches also upload and deploy the generated `docs/` artifact to GitHub Pages.

The build job uses Node.js 24, installs locked dependencies with `npm ci`, restores the media cache, installs FFmpeg, and runs `npm run build:ci`.

### Repository Settings

In repository **Settings → Pages**, use **GitHub Actions** as the source.

When Cloudflare integration is configured, set the repository variable `CLOUDFLARE_ENABLED` to `true` and provide the secrets used by the current workflow: `CLOUDFLARE_ZONE`, `CLOUDFLARE_EMAIL`, and `CLOUDFLARE_KEY`. Cache-rule synchronization also accepts `CLOUDFLARE_API_TOKEN` and prefers it when present; the purge action still uses the email/key secrets.

With Cloudflare enabled, the deploy job runs these steps after publishing to Pages:

1. [Synchronize cache rules](../scripts/sync-cloudflare-cache-rules.mjs) for the site's `/assets/` URLs, including one-year caching and immutable response headers.
2. Purge the Cloudflare cache.
3. [Verify production assets](../scripts/verify-production-assets.mjs) by fetching the live homepage and checking a hashed stylesheet, font, and image. Each asset must return successfully with the expected cache headers and reach a Cloudflare `HIT` on a repeat fetch.

The live verification script defaults to 36 attempts with five seconds between attempts. `PRODUCTION_VERIFY_ATTEMPTS` and `PRODUCTION_VERIFY_DELAY_MS` override those defaults. The read-only check can also be run manually against the configured production site:

```bash
node scripts/verify-production-assets.mjs
```

A successful local build establishes local output validity. Check the relevant workflow run for deployment results, and check the live site for published content. If a cache step fails after the Pages deployment succeeds, inspect that step separately: publication may already have completed. Cloudflare steps are skipped when its integration variable is not enabled.

The repository also retains [netlify.toml](../netlify.toml), configured to run the local production build and publish `docs/`. The deployment workflow described here uses GitHub Pages.
