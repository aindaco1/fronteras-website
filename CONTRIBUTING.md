# Contributing to Fronteras Microfilm Festival Website

## For Content Editors (Non-Technical)

### Using Pages CMS (Recommended)

1. Go to [pagescms.org](https://pagescms.org) and sign in with GitHub
2. Select the fronteras-website repository
3. Edit posts, upload images, and publish — changes deploy automatically!

### Content Locations

| Content Type | Location | Format |
|--------------|----------|--------|
| Blog posts | `src/posts/` | Markdown (.md) |
| Images | `src/_includes/img/` | JPG, PNG, GIF |
| Films | `src/extrapages/films/` | Nunjucks (.njk) |
| Installations | `src/extrapages/installations/` | Nunjucks (.njk) |

### Creating a New Blog Post

Posts need this format at the top (called "frontmatter"):

```yaml
---
title: Your Post Title
description: A short description (max 160 characters)
date: 2025-01-15 12:00:00
tags: event
layout: layouts/post.njk
image: /img/your-image.jpg
---

Your content goes here in Markdown format.
```

### Image Guidelines

- Upload images to `src/_includes/img/` (or subdirectory like `img/blog/`)
- Reference images as `/img/filename.jpg` in your content
- Recommended: Optimize images before uploading (compress, reasonable size)

## For Developers

### Local Development

```bash
npm install
npm start  # Dev server at http://localhost:8080
```

### Deployment

Push to `main` → Auto-syncs to `production` → Builds and deploys via GitHub Actions

### Architecture

- **Eleventy v2** static site generator
- **Nunjucks** templates in `src/_includes/layouts/`
- **Sass** styles in `src/_includes/css/`
- **Colcade** for masonry grids

See [AGENTS.md](AGENTS.md) for detailed architecture info.
