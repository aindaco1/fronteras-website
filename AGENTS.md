# AGENTS.md

## Project Guidance

- Read [DEVELOPMENT.md](documentation/DEVELOPMENT.md) for architecture, code conventions, build behavior, and deployment verification before changing code or tooling.
- Read [CMS-GUIDE.md](documentation/CMS-GUIDE.md) when changing content or CMS fields; the configured schema is `.pages.yml`.
- Read [TESTING.md](documentation/TESTING.md) for visual baselines, shared Platform helpers, and optional Jev evaluation.
- Follow [CONTRIBUTING.md](CONTRIBUTING.md#documentation-changes) for documentation placement and uppercase filenames. Keep detailed procedures in the relevant guide.

## Commands

- **Dev**: `npm start` (Sass + Eleventy at http://localhost:8080/)
- **Build**: `npm run build` (local production output plus performance checks)
- **CI build**: `npm run build:ci` (GitHub Actions only; media optimization and additional checks)
- **Offline tests**: `npm test`
- **Visual checks**: `npm run build && npm run test:visual:container`
- **Jev preview**: `npm run test:jev` (includes build and browser checks; zero provider calls)
- **Artifact cleanup**: `npm run clean:artifacts`

## Generated Output

- `src/` contains website source; `documentation/` contains maintained guides.
- `dev/` and `docs/` are disposable, ignored build output. `npm start` cleans both at startup and shutdown; `npm run build` cleans both and retains its generated `docs/` output.
- Preserve original media in `src/`. Run media optimization only through GitHub Actions.
- Keep the pinned submodule, lockfile, fixtures, and screenshot baselines. Test reports and `.cache/jev*` are generated evidence; retain any needed live-run evidence before cleanup.
