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

Use Pages CMS to create posts — it provides a form-based editor with all the fields pre-configured. The CMS will handle the frontmatter format automatically.

#### Post Fields

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | Yes | Main headline for the post |
| **Description** | Yes | Short summary for SEO/social sharing (max 160 chars) |
| **Date** | Yes | Publication date and time (use 15:00:00 for consistency) |
| **Tags** | No | Category: event, grant, winners, thanks, announcement (or create new) |
| **Nav Logo** | No | Icon in navigation: installation, cash, trophy, thanks, announcement |
| **Image** | No | Main image displayed as hero at top of post and for social sharing |
| **Social Image Override** | No | Only needed if you want a different image for social previews (e.g., static instead of GIF) |
| **Body** | No | Post content in HTML/Markdown |

#### Manual Frontmatter Format

If editing files directly, posts use this format:

```yaml
---
title: Your Post Title
description: A short description (max 160 characters)
date: 2025-01-15 15:00:00
tags: event
navlogo: installation
layout: layouts/post.njk
image: /img/blog/your-image.jpg
---

Your content goes here in HTML/Markdown format.
```

### Image Guidelines

Images are organized into subdirectories:

| Type | Directory | Usage |
|------|-----------|-------|
| **Post images** | `img/blog/` | Blog post hero images (Pages CMS default) |
| **Sponsor logos** | `img/sponsors/` | Partner and sponsor logos |
| **Branding** | `img/branding/` | Dust Wave logo, Fronteras logo |
| **Site assets** | `img/site/` | Background images, default social images |
| **Films** | `img/films/` | Film stills and thumbnails |
| **Installations** | `img/boat/`, `img/door/`, `img/hands/`, etc. | Installation-specific images |

- Reference images as `/img/blog/filename.jpg`, `/img/sponsors/logo.png`, etc.
- Recommended: Optimize images before uploading (compress, reasonable size)

## For Developers

### Local Development

```bash
npm install
npm start  # Dev server at http://localhost:8080
```

### Deployment

Push to `main` → Auto-syncs to `production` → Builds and deploys via GitHub Actions

The `docs/` directory is generated during build but not committed to the repo.

### Architecture

- **Eleventy v2** static site generator
- **Nunjucks** templates in `src/_includes/layouts/`
- **Sass** styles in `src/_includes/css/`
- **Colcade** for masonry grids

See [AGENTS.md](AGENTS.md) for detailed architecture info.