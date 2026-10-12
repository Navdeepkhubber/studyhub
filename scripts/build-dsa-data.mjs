#!/usr/bin/env node
/**
 * Builds src/data/dsa/a2z.json and src/data/dsa/neetcode.json.
 *
 *   a2z.base.json  (committed)  Striver A2Z topics with video / LeetCode / GfG / Code360 links.
 *   upstream a2z   (fetched)    bugaddr/a2z_old_sheet: per-topic takeUforward `post_link` (article)
 *                               and `plus_link` (practice page).
 *   upstream NeetCode (fetched) neetcode-gh/leetcode .problemSiteData.json (NC150 / Blind 75 flags).
 *
 * Usage:  node scripts/build-dsa-data.mjs
 *         node scripts/build-dsa-data.mjs --a2z path/to/a2z.json --neetcode path/to/.problemSiteData.json
 *
 * takeUforward moved its articles from takeuforward.org/<category>/<slug>/ to
 * takeuforward.org/blogs/data-structure-and-algorithm/<slug>. The slug is carried over, so we
 * rewrite the URL. Numbered Striver series (graph G-xx, DP dp-xx) sit in other categories whose
 * new location is not confirmed, so they are left without a TUF link until
 * `npm run links:tuf` resolves them by following the old URL's redirect.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dsaDir = join(root, 'src/data/dsa');
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const UPSTREAM_A2Z = 'https://raw.githubusercontent.com/bugaddr/a2z_old_sheet/main/a2z.json';
const UPSTREAM_NC = 'https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json';

async function load(pathArg, url) {
  if (pathArg) return JSON.parse(await readFile(pathArg, 'utf8'));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

const TUF = 'https://takeuforward.org';
const BLOG_BASE = `${TUF}/blogs/data-structure-and-algorithm/`;
const PRACTICE_BASE = `${TUF}/practice/dsa/`;
/** Old first path segments whose articles now live under the single DSA blog category. */
const OLD_CATEGORIES = new Set([
  'data-structure', 'sorting', 'arrays', 'linked-list', 'binary-tree', 'binary-search-tree',
  'recursion', 'Greedy', 'maths', 'binary-search', 'hashing', 'trie', 'graph', 'dynamic-programming',
]);
/** Striver's numbered series (G-54, DP-48 ...) are filed separately; their new path is unconfirmed. */
const SERIES = /-(g|dp)-?\d+$/i;
const SLUG = /^[A-Za-z0-9_-]+$/;

function articleSlug(postLink) {
  if (!postLink) return null;
  let url;
  try { url = new URL(postLink); } catch { return null; }
  if (url.hostname.replace(/^www\./, '') !== 'takeuforward.org') return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || !OLD_CATEGORIES.has(parts[0])) return null; // basics / course pages: skip
  const slug = parts[1];
  if (!SLUG.test(slug)) return null;
  if ((parts[0] === 'graph' || parts[0] === 'dynamic-programming') && SERIES.test(slug)) return null;
  if (SERIES.test(slug)) return null;
  return slug;
}

function practiceSlug(plusLink) {
  if (!plusLink) return null;
  const last = plusLink.split('?')[0].split('/').filter(Boolean).pop();
  return last && /^[a-z0-9-]+$/.test(last) ? last : null; // upstream has a few bare slugs; both are fine
}

