import { expect, test } from '@playwright/test';
import { open } from './helpers';

test('mobile: bottom tab bar, drawer, no sideways scrolling', async ({ page }) => {
  await open(page, {});
  const tabs = page.getByRole('navigation', { name: 'Quick navigation' });
  await expect(tabs).toBeVisible();
  await tabs.getByRole('link', { name: 'DSA' }).click();
  await expect(page.locator('h1')).toHaveText('DSA tracker');
  for (const h of ['today', 'dsa', 'plan', 'week-3', 'settings', 'atlas']) {
    await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(150);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), h).toBe(true);
  }
  await tabs.getByRole('button', { name: 'More pages' }).click();
  await expect(page.getByRole('complementary', { name: 'Sidebar' })).toHaveClass(/open/);
});
