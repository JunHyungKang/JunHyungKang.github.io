import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Tests exercise our static app, not ads or logged-in comment services.
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
});

for (const slug of [
  '2026-01-14-AI-Agent-Architecture-Reflection',
  '2026-02-17-AI-Harness-Governance',
  '2026-07-15-Agent-Self-Improvement-Local-Optimum',
  '2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration',
]) {
  test(`numeric table of contents: ${slug}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/posts/${slug}`);
    const links = page.locator('a[href^="#"]').filter({ hasText: /^\d/ });
    expect(await links.count()).toBeGreaterThan(0);
    for (let i = 0; i < await links.count(); i++) {
      const link = links.nth(i);
      const hash = await link.getAttribute('href');
      await link.click();
      await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(hash);
      const top = await page.evaluate(id => document.getElementById(id!)?.getBoundingClientRect().top, hash!.slice(1));
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(900);
    }
    expect(errors).toEqual([]);
  });
}

test('search focuses, traps focus, closes with Escape and restores trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '검색 ⌘ K' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '글 검색' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('combobox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('combobox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('/');
  await expect(dialog.getByRole('combobox')).toBeFocused();
  await dialog.getByRole('combobox').fill('온톨로지');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/posts\/2026-08-09-Agent-Ontology-Context$/);
  await expect(dialog).toHaveCount(0);
});

test('archive retains content without ads or search indexing', async ({ page }) => {
  const response = await page.goto('/posts/2019-12-22-MuZero');
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.getByText('ARCHIVE NOTE', { exact: true })).toBeVisible();
  expect(await page.locator('.prose').innerText()).not.toBe('');
  await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
});

test('mobile navigation has named controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '메뉴 열기' }).click();
  await expect(page.getByRole('button', { name: '메뉴 닫기' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: '메뉴 닫기' }).click();
  await page.getByRole('button', { name: '글 검색' }).click();
  await expect(page.getByRole('dialog').getByRole('combobox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('archived HTML images and source attribution survive rendering', async ({ page }) => {
  await page.goto('/posts/2022-10-04-Towards_Real-Time_Multi-Object_Tracking');
  for (const number of [3, 4, 5, 6, 7]) {
    const image = page.locator(`.prose img[src="/images/221004/221004_${number}.png"]`);
    await expect(image).toHaveCount(1);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  }
  await page.goto('/posts/2025-12-10-Muon-Optimizer');
  await expect(page.locator('.prose div').filter({ hasText: /^\(이미지 출처:/ }).getByRole('link', { name: 'YouTube', exact: true })).toHaveCount(1);
  await expect(page.locator('.katex').first()).toBeVisible();
});
