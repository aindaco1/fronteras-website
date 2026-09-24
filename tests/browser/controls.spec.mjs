import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow } from '../../shared/dust-wave-platform/packages/test-core/src/index.js';
import { preparePage } from './pages.mjs';

test.skip(process.env.VISUAL_CONTROLS !== '1', 'Run explicitly with npm run test:visual:prove');

test('@control screenshot comparison detects a hidden hero', async ({ page }) => {
  await preparePage(page, '/');
  await expect(page).toHaveScreenshot('home.png', { fullPage: true });
  await page.addStyleTag({ content: '.home-info-hero { visibility: hidden !important; }' });
  test.fail(true, 'The unchanged baseline must reject this deliberately broken page');
  await expect(page).toHaveScreenshot('home.png', { fullPage: true });
});

test('@control shared layout check detects overflow', async ({ page }) => {
  await preparePage(page, '/');
  await expectNoHorizontalOverflow(page, { expectTarget: expect });
  await page.addStyleTag({ content: 'body { min-width: 2000px !important; }' });
  test.fail(true, 'The shared check must reject this deliberately broken page');
  await expectNoHorizontalOverflow(page, { expectTarget: expect });
});
