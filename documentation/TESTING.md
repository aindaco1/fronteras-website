# Regression Testing

Fronteras uses deterministic build checks and browser screenshots for visual
regressions. Jev supplies optional text diagnostics after those checks pass.
[Jev accepts text only](https://docs.typesafe.ai/models); it cannot inspect the
screenshots or approve a visual change.

## Setup and everyday checks

Use Node.js 24 and initialize the pinned dependency:

```bash
git submodule update --init --recursive
npm ci
npm test
npm run build
npm run test:visual:container
```

The container command uses an already running Podman or Docker engine. It mounts
this checkout, uses its installed JavaScript dependencies and built `docs/`, and
runs Playwright 1.62.1 in the matching Ubuntu Noble Linux ARM64 image. On x86
hosts, ARM64 emulation must be available. The first run may download the image.
CI uses the same image on `ubuntu-24.04-arm`. Node packages and the image's
Playwright version must be upgraded together.

For native browser debugging, run `npx playwright install chromium` and
`npm run test:visual`. Baselines are separated by OS and architecture; only the
canonical Linux ARM64 baselines are supplied. A missing baseline fails, including
on an unsupported native platform. Do not compare macOS output to Linux images.
[Playwright documents why the rendering environment must match](https://playwright.dev/docs/test-snapshots).

The suite covers the homepage, current and 2023 film galleries, current
installations, Coyote's film layout, and By Boat's installation/gallery layout.
It captures full pages at 1440×1000 and 390×844, plus the mobile open menu. It also
checks missing images, JavaScript errors, heading visibility, initialized grids,
reserved image dimensions, horizontal overflow, nested container clipping, and
navigation open/close/resize.

Only the year in the copyright signature is normalized. CSS animations are
disabled. External player responses are replaced with empty documents while
preserving their layout boxes. Fonts and images finish loading before capture.
Those choices exclude animation and third-party playback from this suite.
Original local media is used; CI's existing performance checks separately cover
the optimized deployment output. This is representative Chromium coverage,
not all pages, browsers, breakpoints, or live-provider acceptance.

## Reviewing visual changes

Open `playwright-report/index.html` or run `npx playwright show-report` after a
failure. Compare expected, actual, and diff images; traces are in `test-results/`.
Fix unintended differences before updating references. For an intentional change:

```bash
npm run build
npm run test:visual:update
npm run test:visual:container
```

Inspect the changed images in `tests/browser/baselines/linux-arm64/` and commit
them with the corresponding source change. The update command explicitly creates
or replaces baselines; everyday runs never do so. A passing updated screenshot
only records the new appearance, so reviewing the image is essential.

To prove the checks reject broken output:

```bash
npm run test:visual:prove
```

These four opt-in browser controls deliberately hide the home hero and force
horizontal overflow on both viewports. Each must produce the expected assertion
failure. They never edit website source or update baselines. They are skipped in
ordinary runs, and do not represent four additional working site features.

## Optional Jev diagnostics

```bash
npm run test:jev
```

This runs offline tests, rebuilds the site, compares screenshots, and previews
ten requests with **zero provider calls and no credential reads**. Six cases use
the public pages' rendered opening/content text; four are synthetic known-answer
controls. The question asks whether prose reads coherently, including broken
sentences and repeated descriptions. It does not evaluate image layout, dates,
factual accuracy, exact identifiers, or content completeness.

Each successful desktop screenshot test saves its text capture under
`.cache/jev-candidates/`, bound to the generated HTML and CSS hashes. Stale
captures refuse evaluation. The CLI only loads the fixed page list and fixture;
it has no arbitrary file, URL, or private-content input option. Review the preview
before opting into remote evaluation, especially after editing public content.

For an explicit live run, provide `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` through the process environment, then run:

```bash
npm run test:jev -- --live --max-usd 0.02
```

No neighboring project's credentials are discovered or refreshed. No automatic
retries, fallback model, top-up, or purchases are performed. The full batch is
preflighted before authentication: 10 questions maximum, 16,000 UTF-8 request
bytes maximum, and a 15-second timeout per request. A new evidence directory
under `.cache/jev/` is required; `--out NEW_DIRECTORY` selects another new path.

The conservative reservation is $0.01344 for ten full 32k-token questions at the
[published $0.042 per million input tokens](https://docs.typesafe.ai/models),
checked September 24, 2026. This is an estimate, not a billing cap or receipt.
Verify [account pricing](https://developers.cloudflare.com/ai/models/typesafe/jev/)
before a live run. The CLI refuses reservations over $0.10.

Reports retain requests, hashes, model/usage, per-question probability
distributions, timings, and expected control labels outside model inputs. A
pending attempt is checkpointed before transport; persistence failure prevents
the request. After interruption, a pending request may have been billed; do not
silently replay it. Attempt counts are an upper bound when pre-call persistence
or transport fails. Errors and invalid responses stop the batch; unavailable is
unevaluated. Arbitrary provider/debug fields are discarded.

The 0.10 probability margin and recognized `jev-1.13.0` version are provisional
consumer policy in `tests/fixtures/jev.json`. Ties, near ties, uncertainty, and
unknown models require review. Synthetic labels are engineering controls, not
independent human calibration. Offline tests prove a faithful simulator matches
all four controls and a naive keyword judge falsely passes exactly the repeated
and cut-off controls. These simulations establish harness behavior only.

Exit codes: 0 for preview or a fully matching evaluation, 1 for semantic findings
or review, 2 for incomplete/setup failure. Preview stays incomplete and
`releaseAccepted` always stays false. A Jev pass cannot override a screenshot
failure, approve baseline updates, or establish release readiness.

## CI

Normal Build and Deploy runs the offline unit checks before its existing build
and performance checks. In GitHub Actions, manually dispatch **Visual regression
and optional Jev** to run the containerized browser suite and a zero-network
preview. It does not deploy. Enable its `live_jev` input to opt into the bounded
remote evaluation; this requires the two Cloudflare secrets above in this
repository. The workflow uploads screenshots, diffs, traces, and sanitized Jev
reports even when a check fails. A red optional workflow surfaces review work;
it does not change branch protection or the production deployment workflow.

The container explicitly trusts only this checkout and its pinned Platform
submodule for Git operations. This lets the shared pin check inspect both
repositories despite the runner/container ownership difference; it does not
disable the pin assertion or trust arbitrary directories.

## Shared dependency and rollback

The first adoption pins Platform v0.40.0 at
`60d439b887f1244f82ff232c849d74152b28c776`, Test Core 0.3.0 and its Worker Core
0.15.0 dependency. Imports use the pinned submodule's public modules directly,
matching other consumers; no copied client or machine-specific sibling path is
needed. The shared pin assertion verifies the staged gitlink, initialized
checkout, remote, package versions, and Playwright lockfile version.

Platform owns the Jev transport, request/response contracts, review routing,
batch stop behavior, overflow assertion, and pin checker. Fronteras owns pages,
screenshots, captures, questions, labels, limits, credentials, and CI policy.
Other products retain their independent pins.

For upgrades, follow the pinned
[Platform consumer guide](../shared/dust-wave-platform/docs/consumer-adoption.md).
Revert this consumer's integration, package/lockfile, workflows, and submodule
addition together to return to the previous build-only testing arrangement.
There is no data migration or deployed runtime Jev dependency.

## Initial local evidence

The first screenshot repeat exposed image-load-dependent column placement in the
2023 film gallery. The `imageDimensions` shortcode now reads existing source
metadata to reserve the correct aspect ratio in film and installation grids.
It preserves lazy loading and original media. Baselines include this fix.

Visual review also exposed the homepage subtitle spilling outside its mobile
parent. The shared `.container` width is now capped by its parent as well as the
viewport. A browser assertion catches this even when `overflow-x: hidden` hides
the spill from the document-wide overflow check.

Local verification and synthetic controls are development evidence. A remote CI
run, live Jev calibration, and production deployment remain separate checks.

On September 24, 2026, Node 24's full `npm run test:jev` command passed 10 offline
tests, the build/performance checks (83 HTML files), and 14 browser tests. Its
preview prepared 10 questions with zero network attempts. All four explicit
visual mutation controls failed their assertions as expected. Workflow lint,
documentation links, and whitespace checks passed. This initial local run made
no live Jev calls and preceded CI and deployment.

The integration was subsequently merged in
[PR #31](https://github.com/aindaco1/fronteras-website/pull/31).
[Build and Deploy run 35959540256](https://github.com/aindaco1/fronteras-website/actions/runs/35959540256)
passed the optimized build, Pages deployment, cache-rule synchronization, purge,
and live asset-cache checks for commit `a53f3d9`.
