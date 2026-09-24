// Consumer-owned representative layouts; shared Platform owns no page policy.
export const pages = [
  { id: 'home', path: '/', heading: 'Fronteras Micro-film Festival' },
  { id: 'films', path: '/films/', heading: 'Film Selections' },
  { id: 'films-2023', path: '/films-2023/', heading: 'Film Selections' },
  { id: 'installations', path: '/installations/', heading: 'Installations' },
  { id: 'coyote', path: '/coyote/', heading: 'Coyote' },
  { id: 'by-boat', path: '/by-boat/', heading: 'By Boat' },
];

export async function preparePage(page, pathname) {
  // Keep third-party video players out of deterministic captures; retain their box.
  await page.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:4173'
    ? route.continue() : route.fulfill({ status: 200, contentType: 'text/html', body: '' }));
  const response = await page.goto(pathname, { waitUntil: 'load' });
  if (response.status() !== 200) throw new Error(`Page unavailable: ${pathname}`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Load below-fold images before full-page capture and Colcade reflow.
    await Promise.all([...document.images].map(async image => {
      image.loading = 'eager';
      await image.decode();
    }));
  });
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
  // The build-time copyright year is not a visual regression.
  await page.locator('.signature').evaluate(node => { node.textContent = 'Dust Wave'; });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
