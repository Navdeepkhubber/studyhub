import { a2z, neetcode } from '../data';
import type { A2zItem, A2zSection, A2zStep, NcProblem } from '../data/types';
import type { AppState } from '../state/model';
import { dayOffset, todayKey } from './dates';

export const a2zItems: A2zItem[] = a2z.steps.flatMap((st) => st.sections.flatMap((x) => x.items));
export const a2zLocation = new Map<string, { step: A2zStep; section: A2zSection }>();
for (const step of a2z.steps) for (const section of step.sections) for (const it of section.items) a2zLocation.set(it.id, { step, section });

/** LeetCode slug -> A2Z item ids that are the same problem. */
export const a2zByLc = new Map<string, string[]>();
for (const it of a2zItems) if (it.lc) a2zByLc.set(it.lc, [...(a2zByLc.get(it.lc) ?? []), it.id]);
export const ncBySlug = new Map<string, NcProblem>(neetcode.problems.map((p) => [p.slug, p]));

export type ListId = 'a2z' | 'nc150' | 'blind75' | 'ncall';
export const ncLists: { id: Exclude<ListId, 'a2z'>; label: string; filter: (p: NcProblem) => boolean }[] = [
  { id: 'nc150', label: 'NeetCode 150', filter: (p) => p.nc150 },
  { id: 'blind75', label: 'Blind 75', filter: (p) => p.blind75 },
  { id: 'ncall', label: 'NeetCode All', filter: () => true },
];

/** A problem counts as solved if it, or its twin in the other tracker, is ticked. */
export const a2zSolved = (s: AppState, it: A2zItem): boolean =>
  !!s.dsaDone[it.id] || (!!it.lc && !!s.neetDone[it.lc]);
export const ncSolved = (s: AppState, p: NcProblem): boolean =>
  !!s.neetDone[p.slug] || (a2zByLc.get(p.slug) ?? []).some((id) => s.dsaDone[id]);

function setFlag(map: Record<string, boolean>, key: string, on: boolean) { if (on) map[key] = true; else delete map[key]; }

/** One key per real problem: twins (same LeetCode slug) share notes, revision and the daily log. */
export const canonA2z = (it: A2zItem) => (it.lc ? `lc:${it.lc}` : `a2z:${it.id}`);
export const canonNc = (p: NcProblem) => `lc:${p.slug}`;
const a2zById = new Map(a2zItems.map((i) => [i.id, i]));
export function canonOf(kind: 'a2z' | 'nc', id: string): string {
  if (kind === 'nc') return `lc:${id}`;
  const it = a2zById.get(id); return it ? canonA2z(it) : `a2z:${id}`;
}

export interface ProblemRef { key: string; title: string; where: string; href: string; solved: (s: AppState) => boolean }
/** Human-readable info for a canonical key (used by revision queue, continue card, Today). */
export function describe(key: string): ProblemRef | null {
  if (key.startsWith('lc:')) {
    const slug = key.slice(3);
    const ids = a2zByLc.get(slug) ?? [];
    const nc = ncBySlug.get(slug);
    const it = ids.length ? a2zById.get(ids[0]) : undefined;
    const title = it?.title ?? nc?.title ?? slug;
    const where = it ? `A2Z step ${a2zLocation.get(it.id)!.step.step}` : nc ? `NeetCode · ${nc.pattern}` : 'LeetCode';
    const href = it ? `#dsa?tab=a2z&q=${encodeURIComponent(it.title)}` : `#dsa?tab=ncall&q=${encodeURIComponent(title)}`;
    return { key, title, where, href, solved: (s) => (it ? a2zSolved(s, it) : nc ? ncSolved(s, nc) : false) };
  }
  const it = a2zById.get(key.slice(4));
  if (!it) return null;
  return { key, title: it.title, where: `A2Z step ${a2zLocation.get(it.id)!.step.step}`, href: `#dsa?tab=a2z&q=${encodeURIComponent(it.title)}`, solved: (s) => a2zSolved(s, it) };
}

