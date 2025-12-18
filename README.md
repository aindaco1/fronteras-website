## Getting Started

1. Clone the repo
2. Run `npm install`
3. Run `npm start` to start dev server with hot reload at http://localhost:8080/
4. Run `npm run build` to build locally (outputs to `docs/` directory)

## Deployment

The site is automatically built and deployed via GitHub Actions on push to `production`. The workflow:

1. Installs dependencies
2. Builds the site with `npm run build`
3. Deploys to GitHub Pages
4. Optionally purges Cloudflare cache (if `CLOUDFLARE_ENABLED` variable is set to `true`)

### Branching Strategy

- `main` - Content and development changes
- `production` - Auto-synced from `main`, triggers build & deploy

Pushes to `main` automatically fast-forward merge to `production`, triggering deployment. If you need manual control, disable the "Sync main to production" workflow in Actions.

### GitHub Settings Required

1. Go to repo Settings → Pages → Source: set to "GitHub Actions"
2. Create a `production` branch from `main`
3. (Optional) For Cloudflare cache purging, add these secrets:
   - `CLOUDFLARE_ZONE`
   - `CLOUDFLARE_EMAIL`
   - `CLOUDFLARE_KEY`
   - And set variable `CLOUDFLARE_ENABLED` to `true`
