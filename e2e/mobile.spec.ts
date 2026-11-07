import { expect, test } from '@playwright/test';
import { navTo, open, settle } from './helpers';
import { readFileSync } from 'node:fs';
const curriculum = JSON.parse(readFileSync(new URL('../src/data/curriculum-plan.json', import.meta.url), 'utf8')) as { weeks: { topics: string[] }[] };
const FIRST = curriculum.weeks[0].topics[0];

test('mobile: bottom tab bar, drawer, no sideways scrolling', async ({ page }) => {
  await open(page, {});
  const tabs = page.getByRole('navigation', { name: 'Quick navigation' });
  await expect(tabs).toBeVisible();
  await tabs.getByRole('link', { name: 'DSA' }).click();
  await expect(page.locator('h1')).toHaveText('DSA tracker');
  for (const h of ['today', 'dsa', 'plan', 'week-3', 'settings', 'atlas']) {
    await navTo(page, h); await page.waitForTimeout(150);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), h).toBe(true);
  }
  await tabs.getByRole('button', { name: 'More pages' }).click();
  await expect(page.getByRole('complementary', { name: 'Sidebar' })).toHaveClass(/open/);
});

test('small phone and tablet keep the study flow usable in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await open(page, null);
  await page.getByRole('dialog', { name: 'Set up your plan' }).getByRole('button', { name: 'Start my plan' }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.getByRole('link', { name: 'Start learning' }).click();
  await expect(page).toHaveURL(new RegExp(`/week-1\\?focus=lesson-${FIRST}$`));
  await page.locator(`#lesson-${FIRST} input`).check();
  await settle(page);
  await navTo(page, 'today');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('navigation', { name: 'Quick navigation' }).getByRole('button', { name: 'More pages' }).click();
  const sidebar = page.getByRole('complementary', { name: 'Sidebar' });
  await sidebar.getByText('Explore', { exact: true }).click();
  await sidebar.getByRole('link', { name: 'Practice resources' }).click();
  await expect(page.locator('h1')).toHaveText('Practice resources');
  await page.setViewportSize({ width: 768, height: 800 });
  await navTo(page, 'today');
  await expect(page.getByRole('link', { name: 'Start learning' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('small phone keeps task shortcuts and DSA actions steady when toggled', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await open(page, {});
  const shortcuts = page.locator('.today-shortcuts a');
  const before = await shortcuts.evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
  await page.locator('.start-focus summary').click();
  expect(await shortcuts.evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height))).toEqual(before);

  await navTo(page, 'dsa?tab=nc150&q=two%20sum');
  const row = page.locator('.dsa-row').filter({ has: page.getByRole('heading', { name: 'Two Sum', exact: true }) });
  const note = row.getByRole('button', { name: 'Add note' });
  const beforeX = (await note.boundingBox())!.x;
  await row.getByRole('button', { name: 'Revise later' }).click();
  expect((await note.boundingBox())!.x).toBe(beforeX);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
