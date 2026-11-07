import { describe, expect, it } from 'vitest';
import { defaultState, sanitize, summarize } from '../state/model';
import { fuzzyFilter, fuzzyScore } from './fuzzy';
import { a2zItems, canonA2z, describe as describeKey, dueRevisions, flagRevision, nextUp, review, setSolved, solvedToday } from './dsa';
import { behindTasks, daysUntilStart } from './progress';

describe('fuzzy search', () => {
  it('matches substrings, subsequences and multiple words; rejects non-matches', () => {
    expect(fuzzyScore('linked', 'Linked List')).toBeGreaterThan(0);
    expect(fuzzyScore('lnkd lst', 'Linked List')).toBeGreaterThan(0);
    expect(fuzzyScore('xyz', 'Linked List')).toBe(-1);
    expect(fuzzyScore('list linked', 'Linked List')).toBeGreaterThan(0);
  });
  it('ranks a word-start substring above a scattered match', () => {
    const r = fuzzyFilter(['Reverse a LinkedList', 'Two Sum', 'Remove Linked List Elements'], 'two', (x) => x);
    expect(r[0]).toBe('Two Sum');
    expect(fuzzyFilter(['abc', 'Binary Search'], 'bin srch', (x) => x)).toEqual(['Binary Search']);
  });
});

describe('model: new fields', () => {
  it('marks old backups with progress as onboarded and fills defaults', () => {
    const s = sanitize({ done: { 'w1-t0': true } });
    expect(s.onboarded).toBe(true);
    expect(s.dsaGoal).toBe(2); expect(s.dsaRevise).toEqual({}); expect(s.lastBackupAt).toBeNull();
    expect(sanitize({}).onboarded).toBe(false);
    expect(sanitize({ dsaGoal: 99, dsaRevise: { k: { due: 'x' } }, dsaLog: { d: [1, 2] } })).toMatchObject({ dsaGoal: 2, dsaRevise: {}, dsaLog: {} });
  });
  it('summarizes a backup for the restore comparison', () => {
    const s = sanitize({ done: { a: true, b: true }, dsaDone: { x: true }, neetDone: { y: true }, notes: { 1: 'n', 2: '' } });
    expect(summarize({ ...s, topics: { 'C-0-0': true } })).toMatchObject({ tasks: 2, roadmapTopics: 1, problems: 2, notes: 1 });
  });
});

describe('dsa habits', () => {
  const today = '2026-11-10';
  it('logs solves per day and un-logs on untick', () => {
    const it0 = a2zItems[0];
    let s = setSolved(defaultState(), 'a2z', it0.id, true, today);
    expect(solvedToday(s, today)).toBe(1);
    expect(s.dsaLast).toEqual({ list: 'a2z', key: canonA2z(it0) });
    s = setSolved(s, 'a2z', it0.id, false, today);
    expect(solvedToday(s, today)).toBe(0);
  });
  it('suggests the next unsolved problem after the last one ticked', () => {
    const s = setSolved(defaultState(), 'a2z', a2zItems[0].id, true, today);
    expect(nextUp(s, 'a2z')?.key).toBe(canonA2z(a2zItems[1]));
    expect(nextUp(defaultState(), 'a2z')?.key).toBe(canonA2z(a2zItems[0]));
  });
  it('schedules revisions with growing gaps and resets when still hard', () => {
    const k = canonA2z(a2zItems[5]);
    let s = flagRevision(defaultState(), k, today, true);
    expect(s.dsaRevise[k].due).toBe('2026-11-11');
    expect(dueRevisions(s, today)).toEqual([]);
    expect(dueRevisions(s, '2026-11-11')).toEqual([k]);
    s = review(s, k, '2026-11-11', true); expect(s.dsaRevise[k]).toMatchObject({ step: 1, due: '2026-11-14' });
    s = review(s, k, '2026-11-14', true); expect(s.dsaRevise[k]).toMatchObject({ step: 2, due: '2026-11-21' });
    s = review(s, k, '2026-11-21', false); expect(s.dsaRevise[k]).toMatchObject({ step: 0, due: '2026-11-22' });
    expect(flagRevision(s, k, today, false).dsaRevise[k]).toBeUndefined();
  });
  it('describes canonical keys for both trackers', () => {
    const d = describeKey(canonA2z(a2zItems[0]));
    expect(d?.title).toBe(a2zItems[0].title); expect(d?.href).toContain('/dsa?tab=a2z');
    expect(describeKey('lc:two-sum')?.title).toBeTruthy();
  });
});

describe('plan pacing', () => {
  it('counts down before the start and reports unfinished past-week tasks', () => {
    const s = { ...defaultState(), start: '2026-11-02' };
    expect(daysUntilStart(s, new Date('2026-10-10T09:00:00'))).toBe(23);
    expect(behindTasks(s, new Date('2026-10-10T09:00:00'))).toEqual([]);
    const inWeek3 = new Date('2026-11-17T09:00:00');
    const behind = behindTasks(s, inWeek3);
    expect(behind.length).toBeGreaterThan(0);
    expect(behind.every((t) => /^w[12]-/.test(t.id))).toBe(true);
    const doneAll = { ...s, done: Object.fromEntries(behind.map((t) => [t.id, true])), weekEvidence: { 1: 'https://example.com/week-1', 2: 'https://example.com/week-2' } };
    expect(behindTasks(doneAll, inWeek3)).toEqual([]);
  });
});
