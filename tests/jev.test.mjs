import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { controls, evaluate, fixture, prepareCases, validatePlan } from '../scripts/evaluate-jev.mjs';

// Deliberately narrow simulators, not semantic evaluators or calibration evidence.
const faithful = candidate => /because$/.test(candidate) || candidate.split('An installation').length > 2 ? 'fail' : 'pass';
const naive = candidate => /installation/.test(candidate) ? 'pass' : 'fail';
const response = (request, judge = faithful, model = 'jev-1.13.0') => {
  const choice = judge(request.input.state.candidate);
  return { model, usage: { input_tokens: 0, output_tokens: 0 }, answers: { coherence: {
    type: 'choice', choice, probabilities: { pass: choice === 'pass' ? 1 : 0, fail: choice === 'fail' ? 1 : 0, uncertain: 0 },
  } } };
};

test('frozen controls expose exactly the two predicted naive false passes', async () => {
  const faithfulReport = await evaluate(controls(), { call: async request => response(request) });
  assert.equal(faithfulReport.status, 'pass');
  const naiveReport = await evaluate(controls(), { call: async request => response(request, naive) });
  const falsePassIds = naiveReport.cases.filter(row => row.expected === 'fail' && row.result.findings.coherence.decision === 'pass').map(row => row.id);
  assert.deepEqual(falsePassIds, ['control-repeated', 'control-cut-off']);
  assert.equal(naiveReport.status, 'review');
  assert.equal(faithfulReport.releaseAccepted, false);
});

test('preview is incomplete and sends no labels in model inputs', async () => {
  const report = await evaluate(controls());
  assert.equal(report.networkAttempts, 0);
  assert.equal(report.complete, false);
  assert.equal(report.status, 'preview');
  for (const row of report.cases) {
    assert.deepEqual(Object.keys(row.request.input.state), ['candidate']);
    assert.equal(row.request.input.questions.coherence.instructions.includes('expected'), false);
  }
});

test('unknown model and near ties cannot become a pass', async () => {
  const unknown = await evaluate(controls(), { call: async request => response(request, faithful, 'jev-9.0.0') });
  assert.equal(unknown.status, 'review');
  const tied = await evaluate(controls(), { call: async request => {
    const raw = response(request);
    raw.answers.coherence = { type: 'choice', choice: 'pass', probabilities: { pass: 0.5, fail: 0.49, uncertain: 0.01 } };
    return raw;
  } });
  assert.equal(tied.status, 'review');
  assert.equal(tied.cases[0].result.findings.coherence.decision, 'review');
});

test('provider failure stops after one attempt and drops arbitrary provider data', async () => {
  let calls = 0;
  const report = await evaluate(controls(), { call: async () => { calls++; throw new Error('private provider detail'); } });
  assert.equal(calls, 1);
  assert.equal(report.status, 'incomplete');
  assert.equal(JSON.stringify(report).includes('private provider detail'), false);
  const completed = await evaluate(controls(), { call: async request => ({ ...response(request), debug: 'private provider detail' }) });
  assert.equal(JSON.stringify(completed).includes('private provider detail'), false);
});

test('pending evidence is saved before transport and a failed checkpoint blocks transport', async () => {
  let pending;
  let calls = 0;
  await evaluate(controls(), { persist: async report => { pending = report.pending; }, call: async request => {
    assert.ok(pending?.requestSha256);
    calls++;
    return response(request);
  } });
  assert.equal(calls, 4);
  calls = 0;
  const report = await evaluate(controls(), {
    persist: async report => { if (report.pending) throw new Error('Disk full'); },
    call: async () => { calls++; },
  });
  assert.equal(calls, 0);
  assert.equal(report.status, 'incomplete');
});

test('whole batch is bounded before any provider call', async () => {
  let calls = 0;
  await assert.rejects(evaluate([...controls(), { id: 'oversized', candidate: 'x'.repeat(32_000), requirements: { coherence: fixture.requirement } }],
    { call: async () => { calls++; } }));
  assert.equal(calls, 0);
  assert.throws(() => validatePlan(Array.from({ length: 11 }, (_, i) => ({ ...controls()[0], id: String(i) }))));
});

test('stale browser evidence is refused', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fronteras-jev-'));
  try {
    await mkdir(join(root, '.cache/jev-candidates'), { recursive: true });
    await mkdir(join(root, 'src/_includes/css'), { recursive: true });
    await mkdir(join(root, 'docs'));
    await writeFile(join(root, 'src/_includes/css/index.css'), 'css');
    await writeFile(join(root, 'docs/index.html'), 'changed build');
    await writeFile(join(root, '.cache/jev-candidates/home.json'), JSON.stringify({
      id: 'home', candidate: 'Old text', htmlSha256: 'stale',
      cssSha256: createHash('sha256').update('css').digest('hex'),
    }));
    await assert.rejects(prepareCases(root), /Stale rendered capture/);
  } finally { await rm(root, { recursive: true }); }
});
