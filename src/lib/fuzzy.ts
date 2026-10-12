/**
 * Small fuzzy matcher: every query word must appear in the text, either as a substring (strongest)
 * or as an in-order subsequence (e.g. "lnkd lst" matches "Linked List"). Higher score = better.
 * Returns -1 when the text does not match.
 */
function wordScore(q: string, t: string): number {
  const at = t.indexOf(q);
  if (at >= 0) return 100 + (at === 0 || /\W/.test(t[at - 1]) ? 50 : 0) - Math.min(at, 40) + q.length * 2;
  let score = 0, ti = 0, prev = -2;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    score += found === prev + 1 ? 6 : 1;
    if (found === 0 || /\W/.test(t[found - 1])) score += 4;
    prev = found; ti = found + 1;
  }
  return score;
}
export function fuzzyScore(query: string, text: string): number {
  const t = text.toLowerCase();
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  let total = 0;
  for (const w of words) { const s = wordScore(w, t); if (s < 0) return -1; total += s; }
  return total - t.length * 0.05; // prefer shorter labels on ties
}
export function fuzzyFilter<T>(items: T[], query: string, text: (x: T) => string, limit = 40): T[] {
  if (!query.trim()) return items.slice(0, limit);
  return items.map((x) => ({ x, s: fuzzyScore(query, text(x)) })).filter((r) => r.s >= 0).sort((a, b) => b.s - a.s).slice(0, limit).map((r) => r.x);
}
