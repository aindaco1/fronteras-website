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

### Build

```bash
npm run build  # Output to docs/
```

## Deployment

The site automatically builds and deploys via GitHub Actions on push to `main`:

1. Syncs `main` → `production` branch
2. Builds with `npm run build`
3. Deploys to GitHub Pages
4. Optionally purges Cloudflare cache

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
