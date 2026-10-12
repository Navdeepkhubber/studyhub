#!/usr/bin/env node
/**
 * Checks every external link in the curriculum (weekly resources, skills, degree, career, roadmaps).
 * DSA problem links are excluded here (thousands, and LeetCode/GfG block bots); `npm run links:tuf`
 * covers the takeUforward articles.
 *
 *   npm run check:links            # prints a report, writes link-report.md
 *   npm run check:links -- --strict  # exit 1 if any link is definitely broken (used in CI)
 *
 * "Broken" = 404/410 or the host no longer resolves. 401/403/429/5xx/timeouts are "unverified":
 * many sites block automated checks, so those need a manual look rather than an alarm.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
// Kaggle serves these live pages in a browser but returns 404 to automated fetches.
// Each URL below was independently opened in the browser source on 2026-10-12.
const browserVerifiedKaggle = new Set([
  'https://www.kaggle.com/learn/python',
  'https://www.kaggle.com/learn/pandas',
  'https://www.kaggle.com/learn/intermediate-machine-learning',
  'https://www.kaggle.com/datasets?search=ab+testing',
  'https://www.kaggle.com/learn/intro-to-machine-learning',
  'https://www.kaggle.com/learn/time-series',
  'https://www.kaggle.com/learn',
  'https://www.kaggle.com/learn/data-cleaning',
]);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'dsa') out.push(...(await walk(p))); }
    else if (/\.(tsx?|json)$/.test(e.name) && !e.name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}
const urls = new Map(); // url -> files
for (const f of await walk(join(root, 'src'))) {
  for (const m of (await readFile(f, 'utf8')).matchAll(/https?:\/\/[^\s"'`)<>\]]+/g)) {
    const u = m[0].replace(/[.,;]+$/, '');
    if (/^https?:\/\/(localhost|127\.)/.test(u)) continue;
    urls.set(u, [...new Set([...(urls.get(u) ?? []), f.replace(root + '/', '')])]);
  }
}
async function check(url) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 studyhub-link-check' } });
    if (r.status === 405 || r.status === 403) r = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 studyhub-link-check' } });
    if (r.ok) return { url, kind: 'ok', status: r.status };
    if (r.status === 404 && browserVerifiedKaggle.has(url)) return { url, kind: 'unverified', status: '404 (bot-blocked; browser verified)' };
    if (r.status === 404 || r.status === 410) return { url, kind: 'broken', status: r.status };
    return { url, kind: 'unverified', status: r.status };
  } catch (e) {
    const code = e?.cause?.code;
    return { url, kind: code === 'ENOTFOUND' ? 'broken' : 'unverified', status: code ?? (e?.name === 'AbortError' ? 'timeout' : 'error') };
  } finally { clearTimeout(t); }
}
const list = [...urls.keys()]; const results = []; let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => { while (i < list.length) results.push(await check(list[i++])); }));
// If most hosts fail to resolve, the network is the problem, not the links: don't raise false alarms.
const dnsFails = results.filter((r) => r.status === 'ENOTFOUND').length;
const networkDown = results.length > 10 && dnsFails / results.length > 0.5;
if (networkDown) for (const r of results) if (r.status === 'ENOTFOUND') r.kind = 'unverified';
const broken = results.filter((r) => r.kind === 'broken'), unver = results.filter((r) => r.kind === 'unverified');
const row = (r) => `| ${r.status} | ${r.url} | ${urls.get(r.url).join(', ')} |`;
const report = [`# Link report (${new Date().toISOString().slice(0, 10)})`, '', ...(networkDown ? [`> ${dnsFails} of ${results.length} hosts did not resolve, so this looks like a network problem. Nothing was marked broken.`, ''] : []), `Checked ${results.length} links: ${results.length - broken.length - unver.length} OK, ${broken.length} broken, ${unver.length} unverified.`, '',
  ...(broken.length ? ['## Broken', '', '| Status | URL | Used in |', '| --- | --- | --- |', ...broken.map(row), ''] : []),
  ...(unver.length ? ['## Unverified (check by hand; often bot-blocking)', '', '| Status | URL | Used in |', '| --- | --- | --- |', ...unver.map(row), ''] : [])].join('\n');
await writeFile(join(root, 'link-report.md'), report + '\n');
console.log(report);
if (strict && broken.length) process.exit(1);
