# Fronteras Micro-film Festival Website

Website for the [Fronteras Micro-film Festival](https://fronterasfilmfestival.com), showcasing films and installations exploring themes of borders, migration, and identity.

## Content Management

Non-technical editors can use [Pages CMS](https://pagescms.org) to manage all content:

1. Go to [pagescms.org/edit/aindaco1/fronteras-website](https://pagescms.org/edit/aindaco1/fronteras-website)
2. Sign in with GitHub credentials
3. Edit Films, Installations, Sponsors, or Posts

📖 **[See the full CMS Guide](FRONTERAS-CMS-GUIDE.md)** for detailed instructions on adding and editing content.

## Development

### Getting Started

```bash
npm install
npm start  # Dev server at http://localhost:8080/
```

`npm start` writes lightweight generated pages to `dev/` and serves large assets
directly from `src/`. It removes both `dev/` and `docs/` at startup and whenever
the server stops, including Ctrl-C and normal termination. Source files needed
for development and testing remain in `src/`.

### Build

```bash
npm run build  # Output to docs/
```

The production build leaves `docs/` in place so it can be inspected locally.
It retains original media; GitHub Actions performs the deployment optimization.

### CI Media Build

`npm run build:ci` is reserved for GitHub Actions. After the production build it:

- Converts referenced JPG and PNG files to WebP when that makes them smaller
- Transcodes referenced MP4 and WebM files to VP9/Opus WebM, capped at 1280px
- Rewrites generated HTML and CSS to use the optimized files
- Leaves the original files in `src/` unchanged

The defaults can be adjusted in CI with `MEDIA_IMAGE_QUALITY`,
`MEDIA_VIDEO_CRF`, and `MEDIA_VIDEO_MAX_DIMENSION`.

## Deployment

Pull requests run a build check. Pushes to `main` automatically build and deploy:

1. Installs the locked dependencies with Node.js 24
2. Builds and optimizes media with `npm run build:ci`
3. Deploys the generated `docs/` artifact to GitHub Pages
4. Optionally purges the Cloudflare cache

### GitHub Settings Required

1. Go to repo Settings → Pages → Source: set to **"GitHub Actions"**
2. (Optional) For Cloudflare cache purging, add secrets:
   - `CLOUDFLARE_ZONE`, `CLOUDFLARE_EMAIL`, `CLOUDFLARE_KEY`
   - Set variable `CLOUDFLARE_ENABLED` to `true`

## Documentation

| Document | Description |
|----------|-------------|
| [FRONTERAS-CMS-GUIDE.md](FRONTERAS-CMS-GUIDE.md) | Complete guide to adding/editing content via Pages CMS |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guidelines and architecture |
| [AGENTS.md](AGENTS.md) | AI assistant configuration and commands |
