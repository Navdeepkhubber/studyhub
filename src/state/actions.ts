import { dayOffset, todayKey } from '../lib/dates';
import { curriculumTopicForKey } from '../lib/curriculum-progress';
import { canonOf, flagRevision, review, setSolved } from '../lib/dsa';
import { update } from './store';
import type { Activity, AppState } from './model';

const bump = (s: AppState, patch: (a: Activity) => Activity): AppState => {
  const k = todayKey();
  const cur = s.activity[k] ?? { minutes: 0, tasks: [], missions: 0 };
  return { ...s, activity: { ...s.activity, [k]: patch(cur) } };
};
const flag = (m: Record<string, boolean>, key: string, on: boolean) => { const n = { ...m }; if (on) n[key] = true; else delete n[key]; return n; };

export const toggleTask = (id: string, on: boolean) => update((s) => {
  const next = { ...s, done: flag(s.done, id, on) };
  return on ? bump(next, (a) => ({ ...a, tasks: [...new Set([...a.tasks, id])] })) : next;
});
export const toggleCurriculumTopic = (key: string, on: boolean) => update((s) => {
  const item = curriculumTopicForKey.get(key);
  if (!item) return s;
  const topicReviews = { ...s.topicReviews };
  if (on && !topicReviews[key]) topicReviews[key] = { due: dayOffset(todayKey(), 3), step: 0 };
  if (!on) delete topicReviews[key];
  const next = { ...s, done: flag(s.done, item.taskId, on), topics: flag(s.topics, key, on), topicReviews };
  return on ? bump(next, (a) => ({ ...a, tasks: [...new Set([...a.tasks, item.taskId])] })) : next;
});
export const toggleMission = (key: string, on: boolean) => update((s) => {
  const next = { ...s, missions: flag(s.missions, key, on) };
  return on ? bump(next, (a) => ({ ...a, missions: a.missions + 1 })) : next;
});
export const toggleTopic = (key: string, on: boolean) => update((s) => ({ ...s, topics: flag(s.topics, key, on) }));
export const togglePortfolio = (key: string, on: boolean) => update((s) => ({ ...s, portfolio: flag(s.portfolio, key, on) }));
export const toggleSolved = (kind: 'a2z' | 'nc', id: string, on: boolean) => update((s) => {
  const next = setSolved(s, kind, id, on, todayKey());
  const tag = `dsa:${canonOf(kind, id)}`;
  return on ? bump(next, (a) => ({ ...a, tasks: [...new Set([...a.tasks, tag])] })) : next;
});
export const setRevision = (key: string, on: boolean) => update((s) => flagRevision(s, key, todayKey(), on));
export const reviewProblem = (key: string, ok: boolean) => update((s) => review(s, key, todayKey(), ok));
export const setDsaNote = (key: string, v: string) => update((s) => ({ ...s, dsaNotes: { ...s.dsaNotes, [key]: v } }));
export const setDsaGoal = (n: number) => update((s) => ({ ...s, dsaGoal: Math.max(1, Math.min(20, Math.round(n) || 1)) }));
export const completeOnboarding = (p: Pick<AppState, 'start' | 'hours' | 'bridge'>) => update((s) => ({ ...s, ...p, onboarded: true }));
export const markBackedUp = () => update((s) => ({ ...s, lastBackupAt: Date.now(), backupSnoozeUntil: null }));
export const snoozeBackup = (days: number) => update((s) => ({ ...s, backupSnoozeUntil: Date.now() + days * 86_400_000 }));
/** Move the whole plan later by n weeks (negative to undo). */
export const shiftPlan = (weeks: number) => update((s) => ({ ...s, start: dayOffset(s.start, 7 * weeks) }));
export const setText = (field: 'notes' | 'weekEvidence' | 'weekNotionUrls' | 'skillEvidence' | 'portfolioLinks', key: string, v: string) =>
  update((s) => ({ ...s, [field]: { ...s[field], [key]: v } }));
export const setSkillLevel = (id: string, level: number) => update((s) => ({ ...s, skillLevels: { ...s.skillLevels, [id]: level } }));
export const logMinutes = (minutes: number) => update((s) => {
  const withAct = bump(s, (a) => ({ ...a, minutes: a.minutes + minutes }));
  return { ...withAct, timerSessions: [...withAct.timerSessions, { date: todayKey(), minutes, ts: Date.now() }].slice(-500) };
});
export const saveSettings = (p: Pick<AppState, 'start' | 'hours' | 'bridge'>) => update((s) => ({ ...s, ...p, path: '240' }));

export const reviewCurriculumTopic = (key: string, remembered: boolean) => update((s) => {
  const current = s.topicReviews[key] ?? { due: todayKey(), step: 0 };
  if (!curriculumTopicForKey.has(key)) return s;
  const intervals = [3, 7, 21, 60];
  const step = remembered ? Math.min(current.step + 1, intervals.length - 1) : 0;
  return { ...s, topicReviews: { ...s.topicReviews, [key]: { due: dayOffset(todayKey(), remembered ? intervals[step] : 1), step } } };
});
