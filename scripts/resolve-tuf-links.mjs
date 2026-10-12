#!/usr/bin/env node
/**
 * Verifies takeUforward article links and finds new locations for the ones we could not derive.
 * Needs internet access to takeuforward.org (run it on your own machine):
 *
 *   npm run links:tuf            # checks everything, writes src/data/dsa/tuf-overrides.json
 *   npm run data:dsa             # rebuilds a2z.json using the overrides
 *
 * 1. Every TUF article link already in a2z.json is requested; ones that do not return 200 are dropped.
 * 2. Topics with an old-style link but no new link (Striver's G-xx / DP-xx series) are resolved by
 *    following the old URL's redirect and keeping the result if it lands on takeuforward.org/blogs/....
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dir = new URL('../src/data/dsa/', import.meta.url);
const a2z = JSON.parse(await readFile(new URL('a2z.json', dir), 'utf8'));
const upstream = await (await fetch('https://raw.githubusercontent.com/bugaddr/a2z_old_sheet/main/a2z.json')).json();
const oldLink = new Map();
for (const st of upstream) for (const sub of st.sub_steps) for (const t of sub.topics) oldLink.set(`a2z-${t.id}`, t.post_link);

const items = a2z.steps.flatMap((s) => s.sections.flatMap((x) => x.items));
const overrides = {};
const get = async (url) => { try { const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'studyhub-link-check' } }); return { ok: r.ok, url: r.url }; } catch { return { ok: false, url }; } };
async function pool(list, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) await fn(list[i++]); })); }

let checked = 0, dropped = 0, resolved = 0;
await pool(items, 6, async (it) => {
  const tuf = it.reads.find((r) => r.source === 'tuf');
  if (tuf) {
    const res = await get(tuf.url); checked++;
    if (!res.ok) { overrides[it.id] = null; dropped++; console.log(`✗ dead   ${it.title}  ${tuf.url}`); }
  } else if (oldLink.get(it.id) && /takeuforward\.org/.test(oldLink.get(it.id))) {
    const res = await get(oldLink.get(it.id));
    if (res.ok && /^https:\/\/takeuforward\.org\/blogs\/[\w-]+\/[\w-]+\/?$/.test(res.url)) { overrides[it.id] = res.url.replace(/\/$/, ''); resolved++; console.log(`✓ found  ${it.title}  ${res.url}`); }
  }
});
await writeFile(fileURLToPath(new URL('tuf-overrides.json', dir)), JSON.stringify(overrides, null, 1) + '\n');
console.log(`\nchecked ${checked} links · ${dropped} dead (dropped) · ${resolved} newly resolved. Now run: npm run data:dsa`);
