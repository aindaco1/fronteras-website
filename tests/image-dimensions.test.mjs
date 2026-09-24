import assert from 'node:assert/strict';
import { test } from 'node:test';
import imageDimensions from '../_11ty/imageDimensions.js';

test('gallery images reserve their source aspect ratio without rewriting media', async () => {
  assert.equal(await imageDimensions('/img/films/coyote.jpg'), 'width="1952" height="1090"');
});

test('missing and nonlocal source images fail the build', async () => {
  await assert.rejects(imageDimensions('https://example.com/image.jpg'), /local/);
  await assert.rejects(imageDimensions('/img/../../package.json'), /leaves/);
  await assert.rejects(imageDimensions('/img/missing-image.jpg'));
});
