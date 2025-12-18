# Fronteras Microfilm Festival Website

## Getting Started

1. Clone the repo
2. Run `npm install`
3. Run `npm start` to start dev server with hot reload at http://localhost:8080/

## Deployment

The site is automatically built and deployed via GitHub Actions on push to `main`. The workflow:

1. Syncs `main` to `production` branch
2. Builds the site with `npm run build`
3. Deploys to GitHub Pages
4. Optionally purges Cloudflare cache

### Branching Strategy

- `main` - Content and development changes (push here)
- `production` - Auto-synced from `main`, used for deployment

Pushes to `main` automatically sync to `production` and trigger deployment.

### GitHub Settings Required

1. Go to repo Settings → Pages → Source: set to **"GitHub Actions"**
2. (Optional) For Cloudflare cache purging, add these secrets:
   - `CLOUDFLARE_ZONE`
   - `CLOUDFLARE_EMAIL`
   - `CLOUDFLARE_KEY`
   - And set variable `CLOUDFLARE_ENABLED` to `true`

## Content Editing

Non-technical editors can use [Pages CMS](https://pagescms.org) to edit content:

1. Sign in with GitHub at [pagescms.org](https://pagescms.org)
2. Select the fronteras-website repository
3. Edit posts, upload images, and publish — changes deploy automatically!

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed content editing and development guidelines.