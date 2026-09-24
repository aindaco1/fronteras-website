import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow } from '../../shared/dust-wave-platform/packages/test-core/src/index.js';
import { pages, preparePage } from './pages.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

for (const entry of pages) {
  test(`${entry.id} layout and screenshot`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await preparePage(page, entry.path);
    await expect(page.locator('.notfooter').getByRole('heading', { name: entry.heading, exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page, { expectTarget: expect });
    // Body overflow:hidden can hide clipped content from document-wide checks.
    expect(await page.locator('.bigcontainer > .container').evaluateAll(containers => containers
      .filter(node => node.getBoundingClientRect().right > node.parentElement.getBoundingClientRect().right + 1)
      .map(node => node.innerText))).toEqual([]);
    expect(errors).toEqual([]);
    const grid = page.locator('.grid');
    if (await grid.count()) {
      await expect(page.locator('.grid-col .grid-item').first()).toBeVisible();
      expect(await grid.locator('img').evaluateAll(images => images.every(image =>
        Number(image.getAttribute('width')) > 0 && Number(image.getAttribute('height')) > 0))).toBe(true);
    }
    await expect(page).toHaveScreenshot(`${entry.id}.png`, { fullPage: true });
    if (testInfo.project.name === 'desktop') {
      // Capture only the public page's own opening/content regions, excluding site chrome.
      const candidate = (await page.locator('.bigcontainer').allInnerTexts()).join('\n\n').trim();
      const html = await readFile(`docs${entry.path}index.html`);
      await mkdir('.cache/jev-candidates', { recursive: true });
      await writeFile(`.cache/jev-candidates/${entry.id}.json`, JSON.stringify({
        id: entry.id, candidate, htmlSha256: sha256(html),
        cssSha256: sha256(await readFile('src/_includes/css/index.css')),
      }, null, 2) + '\n');
    }
  });
}

test('navigation opens, closes with Escape, and survives resizing', async ({ page }, testInfo) => {
  await preparePage(page, '/');
  const toggle = page.getByRole('button', { name: 'Toggle navigation', includeHidden: true });
  const currentFilms = page.locator('#navcollapse > a[href="/films/"]');
  if (testInfo.project.name === 'mobile') {
    await expect(currentFilms).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(currentFilms).toBeVisible();
    await expectNoHorizontalOverflow(page, { expectTarget: expect });
    await expect(page).toHaveScreenshot('navigation-open.png');
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(currentFilms).toBeHidden();
    await toggle.click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  }
  await expect(currentFilms).toBeVisible();
  await currentFilms.click();
  await expect(page).toHaveURL(/\/films\/$/);
});
