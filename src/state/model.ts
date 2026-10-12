import type { Bridge } from '../data/types';
import { coveredTopicCount } from '../lib/coverage';

export interface Activity { minutes: number; tasks: string[]; missions: number }
export interface TimerSession { date: string; minutes: number; ts: number }
export interface AppState {
  done: Record<string, boolean>;
  topics: Record<string, boolean>;
  dsaDone: Record<string, boolean>;
  neetDone: Record<string, boolean>;
  notes: Record<string, string>;
  missions: Record<string, boolean>;
  weekEvidence: Record<string, string>;
  weekNotionUrls: Record<string, string>;
  topicReviews: Record<string, TopicReview>;
  skillLevels: Record<string, number>;
  skillEvidence: Record<string, string>;
  portfolio: Record<string, boolean>;
  portfolioLinks: Record<string, string>;
  start: string;
  hours: number;
  path: '240';
  bridge: Bridge;
  activity: Record<string, Activity>;
  timerSessions: TimerSession[];
  /** First-run setup finished. Older backups with progress count as set up. */
  onboarded: boolean;
  lastBackupAt: number | null;
  backupSnoozeUntil: number | null;
  /** Problems solved per day (canonical keys), for the daily goal. */
  dsaLog: Record<string, string[]>;
  dsaGoal: number;
  dsaRevise: Record<string, Revision>;
  dsaNotes: Record<string, string>;
  dsaLast: { list: string; key: string } | null;
}
export interface TopicReview { due: string; step: number }
export interface Revision { due: string; step: number; added: number }

/** Same key as the original Study Compass, so its JSON backups restore here unchanged. */
export const STORAGE_KEY = 'study-compass-v2';

export const defaultState = (): AppState => ({
  done: {}, topics: {}, dsaDone: {}, neetDone: {}, notes: {}, missions: {}, weekEvidence: {}, weekNotionUrls: {}, topicReviews: {},
  skillLevels: {}, skillEvidence: {}, portfolio: {}, portfolioLinks: {},
  start: '2026-10-12', hours: 12, path: '240', bridge: 'unknown', activity: {}, timerSessions: [],
  onboarded: false, lastBackupAt: null, backupSnoozeUntil: null, dsaLog: {}, dsaGoal: 2, dsaRevise: {}, dsaNotes: {}, dsaLast: null,
});

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const rec = <T>(v: unknown, ok: (x: unknown) => x is T): Record<string, T> =>
  isObj(v) ? Object.fromEntries(Object.entries(v).filter(([, x]) => ok(x))) as Record<string, T> : {};
const isBool = (x: unknown): x is boolean => typeof x === 'boolean';
const isStr = (x: unknown): x is string => typeof x === 'string';
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isAct = (x: unknown): x is Activity => isObj(x);

/** Coerce anything (old backups, corrupt storage) into a valid AppState. Never throws. */
export function sanitize(raw: unknown): AppState {
  const d = defaultState();
  if (!isObj(raw)) return d;
  const bridge = (['unknown', 'stats', 'cs', 'other'] as const).find((b) => b === raw.bridge) ?? d.bridge;
  const activity = Object.fromEntries(
    Object.entries(rec(raw.activity, isAct)).map(([k, a]) => [k, {
      minutes: isNum(a.minutes) ? a.minutes : 0,
      tasks: Array.isArray(a.tasks) ? a.tasks.filter(isStr) : [],
      missions: isNum(a.missions) ? a.missions : 0,
    }]),
  );
  const done = rec(raw.done, isBool), dsaDone = rec(raw.dsaDone, isBool);
  const hasProgress = Object.keys(done).length > 0 || Object.keys(dsaDone).length > 0;
  const isRev = (x: unknown): x is Revision => isObj(x) && isStr(x.due) && isNum(x.step) && isNum(x.added);
  const last = isObj(raw.dsaLast) && isStr(raw.dsaLast.list) && isStr(raw.dsaLast.key) ? { list: raw.dsaLast.list, key: raw.dsaLast.key } : null;
  const isStrArr = (x: unknown): x is string[] => Array.isArray(x) && x.every(isStr);
  return {
    done, topics: rec(raw.topics, isBool), dsaDone,
    neetDone: rec(raw.neetDone, isBool), notes: rec(raw.notes, isStr), missions: rec(raw.missions, isBool),
    weekEvidence: rec(raw.weekEvidence, isStr), weekNotionUrls: rec(raw.weekNotionUrls, isStr),
    topicReviews: rec(raw.topicReviews, (x): x is TopicReview => isObj(x) && isStr(x.due) && isNum(x.step)), skillLevels: rec(raw.skillLevels, isNum),
    skillEvidence: rec(raw.skillEvidence, isStr), portfolio: rec(raw.portfolio, isBool),
    portfolioLinks: rec(raw.portfolioLinks, isStr),
    start: isStr(raw.start) && /^\d{4}-\d{2}-\d{2}$/.test(raw.start) ? raw.start : d.start,
    hours: isNum(raw.hours) && raw.hours >= 2 && raw.hours <= 40 ? raw.hours : d.hours,
    path: '240', bridge, activity,
    timerSessions: Array.isArray(raw.timerSessions)
      ? raw.timerSessions.filter((s): s is TimerSession => isObj(s) && isStr(s.date) && isNum(s.minutes) && isNum(s.ts)).slice(-500)
      : [],
    onboarded: raw.onboarded === true || hasProgress,
    lastBackupAt: isNum(raw.lastBackupAt) ? raw.lastBackupAt : null,
    backupSnoozeUntil: isNum(raw.backupSnoozeUntil) ? raw.backupSnoozeUntil : null,
    dsaLog: rec(raw.dsaLog, isStrArr),
    dsaGoal: isNum(raw.dsaGoal) && raw.dsaGoal >= 1 && raw.dsaGoal <= 20 ? Math.round(raw.dsaGoal) : d.dsaGoal,
    dsaRevise: rec(raw.dsaRevise, isRev),
    dsaNotes: rec(raw.dsaNotes, isStr),
    dsaLast: last,
  };
}

/** Anything worth backing up? Used to decide whether to nag about backups. */
export const hasMeaningfulProgress = (s: AppState): boolean =>
  [s.done, s.dsaDone, s.neetDone, s.missions, s.topics, s.notes, s.weekNotionUrls, s.topicReviews, s.skillLevels].some((m) => Object.keys(m).length > 0);

export interface BackupSummary { tasks: number; roadmapTopics: number; problems: number; notes: number; activeDays: number }
export const summarize = (s: AppState): BackupSummary => ({
  tasks: Object.keys(s.done).length,
  roadmapTopics: coveredTopicCount(s),
  problems: new Set([...Object.keys(s.dsaDone), ...Object.keys(s.neetDone)]).size,
  notes: Object.values(s.notes).filter(Boolean).length + Object.values(s.weekNotionUrls).filter(Boolean).length + Object.values(s.dsaNotes).filter(Boolean).length,
  activeDays: Object.values(s.activity).filter(isActive).length,
});

/** A backup is valid if it parses to an object that looks like our state (legacy: has `done`). */
export function parseBackup(text: string): AppState {
  const v: unknown = JSON.parse(text);
  if (!isObj(v) || !isObj(v.done)) throw new Error('Not a Study Hub backup');
  return sanitize(v);
}

export const isActive = (a: Activity | undefined): boolean => !!a && (a.minutes > 0 || a.tasks.length > 0 || a.missions > 0);
