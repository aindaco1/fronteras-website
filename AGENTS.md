# AGENTS.md

## Project Guidance

- Read [DEVELOPMENT.md](documentation/DEVELOPMENT.md) for architecture, code conventions, build behavior, and deployment verification before changing code or tooling.
- Read [CMS-GUIDE.md](documentation/CMS-GUIDE.md) when changing content or CMS fields; the configured schema is `.pages.yml`.
- Follow [CONTRIBUTING.md](CONTRIBUTING.md#documentation-changes) for documentation placement and uppercase filenames. Keep detailed procedures in the relevant guide.

## Commands

- **Dev**: `npm start` (Sass + Eleventy at http://localhost:8080/)
- **Build**: `npm run build` (local production output plus performance checks)
- **CI build**: `npm run build:ci` (GitHub Actions only; media optimization and additional checks)

## Generated Output

- `src/` contains website source; `documentation/` contains maintained guides.
- `dev/` and `docs/` are disposable, ignored build output. `npm start` cleans both at startup and shutdown; `npm run build` cleans both and retains its generated `docs/` output.
- Preserve original media in `src/`. Run media optimization only through GitHub Actions.
