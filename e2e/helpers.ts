import { expect, type Page } from '@playwright/test';

export const KEY = 'study-compass-v2';
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const daysFromNow = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

/** Open the app and optionally seed app state before it boots. */
export async function open(page: Page, seed?: Record<string, unknown> | null, hash = '') {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|service worker|Failed to load resource/i.test(m.text())) errors.push(m.text()); });
  await page.goto('/');
  await expect(page.locator('main#main')).toBeVisible({ timeout: 15_000 });
  if (seed !== null) {
    // Seed before the app boots (a hash-only goto would not reload the page).
    await page.goto('about:blank');
    await page.addInitScript(([k, v]) => {
      if (!sessionStorage.getItem('__seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); }
    }, [KEY, JSON.stringify({ onboarded: true, start: daysFromNow(-1), ...seed })]);
    await page.goto(`/${hash}`); await expect(page.locator('main#main')).toBeVisible({ timeout: 15_000 });
  } else if (hash) { await page.evaluate((h) => { location.hash = h; }, hash); }
  return errors;
}
export const stored = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
/** State is saved with a short debounce. */
export const settle = (page: Page) => page.waitForTimeout(400);
