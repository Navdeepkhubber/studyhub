import { certifications, roadmap } from '../data';
import type { AppState } from '../state/model';
import { curriculumTopicForKey, isCurriculumTopicDone } from './curriculum-progress';

/** Keys of every checkpoint in the groups whose title contains one of the needles (any track). */
function keysFor(needles: string[]): string[] {
  const out: string[] = [];
  for (const t of roadmap.tracks) t.groups.forEach((g, gi) => {
    if (needles.some((n) => n && g.t.toLowerCase().includes(n.toLowerCase()))) g.i.forEach((_, ii) => out.push(`${t.id}-${gi}-${ii}`));
  });
  return out;
}
const isDone = (s: AppState, key: string) => (curriculumTopicForKey.has(key) ? isCurriculumTopicDone(s, key) : !!s.topics[key]);
const pct = (s: AppState, keys: string[]) => (keys.length ? Math.round((100 * keys.filter((k) => isDone(s, k)).length) / keys.length) : 0);

export interface CertReadiness { id: string; examKeys: string[]; examPct: number; prepPct: number; nextKey?: string }
/** Exam-prep progress plus how much of the skill work that feeds the exam is already done. */
export function certReadiness(s: AppState): CertReadiness[] {
  return certifications.certs.map((c) => {
    const examKeys = c.exam ? keysFor([c.exam]) : [];
    const prepKeys = keysFor(c.prep).filter((k) => !examKeys.includes(k));
    return { id: c.id, examKeys, examPct: pct(s, examKeys), prepPct: pct(s, prepKeys), nextKey: examKeys.find((k) => !isDone(s, k)) };
  });
}
