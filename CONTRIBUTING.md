# Contributing to Fronteras Micro-film Festival Website

## For Content Editors

### Using Pages CMS (Recommended)

📖 **[See FRONTERAS-CMS-GUIDE.md](FRONTERAS-CMS-GUIDE.md)** for the complete content editing guide, including:

- Adding and editing Films
- Adding and editing Installations
- Managing Sponsors
- Creating Posts/News
- Uploading images to the Media Library

### Quick Start

1. Go to [pagescms.org/edit/aindaco1/fronteras-website](https://pagescms.org/edit/aindaco1/fronteras-website)
2. Sign in with GitHub credentials
3. Select the collection you want to edit (Films, Installations, Sponsors, Posts)
4. Click **+ New** or select an existing item to edit
5. Fill out the form and click **Save**
6. Changes deploy automatically in 1-2 minutes

### Content Locations

| Content Type | Location | Format |
|--------------|----------|--------|
| Films | `src/extrapages/films/` | Nunjucks (.njk) |
| Installations | `src/extrapages/installations/` | Nunjucks (.njk) |
| Sponsors | `src/extrapages/sponsors/` | Nunjucks (.njk) |
| Posts | `src/posts/` | Markdown (.md) |
| Images | `src/_includes/img/` | JPG, PNG, GIF |

### Image Folders

| Folder | Contents |
|--------|----------|
| `/img/films/` | Film stills, laurel badges |
| `/img/sketches/` | Installation hero images |
| `/img/sponsors/` | Sponsor/partner logos |
| `/img/blog/` | Post header images |
| `/img/[installation-name]/` | Installation gallery photos |
| `/img/branding/` | Dust Wave logo, Fronteras logo |

### Image Specifications

| Type | Dimensions | Max Size | Format |
|------|------------|----------|--------|
| Film Still | 1920px wide | 500KB | JPG |
| Installation Hero | 1920px wide | 500KB | JPG |
| Installation Gallery | 1200px longest side | 300KB | JPG |
| Sponsor Logo | 400-500px square | 200KB | PNG (transparent) |
| Post Header | 1600×900px | 350KB | JPG |
| Laurel Badge | Variable | 100KB | PNG (transparent) |

---

## For Developers

### Local Development

```bash
npm install
npm start  # Dev server at http://localhost:8080
```

### Build

```bash
npm run build  # Compiles Sass and builds Eleventy site to docs/
```

### Deployment

Push to `main` → Auto-syncs to `production` → Builds and deploys via GitHub Actions

The `docs/` directory is generated during build but not committed to the repo.

### Architecture

- **Static Site Generator**: Eleventy v2
- **Templates**: Nunjucks (`.njk`) for layouts, Liquid for Markdown processing
- **Styling**: Sass compiled from `src/_includes/css/index.scss`
- **Masonry Grids**: Colcade library
- **CMS**: Pages CMS (configuration in `.pages.yml`)

### Directory Structure

```
src/
├── _includes/
│   ├── css/           # Sass stylesheets
│   ├── img/           # All images
│   ├── layouts/       # Page templates (base, post, film, installation)
│   └── components/    # Reusable template components
├── posts/             # Blog posts (Markdown)
└── extrapages/
    ├── films/         # Film pages (Nunjucks)
    ├── installations/ # Installation pages (Nunjucks)
    └── sponsors/      # Sponsor entries (Nunjucks)
```

### Key Files

| File | Purpose |
|------|---------|
| `.eleventy.js` | Eleventy configuration |
| `.pages.yml` | Pages CMS schema and field definitions |
| `src/_includes/css/index.scss` | Main stylesheet entry point |
| `src/_includes/layouts/base.njk` | Base HTML template |
| `src/_includes/layouts/film.njk` | Film page template |
| `src/_includes/layouts/installation.njk` | Installation page template |
| `src/_includes/layouts/post.njk` | Blog post template |

### Adding New Fields to CMS

Edit `.pages.yml` to add new fields to collections. See [Pages CMS documentation](https://pagescms.org/docs) for field types and options.

### Code Style

- **Indentation**: 2 spaces
- **Line endings**: LF
- **Sass**: Use `math.div()` for division, not `/`
- **Templates**: Nunjucks for layouts, Liquid for Markdown content

See [AGENTS.md](AGENTS.md) for complete development conventions.