const it_override = (id) => (id in overrides ? overrides[id] : undefined);
const lcSlug = (url) => url?.match(/leetcode\.com\/problems\/([^/?#]+)/)?.[1] ?? null;

const overrides = await readFile(join(dsaDir, 'tuf-overrides.json'), 'utf8').then(JSON.parse).catch(() => ({}));
const [base, upstream, nc] = await Promise.all([
  readFile(join(dsaDir, 'a2z.base.json'), 'utf8').then(JSON.parse),
  load(arg('--a2z'), UPSTREAM_A2Z),
  load(arg('--neetcode'), UPSTREAM_NC),
]);

// ---- A2Z -----------------------------------------------------------------------------------
const old = new Map();
for (const step of upstream) for (const sub of step.sub_steps) for (const t of sub.topics) old.set(`a2z-${t.id}`, t);

let withTuf = 0, withPractice = 0, withGfgRead = 0, pendingSeries = 0;
const steps = base.map((step) => ({
  step: step.step,
  title: step.title,
  sections: step.sections.map((section) => ({
    title: section.title,
    items: section.items.map((item) => {
      const up = old.get(item.id);
      const reads = [];
      const slug = articleSlug(up?.post_link);
      if (slug) reads.push({ label: 'takeUforward article', url: BLOG_BASE + slug, source: 'tuf' });
      else if (up?.post_link && SERIES.test(up.post_link.replace(/\/$/, ''))) pendingSeries++;
      if (it_override(item.id) === null) { const i = reads.findIndex((r) => r.source === 'tuf'); if (i >= 0) reads.splice(i, 1); }
      else if (it_override(item.id)) { const i = reads.findIndex((r) => r.source === 'tuf'); const link = { label: 'takeUforward article', url: it_override(item.id), source: 'tuf' }; if (i >= 0) reads[i] = link; else reads.unshift(link); }
      if (item.read) reads.push({ label: 'GeeksforGeeks article', url: item.read, source: 'gfg' });
      const pSlug = practiceSlug(up?.plus_link);
      if (slug) withTuf++;
      if (pSlug) withPractice++;
      if (item.read) withGfgRead++;
      return {
        id: item.id,
        title: item.title,
        difficulty: item.difficulty ?? null,
        video: item.video ?? null,
        reads,
        tuf: pSlug ? PRACTICE_BASE + pSlug : null,
        leetcode: item.leetcode ?? null,
        lc: lcSlug(item.leetcode),
        gfg: item.gfg ?? null,
        other: item.other ?? null,
      };
    }),
  })),
}));

const a2z = {
  meta: {
    source: 'Striver A2Z DSA sheet',
    sheetUrl: `${TUF}/prep-hub/strivers-a2z-dsa-sheet`,
    legacySheetUrl: 'https://bugaddr.github.io/a2z_old_sheet/',
    tufTopicCountLive: 495,
    note: 'Topic list is the 455-topic A2Z sheet plus 22 Traverses pattern exercises. Reading links point to takeUforward blog articles where the slug carried over.',
  },
  steps,
};
await writeFile(join(dsaDir, 'a2z.json'), JSON.stringify(a2z, null, 1) + '\n');

// ---- NeetCode ------------------------------------------------------------------------------
const patternOrder = [];
const problems = nc
  .filter((p) => p.pattern !== 'JavaScript') // JS-specific utility problems, not DSA patterns
  .map((p) => {
    if (!patternOrder.includes(p.pattern)) patternOrder.push(p.pattern);
    return {
      slug: p.link.replace(/\/$/, ''),
      title: p.problem,
      pattern: p.pattern,
      difficulty: p.difficulty,
      video: p.video || null,
      nc150: !!p.neetcode150,
      blind75: !!p.blind75,
    };
  });

const neetcode = {
  meta: {
    source: 'neetcode-gh/leetcode .problemSiteData.json',
    practiceUrl: 'https://neetcode.io/practice',
    patterns: patternOrder,
    counts: {
      nc150: problems.filter((p) => p.nc150).length,
      blind75: problems.filter((p) => p.blind75).length,
      all: problems.length,
    },
  },
  problems,
};
await writeFile(join(dsaDir, 'neetcode.json'), JSON.stringify(neetcode, null, 1) + '\n');

const total = steps.flatMap((s) => s.sections.flatMap((x) => x.items)).length;
console.log(`A2Z: ${total} items | TUF article links: ${withTuf} | TUF practice links: ${withPractice} | kept GfG reads: ${withGfgRead} | series pending resolve: ${pendingSeries}`);
console.log(`NeetCode: ${neetcode.meta.counts.nc150} in NC150, ${neetcode.meta.counts.blind75} in Blind 75, ${neetcode.meta.counts.all} total`);
