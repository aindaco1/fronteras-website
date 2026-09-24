// Development-only text diagnostics. Pixel comparisons remain authoritative for visuals.
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createJevRequest, evaluateJevCases, callCloudflareJev } from '../shared/dust-wave-platform/packages/test-core/src/jev.js';
import { pages } from '../tests/browser/pages.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const fixtureURL = new URL('../tests/fixtures/jev.json', import.meta.url);
export const fixture = JSON.parse(await readFile(fixtureURL, 'utf8'));
export const limits = { questions: 10, requestBytes: 16_000, timeoutMs: 15_000 };

export function controls() {
  return fixture.controls.map(({ id, candidate, expected }) => ({
    id: `control-${id}`, candidate, requirements: { coherence: fixture.requirement }, expected,
  }));
}

export function validatePlan(cases) {
  const requests = cases.map(row => createJevRequest(row.candidate, row.requirements));
  const questions = requests.reduce((sum, request) => sum + Object.keys(request.input.questions).length, 0);
  if (!cases.length || new Set(cases.map(row => row.id)).size !== cases.length || questions > limits.questions ||
      requests.some(request => Buffer.byteLength(JSON.stringify(request)) > limits.requestBytes)) {
    throw new Error('Jev batch exceeds its frozen request or question limits');
  }
  // Conservative reservation: full model context per question, not measured billing.
  return { questions, requests: cases.length, estimatedUsd: questions * 32_000 * 0.042 / 1_000_000,
    priceBasis: 'TypeSafe published input rate $0.042/M, checked 2026-09-24; verify account pricing before live use' };
}

export async function prepareCases(root = '.') {
  const cases = controls();
  const cssSha256 = hash(await readFile(resolve(root, 'src/_includes/css/index.css')));
  for (const page of pages) {
    const capture = JSON.parse(await readFile(resolve(root, `.cache/jev-candidates/${page.id}.json`), 'utf8'));
    const htmlSha256 = hash(await readFile(resolve(root, `docs${page.path}index.html`)));
    if (capture.id !== page.id || capture.htmlSha256 !== htmlSha256 || capture.cssSha256 !== cssSha256) {
      throw new Error('Stale rendered capture; rerun the browser suite');
    }
    cases.push({ id: page.id, candidate: capture.candidate, requirements: { coherence: fixture.requirement },
      htmlSha256, cssSha256 });
  }
  validatePlan(cases);
  return cases;
}

// Shared batch handling owns response validation, stop-on-error, and review routing.
// The thin adapter adds consumer provenance and a durable pending checkpoint before transport.
export async function evaluate(cases, { call, persist = async () => {} } = {}) {
  const budget = validatePlan(cases);
  const metadata = { corpusSha256: hash(JSON.stringify(cases)), policySha256: hash(JSON.stringify(fixture)),
    platformCommit: '60d439b887f1244f82ff232c849d74152b28c776', testCoreVersion: '0.3.0',
    labelProvenance: fixture.labelProvenance, budget, visualJudgment: false };
  let latest;
  let attempts = 0;
  const snapshot = shared => ({ ...metadata, ...shared, cases: shared.cases.map((row, index) => {
    const { raw, ...safe } = row; // Keep validated distributions, never arbitrary provider metadata.
    if (safe.result && !/^jev-\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(safe.result.model)) {
      throw new Error('Unexpected provider model identifier');
    }
    return { ...safe, expected: cases[index].expected ?? null };
  }) });
  const report = await evaluateJevCases(cases, {
    policy: fixture.policy, maxQuestions: limits.questions,
    call: call && (async request => {
      await persist({ ...latest, networkAttempts: ++attempts, pending: {
        id: cases[attempts - 1].id, requestSha256: hash(JSON.stringify(request)),
      } });
      return call(request);
    }),
    onProgress: async shared => { latest = snapshot(shared); await persist(latest); },
  });
  const result = snapshot(report);
  result.status = !call ? 'preview' : !report.complete ? 'incomplete' : report.cases.every((row, index) =>
    Object.values(row.result.findings).every(finding => finding.decision === (cases[index].expected ?? 'pass')))
    ? 'pass' : 'review';
  await persist(result);
  return result;
}

async function main() {
  const { values } = parseArgs({ options: {
    live: { type: 'boolean' }, 'max-usd': { type: 'string' }, out: { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('node scripts/evaluate-jev.mjs [--live --max-usd 0.02] [--out NEW_DIRECTORY]\nDefault: zero-network preview of captures from the passing browser suite.');
    return;
  }
  const cases = await prepareCases(); // Whole batch validated before credential access.
  const budget = validatePlan(cases);
  const maxUsd = Number(values['max-usd']);
  if (values.live && (!Number.isFinite(maxUsd) || maxUsd < budget.estimatedUsd || maxUsd > 0.1)) {
    throw new Error(`Live run requires --max-usd between ${budget.estimatedUsd} and 0.10 (estimate, not a billing cap)`);
  }
  const output = resolve(values.out || `.cache/jev/${new Date().toISOString().replace(/[:.]/g, '-')}`);
  await mkdir(resolve(output, '..'), { recursive: true });
  await mkdir(output); // Existing evidence may never be silently overwritten/replayed.
  const persist = async report => {
    await writeFile(`${output}/report.tmp`, JSON.stringify(report, null, 2) + '\n');
    await rename(`${output}/report.tmp`, `${output}/report.json`);
  };
  let call;
  if (values.live) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!/^[a-f0-9]{32}$/i.test(accountId || '') || !token?.trim()) throw new Error('Set Cloudflare account and API token in the environment');
    call = request => callCloudflareJev(request, { accountId, token, timeoutMs: limits.timeoutMs });
  }
  const report = await evaluate(cases, { call, persist });
  console.log(`Jev ${report.status}: ${output}/report.json (${report.networkAttempts} network attempts)`);
  process.exitCode = report.status === 'incomplete' ? 2 : report.status === 'review' ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 2; });
}