/** Problems in study order for a list. */
export function listOrder(list: string): { key: string; solved: (s: AppState) => boolean }[] {
  if (list === 'a2z') return a2zItems.map((it) => ({ key: canonA2z(it), solved: (s: AppState) => a2zSolved(s, it) }));
  const l = ncLists.find((x) => x.id === list) ?? ncLists[0];
  const probs = neetcode.problems.filter(l.filter);
  return neetcode.meta.patterns.flatMap((pat) => probs.filter((p) => p.pattern === pat)).map((p) => ({ key: canonNc(p), solved: (s: AppState) => ncSolved(s, p) }));
}
/** The first unsolved problem after the one you ticked last (wrapping around), else the first unsolved. */
export function nextUp(s: AppState, list = s.dsaLast?.list ?? 'a2z'): ProblemRef | null {
  const order = listOrder(list);
  const start = s.dsaLast && s.dsaLast.list === list ? order.findIndex((o) => o.key === s.dsaLast!.key) : -1;
  for (let i = 1; i <= order.length; i++) {
    const o = order[(start + i + order.length) % order.length];
    if (!o.solved(s)) return describe(o.key);
  }
  return null;
}

export const REVISION_DAYS = [1, 3, 7, 14, 30, 60];
const addDays = dayOffset;
export function flagRevision(s: AppState, key: string, today: string, on: boolean): AppState {
  const dsaRevise = { ...s.dsaRevise };
  if (on) dsaRevise[key] = { due: addDays(today, 1), step: 0, added: Date.now() }; else delete dsaRevise[key];
  return { ...s, dsaRevise };
}
/** Spaced repetition: "Got it" pushes the next review further out; "Still hard" brings it back tomorrow. */
export function review(s: AppState, key: string, today: string, ok: boolean): AppState {
  const cur = s.dsaRevise[key]; if (!cur) return s;
  const step = ok ? Math.min(cur.step + 1, REVISION_DAYS.length - 1) : 0;
  return { ...s, dsaRevise: { ...s.dsaRevise, [key]: { ...cur, step, due: addDays(today, REVISION_DAYS[step]) } } };
}
export const dueRevisions = (s: AppState, today: string) => Object.entries(s.dsaRevise).filter(([, r]) => r.due <= today).map(([k]) => k);
export const solvedToday = (s: AppState, today: string) => (s.dsaLog[today] ?? []).length;

/** Tick/untick a problem and its twin so the two trackers never disagree. Also keeps the daily log. */
export function setSolved(s: AppState, kind: 'a2z' | 'nc', id: string, on: boolean, today = todayKey()): AppState {
  const key = canonOf(kind, id);
  const day = new Set(s.dsaLog[today] ?? []);
  if (on) day.add(key); else day.delete(key);
  const dsaLog = { ...s.dsaLog, [today]: [...day] };
  if (!dsaLog[today].length) delete dsaLog[today];
  const base = { ...s, dsaLog, dsaLast: on ? { list: kind === 'a2z' ? 'a2z' : (s.dsaLast?.list && s.dsaLast.list !== 'a2z' ? s.dsaLast.list : 'nc150'), key } : s.dsaLast };
  return setSolvedFlags(base, kind, id, on);
}
function setSolvedFlags(s: AppState, kind: 'a2z' | 'nc', id: string, on: boolean): AppState {
  const dsaDone = { ...s.dsaDone }, neetDone = { ...s.neetDone };
  const lc = kind === 'nc' ? id : a2zItems.find((i) => i.id === id)?.lc ?? null;
  if (kind === 'a2z') setFlag(dsaDone, id, on); else setFlag(neetDone, id, on);
  if (lc) {
    for (const twin of a2zByLc.get(lc) ?? []) setFlag(dsaDone, twin, on);
    if (ncBySlug.has(lc)) setFlag(neetDone, lc, on);
  }
  return { ...s, dsaDone, neetDone };
}
