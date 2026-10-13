import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const curriculum = JSON.parse(readFileSync(new URL('../src/data/curriculum-plan.json', import.meta.url), 'utf8')) as { weeks: { n: number; topics: string[] }[] };
const weekTopics = (n: number) => curriculum.weeks[n-1].topics;
import { daysFromNow, navTo, open, settle, stored } from './helpers';

test('search engines are asked not to index the site', async ({ request }) => {
  expect(await (await request.get('/')).text()).toContain('noindex');
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
});

test('first run asks for the plan details and shows a countdown before week 1', async ({ page }) => {
  await open(page, null);
  const dialog = page.getByRole('dialog', { name: 'Set up your plan' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('When does week 1 start?').fill(daysFromNow(10));
  await dialog.getByRole('button', { name: 'Start my plan' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('.today-head h2')).toHaveText('Week 1 starts in 10 days');
  await settle(page);
  expect((await stored(page)).onboarded).toBe(true);
});

test('first run can start today and offers next Monday as a quick choice', async ({ page }) => {
  await open(page, null);
  const dialog = page.getByRole('dialog', { name: 'Set up your plan' });
  await expect(dialog.getByLabel('When does week 1 start?')).toHaveValue(daysFromNow(0));
  await dialog.getByRole('button', { name: 'Next Monday' }).click();
  await expect(dialog.getByLabel('When does week 1 start?')).not.toHaveValue(daysFromNow(0));
  await dialog.getByRole('button', { name: 'Start today' }).click();
  await expect(dialog.getByLabel('When does week 1 start?')).toHaveValue(daysFromNow(0));
  await dialog.getByRole('button', { name: 'Start my plan' }).click();
  await expect(page.getByRole('link', { name: 'Start learning' })).toBeVisible();
});

test('Today opens the next exact roadmap checkpoint', async ({ page }) => {
  await open(page, {});
  await page.getByRole('link', { name: 'Start learning' }).click();
  await expect(page).toHaveURL(/\/week-1\?focus=lesson-A-22-0$/);
  await expect(page.locator('#lesson-A-22-0')).toBeFocused();
  await page.locator('#lesson-A-22-0 input').check();
  await navTo(page, 'today');
  await page.getByRole('link', { name: 'Start learning' }).click();
  await expect(page).toHaveURL(/\/week-1\?focus=lesson-A-11-0$/);
});

test('expanding Today tasks keeps the shortcut cards and timer controls in place', async ({ page }) => {
  await open(page, {});
  const shortcuts = page.locator('.today-shortcuts a');
  const before = await shortcuts.evaluateAll((links) => links.map((link) => {
    const { y, height } = link.getBoundingClientRect();
    return { y, height };
  }));
  await page.locator('.start-focus summary').click();
  await expect(page.locator('.start-focus')).toHaveAttribute('open', '');
  const after = await shortcuts.evaluateAll((links) => links.map((link) => {
    const { y, height } = link.getBoundingClientRect();
    return { y, height };
  }));
  expect(after).toEqual(before);

  const reset = page.getByRole('button', { name: 'Reset' });
  const resetX = (await reset.boundingBox())!.x;
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  expect((await reset.boundingBox())!.x).toBe(resetX);
  await page.getByRole('button', { name: 'Pause' }).click();
});

test('DSA action labels keep adjacent buttons in place', async ({ page }) => {
  await open(page, {}, 'dsa?tab=nc150&q=two%20sum');
  const row = page.locator('.dsa-row').filter({ has: page.getByRole('heading', { name: 'Two Sum', exact: true }) });
  const note = row.getByRole('button', { name: 'Add note' });
  const before = await note.boundingBox();
  await row.getByRole('button', { name: 'Revise later' }).click();
  await expect(row.getByRole('button', { name: 'In revision' })).toBeVisible();
  const revised = await note.boundingBox();
  expect(revised?.x).toBe(before?.x);
  expect(revised?.width).toBe(before?.width);
  await note.click();
  await row.getByLabel('Your note for this problem').fill('Remember the hash map');
  const noted = await row.getByRole('button', { name: 'Note', exact: true }).boundingBox();
  expect(noted?.x).toBe(before?.x);
  expect(noted?.width).toBe(before?.width);
});

test('each weekly checkpoint supplies reading, practice and a concrete action', async ({ page }) => {
  await open(page, {}, 'week-1');
  await expect(page.locator('.curriculum-item')).toHaveCount(weekTopics(1).length);
  await expect(page.locator('.curriculum-item .topic-study')).toHaveCount(weekTopics(1).length);
  const python = page.locator('#lesson-A-22-0');
  await expect(python.getByRole('link', { name: 'Python: informal introduction' })).toHaveAttribute('href', 'https://docs.python.org/3/tutorial/introduction.html');
  await expect(python.getByRole('link', { name: 'Python: errors and exceptions' })).toBeVisible();
  await expect(page.locator('.weekly-workload')).toContainText('4 DSA practice days per calendar week');
  await expect(python.getByRole('link', { name: 'Exercism Python exercises' })).toBeVisible();
  await expect(python.locator('.topic-action')).toContainText('short script');
  await navTo(page, 'week-72');
  await expect(page.locator('.curriculum-item .topic-study')).toHaveCount(weekTopics(72).length);
});

test('selected master’s bridge also has study and practice links', async ({ page }) => {
  await open(page, { bridge: 'stats' }, 'week-2');
  await expect(page.locator('.bridge-task .topic-study').getByRole('link')).toHaveCount(2);
  await expect(page.locator('.weekly-coverage')).toContainText(`Roadmap + bridge coverage · 0/${weekTopics(2).length + 1}`);
});

test('a Notion page link is saved and the final week check requires completed work', async ({ page }) => {
  await open(page, {}, 'week-1');
  const finish = page.locator('#weekly-mission input[type="checkbox"]');
  await expect(finish).toBeDisabled();
  await page.getByLabel('Link to this week’s Notion page').fill('https://www.notion.so/study-week-1');
  await expect(page.getByRole('link', { name: 'Open your week 1 notes' })).toHaveAttribute('href', 'https://www.notion.so/study-week-1');
  for (const group of await page.locator('.curriculum-group').all()) {
    if (!(await group.evaluate(el => el.hasAttribute('open')))) await group.locator('summary').click();
    for (const checkbox of await group.locator('.curriculum-item input[type="checkbox"]').all()) await checkbox.check();
  }
  await expect(finish).toBeEnabled();
  await finish.check();
  await expect(page.locator('.detail-head')).toContainText('100% complete');
  await page.reload();
  await expect(page.getByLabel('Link to this week’s Notion page')).toHaveValue('https://www.notion.so/study-week-1');
  await expect(finish).toBeChecked();
});

test('topic recall and portfolio milestones connect back to the weekly plan', async ({ page }) => {
  await open(page, { topics: { 'A-22-0': true }, topicReviews: { 'A-22-0': { due: daysFromNow(-1), step: 0 } } }, 'week-1');
  const review = page.locator('#review-panel');
  await expect(review).toContainText('1 topic review due');
  await review.getByRole('button', { name: 'Remembered' }).click();
  await expect(review).toContainText('No topic reviews due');
  await navTo(page, 'week-20');
  const milestone = page.locator('.milestone-row').filter({ hasText: 'Reliable data-to-model pipeline' });
  await expect(milestone).toBeVisible();
  await milestone.getByRole('checkbox').check();
  await navTo(page, 'career');
  await expect(page.getByRole('heading', { name: 'Reliable data-to-model pipeline' }).locator('..').getByRole('checkbox').first()).toBeChecked();
});

test('two tabs stay in sync and an idle tab never overwrites newer work', async ({ page, context }) => {
  await open(page, {}, 'week-1');
  const other = await context.newPage(); await other.goto('/#week-1'); await expect(other.locator('main#main')).toBeVisible({ timeout: 15_000 });
  await page.locator('.curriculum-item input').first().check(); await settle(page);
  await expect(other.locator('.curriculum-item input').first()).toBeChecked(); // picked up live
  await other.close(); // closing the other tab must not clobber anything
  expect(Object.keys((await stored(page)).done)).toHaveLength(1);
});

test('simultaneous edits in two tabs preserve both notes', async ({ page, context }) => {
  await open(page, {}, 'week-1');
  const other = await context.newPage();
  await other.goto('/#week-2');
  await expect(other.getByLabel('Your notes')).toBeVisible();
  await Promise.all([
    page.getByLabel('Your notes').fill('first tab'),
    other.getByLabel('Your notes').fill('second tab'),
  ]);
  await settle(page); await settle(other);
  await expect.poll(async () => (await stored(page)).notes).toMatchObject({ 1: 'first tab', 2: 'second tab' });
  await expect.poll(async () => (await stored(other)).notes).toMatchObject({ 1: 'first tab', 2: 'second tab' });
  await other.close();
});

test('every page renders without errors', async ({ page }) => {
  const errors = await open(page, {});
  for (const h of ['plan', 'practice', 'dsa', 'skills', 'career', 'atlas', 'degree', 'settings', 'overview', ...Array.from({ length: 72 }, (_, i) => `week-${i + 1}`)]) {
    await navTo(page, h);
    await expect(page.locator('main')).not.toBeEmpty();
  }
  await expect(page.locator('h1')).toHaveText('Week 72');
  expect(errors).toEqual([]);
});

test('all-track coverage mirrors the exact weekly checkpoint', async ({ page }) => {
  await open(page, {}, 'week-2');
  const list = page.locator('.weekly-coverage');
  const topics = weekTopics(2);
  await expect(list).toContainText(`Roadmap coverage · 0/${topics.length}`);
  await list.locator('summary').click();
  await expect(list.locator('.coverage-item')).toHaveCount(topics.length);
  await expect(list.getByRole('checkbox')).toHaveCount(0);
  const key = topics[0];
  await page.locator(`#lesson-${key} input`).check();
  await expect(list.locator(`[data-topic-key="${key}"]`)).toHaveClass(/covered/);
  await settle(page);
  expect((await stored(page)).topics?.[key]).toBe(true);
  await navTo(page, 'atlas');
  await expect(page.locator(`[data-topic-key="${key}"]`)).toHaveClass(/covered/);
  await expect(page.locator(`[data-topic-key="${key}"]`)).toContainText('Week 2');
  await navTo(page, 'week-2');
  await page.locator(`#lesson-${key} input`).uncheck();
  await page.locator('.weekly-coverage summary').click();
  await expect(page.locator(`[data-topic-key="${key}"]`)).not.toHaveClass(/covered/);
});

test('command palette: fuzzy matches and remembers recent picks', async ({ page }) => {
  await open(page, {});
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  await page.keyboard.press('Control+k');
  await palette.getByRole('combobox').fill('rvrs lnkd');
  await expect(palette.getByRole('option').first()).toContainText(/Reverse/i);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/dsa\?/);
  await expect(palette).toBeHidden();
  await page.keyboard.press('Control+k');
  await expect(palette).toBeVisible();
  await expect(palette.getByRole('option').first()).toContainText('Recent');
});

test('DSA: twins sync, daily goal, revision queue, notes and continue card', async ({ page }) => {
  await open(page, {}, 'dsa?tab=nc150&q=two%20sum');
  const row = page.locator('.dsa-row').filter({ has: page.getByRole('heading', { name: 'Two Sum', exact: true }) });
  await row.getByRole('checkbox', { name: 'Done' }).check();
  await expect(page.locator('.dsa-today .goal strong')).toHaveText('1 / 2');
  await row.getByRole('button', { name: 'Revise later' }).click();
  await row.getByRole('button', { name: 'Add note' }).click();
  await row.getByLabel('Your note for this problem').fill('hash map of complements');
  await settle(page);
  const s = await stored(page);
  expect(Object.keys(s.neetDone)).toContain('two-sum');
  expect(Object.keys(s.dsaDone).length).toBeGreaterThan(0); // the A2Z twin
  expect(Object.values(s.dsaNotes)).toContain('hash map of complements');
  await page.getByRole('tab', { name: /Revision/ }).click();
  await expect(page.getByText('Coming up (1)')).toBeVisible();
  await page.getByRole('tab', { name: 'NeetCode 150' }).click();
  await expect(page.locator('.dsa-today .next-up').first()).toContainText('Continue where you left off');
});

test('timer keeps running across a reload and shows in the tab title', async ({ page }) => {
  await open(page, {});
  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForTimeout(1500);
  await expect(page).toHaveTitle(/Focus/);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expect(page.getByRole('timer')).not.toHaveText('25:00');
});

test('backup: reminder, restore with comparison, and undo', async ({ page }) => {
  await open(page, { done: { 'w1-t0': true } });
  await expect(page.getByRole('region', { name: 'Backup reminder' })).toBeVisible();
  const dl = page.waitForEvent('download');
  await page.getByRole('region', { name: 'Backup reminder' }).getByRole('button', { name: 'Download backup' }).click();
  const file = await (await dl).path();
  await expect(page.getByRole('region', { name: 'Backup reminder' })).toBeHidden();
  await navTo(page, 'week-1');
  await page.locator('.curriculum-item input').first().check(); await settle(page);
  await navTo(page, 'settings');
  await page.getByLabel('Restore from a backup file').setInputFiles(file!);
  const dialog = page.getByRole('dialog', { name: 'Replace your current progress?' });
  await expect(dialog.getByRole('row', { name: /Plan tasks ticked 2 1/ })).toBeVisible();
  await dialog.getByRole('button', { name: 'Replace with backup' }).click();
  expect(Object.keys((await stored(page)).done)).toHaveLength(1);
  await page.locator('.toast').getByRole('button', { name: 'Undo' }).click();
  expect(Object.keys((await stored(page)).done)).toHaveLength(2);
});

test('falling behind: banner, shift plan, undo', async ({ page }) => {
  const start = daysFromNow(-15);
  await open(page, { start });
  const banner = page.getByRole('region', { name: 'Catch-up' });
  await expect(banner).toContainText('unfinished');
  await banner.getByRole('button', { name: 'Shift plan by 1 week' }).click(); await settle(page);
  expect((await stored(page)).start).toBe(daysFromNow(-8));
  await page.locator('.toast').getByRole('button', { name: 'Undo' }).click(); await settle(page);
  expect((await stored(page)).start).toBe(start);
});

test('works offline after the first visit', async ({ page, context }) => {
  await open(page, {});
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await expect(page.locator('h1')).toBeVisible(); // now controlled by the worker
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Today');
  await context.setOffline(false);
});

test('theme switch follows navigation and persists after reload', async ({ page }) => {
  await open(page, {});
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Weekly plan' }).click();
  await expect(page.locator('h1')).toHaveText('Weekly plan');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

for (const theme of ['light', 'dark'] as const) {
  test(`accessibility (axe, ${theme})`, async ({ page }) => {
    await open(page, { done: { 'w1-t0': true }, lastBackupAt: Date.now() });
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    const problems: string[] = [];
    for (const h of ['today', 'plan', 'week-2', 'dsa', 'practice', 'skills', 'atlas', 'career', 'degree', 'settings']) {
      await navTo(page, h); await page.waitForTimeout(150);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      for (const v of r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'))
        problems.push(`${h}: ${v.id} (${v.nodes.length}) e.g. ${v.nodes[0].target.join(' ')}`);
    }
    expect(problems).toEqual([]);
  });
}

test.describe('clean URLs and smooth navigation', () => {
  test('navigating never puts a # in the address bar, and back/forward work', async ({ page }) => {
    await open(page, {});
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Weekly plan' }).click();
    await expect(page).toHaveURL(/\/plan$/);
    await expect(page.locator('h1')).toHaveText('Weekly plan');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'DSA tracker' }).click();
    await expect(page).toHaveURL(/\/dsa$/);
    expect(page.url()).not.toContain('#');
    await page.goBack();
    await expect(page).toHaveURL(/\/plan$/);
    await expect(page.locator('h1')).toHaveText('Weekly plan');
    await page.goForward();
    await expect(page.locator('h1')).toHaveText('DSA tracker');
  });

  test('a link to a week keeps its query string and focuses the target', async ({ page }) => {
    await open(page, {});
    await page.getByRole('link', { name: 'Start learning' }).click();
    await expect(page).toHaveURL(/\/week-1\?focus=lesson-A-22-0$/);
    expect(page.url()).not.toContain('#');
  });

  test('refreshing or opening a deep link lands on the same page', async ({ page }) => {
    await open(page, {}, 'week-2');
    await expect(page.locator('h1')).toHaveText('Week 2');
    await page.reload();
    await expect(page.locator('h1')).toHaveText('Week 2');
    await expect(page).toHaveURL(/\/week-2$/);
  });

  test('old #hash links are redirected to clean paths', async ({ page }) => {
    await open(page, {});
    await page.goto('/#plan');
    await expect(page).toHaveURL(/\/plan$/);
    await expect(page.locator('h1')).toHaveText('Weekly plan');
    await page.goto('/#week-3?focus=review-panel');
    await expect(page).toHaveURL(/\/week-3\?focus=review-panel$/);
    await expect(page.locator('h1')).toHaveText('Week 3');
  });

  test('switching pages starts at the top and does not scroll-animate', async ({ page }) => {
    await open(page, {}, 'plan');
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Skill map' }).click();
    await expect(page.locator('h1')).toHaveText('Skill map');
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 1000 }).toBe(0);
  });
});
