import { test } from 'node:test';
import { assertConsumerPin } from '../shared/dust-wave-platform/packages/test-core/src/consumer-pin.js';
import { fileURLToPath } from 'node:url';

test('Platform and Test Core remain pinned together', () => {
  assertConsumerPin({
    root: fileURLToPath(new URL('../', import.meta.url)),
    expectedCommit: '60d439b887f1244f82ff232c849d74152b28c776',
    packages: { 'test-core': '0.3.0', 'worker-core': '0.15.0' },
    lockfiles: [{ path: 'package-lock.json', packages: { 'node_modules/@playwright/test': '1.62.1' } }],
  });
});
