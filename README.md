# Fronteras Micro-film Festival Website

Website for the [Fronteras Micro-film Festival](https://fronterasmicrofilm.com), showcasing films and installations exploring themes of borders, migration, and identity.

## Edit Content

Use [Pages CMS](https://app.pagescms.org/aindaco1/fronteras-website) to edit Films, Installations, Sponsors, and Posts. The [CMS guide](documentation/CMS-GUIDE.md) covers access, editing, media preparation, and checking publication.

## Quick Start

Use Node.js 24 to match CI, then run:

```bash
npm ci
npm start  # Dev server at http://localhost:8080/
```

For a local production build:

```bash
npm run build  # Website output in docs/; includes performance checks
```

`dev/` and `docs/` contain disposable generated output. `npm start` removes both at startup and shutdown; `npm run build` replaces them and retains `docs/` for inspection. Maintained documentation lives in `documentation/`.

Pull requests run the CI build; pushes to `main` build and deploy to GitHub Pages. See the [development guide](documentation/DEVELOPMENT.md) for architecture, build behavior, deployment setup, and verification.

## Documentation

| Document | Purpose |
|----------|---------|
| [CMS-GUIDE.md](documentation/CMS-GUIDE.md) | Content editing and shared media guidance |
| [DEVELOPMENT.md](documentation/DEVELOPMENT.md) | Development, architecture, conventions, and deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Where to start as a contributor |
| [AGENTS.md](AGENTS.md) | Repository-wide instructions for AI assistants |
