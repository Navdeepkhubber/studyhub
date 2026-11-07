import { describe, expect, it } from 'vitest';
import { defaultState, parseBackup, sanitize } from './../state/model';
import { calcStreak, longestStreak, currentWeek, weekPercent, weekTasks, weekOutputReady, weekDate } from './progress';
import { coverageForWeek, isTopicCovered } from './coverage';
import { a2zItems, a2zByLc, ncBySlug, ncSolved, a2zSolved, setSolved } from './dsa';
import { roadmap, neetcode, portfolioProjects, certifications } from '../data';
import { certReadiness } from './cert-readiness';
import { roadmapViews, roadmapHas } from '../data/roadmaps';
import { studyResourcesFor } from '../data/study-resources';
import { weekWorkload, studySessions, sessionTargetMinutes } from './study-workload';
import { portfolioMilestonesForWeek, dueTopicReviews } from './week-activities';
import { mergeStates } from '../state/merge';

describe('state', () => {
  it('sanitizes garbage without throwing', () => {
    expect(sanitize(null)).toEqual(defaultState());
    const s = sanitize({ done: { a: true, b: 'x' }, hours: 999, bridge: 'nope', start: 'bad', activity: { '2026-01-01': { minutes: 'x' } } });
    expect(s.done).toEqual({ a: true });
    expect(s.hours).toBe(12); expect(s.bridge).toBe('unknown'); expect(s.start).toBe(defaultState().start);
    expect(s.activity['2026-01-01']).toEqual({ minutes: 0, tasks: [], missions: 0 });
  });
  it('accepts a legacy backup (no neetDone) and rejects non-backups', () => {
    const s = parseBackup(JSON.stringify({ done: { 'w1-t0': true }, dsaDone: { 'a2z-x': true }, path: '240' }));
    expect(s.done['w1-t0']).toBe(true); expect(s.neetDone).toEqual({});
    expect(() => parseBackup('{"hello":1}')).toThrow();
    expect(() => parseBackup('nope')).toThrow();
  });
});

describe('progress', () => {
  it('computes streaks, allowing today to be empty', () => {
    const s = defaultState();
    s.activity = { '2026-10-08': { minutes: 10, tasks: [], missions: 0 }, '2026-10-09': { minutes: 0, tasks: ['x'], missions: 0 } };
    expect(calcStreak(s, '2026-10-10')).toBe(2);
    expect(calcStreak(s, '2026-10-12')).toBe(0);
    expect(longestStreak(s)).toBe(2);
  });
  it('clamps the current week to the complete curriculum', () => {
    // 20 hours a week keeps block 1 to one calendar week, so this tests the boundary itself.
    const s = { ...defaultState(), start: '2026-10-12', hours: 20 };
    expect(weekWorkload(1, s).calendarWeeks).toBe(1);
    expect(currentWeek(s, new Date('2026-01-01'))).toBe(1);
    expect(currentWeek(s, new Date('2030-01-01'))).toBe(roadmap.weeks.length);
    expect(currentWeek(s, new Date('2026-10-20T12:00:00'))).toBe(2);
  });
  it('changes weeks on calendar boundaries across New Zealand daylight saving', () => {
    const previous = process.env.TZ;
    try {
      process.env.TZ = 'Pacific/Auckland';
      const s = { ...defaultState(), start: '2026-09-21', hours: 20 };
      expect(currentWeek(s, new Date('2026-09-27T23:59:00'))).toBe(1);
      expect(currentWeek(s, new Date('2026-09-28T00:00:00'))).toBe(2);
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  });
  it('merges independent tab edits, including separate keys in one map', () => {
    const base = defaultState();
    const local = { ...base, done: { 'w1-t0': true }, notes: { 1: 'local' } };
    const remote = { ...base, done: { 'w1-t1': true }, notes: { 2: 'remote' } };
    expect(mergeStates(base, local, remote)).toMatchObject({
      done: { 'w1-t0': true, 'w1-t1': true }, notes: { 1: 'local', 2: 'remote' },
    });
    const localDay = { ...base, activity: { today: { minutes: 0, tasks: ['a'], missions: 0 } } };
    const remoteDay = { ...base, activity: { today: { minutes: 0, tasks: ['b'], missions: 0 } } };
    expect(mergeStates(base, localDay, remoteDay).activity.today.tasks).toEqual(['a', 'b']);
    expect(mergeStates(base,
      { ...base, activity: { today: { minutes: 10, tasks: [], missions: 0 } } },
      { ...base, activity: { today: { minutes: 15, tasks: [], missions: 0 } } },
    ).activity.today.minutes).toBe(25);
  });
  it('counts exact topic tasks once and does not credit old broad tasks', () => {
    const s = defaultState(); const w = roadmap.weeks[1];
    const first = coverageForWeek(w.n)[0];
    expect(isTopicCovered(s, first)).toBe(false);
    s.done[`w${w.n}-t0`] = true; // an old broad task must not credit a roadmap topic
    expect(isTopicCovered(s, first)).toBe(false);
    s.done[first.taskId] = true;
    expect(isTopicCovered(s, first)).toBe(true);
    expect(weekPercent(s, w)).toBe(Math.round((1 / weekTasks(w,s).length) * 100));
    s.topics[first.key] = true; // old manual ticks remain visible, but do not add duplicate progress
    expect(weekPercent(s, w)).toBe(Math.round((1 / weekTasks(w,s).length) * 100));
    delete s.done[first.taskId];
    expect(isTopicCovered(s, first)).toBe(true);
    // Bridge choices from old backups stay readable but are retired in the cybersecurity curriculum.
    for (const bridge of ['stats', 'cs'] as const) {
      s.bridge = bridge;
      for (const week of roadmap.weeks) expect(weekTasks(week, s).some(t => t.tag === 'BRIDGE')).toBe(false);
    }
  });
});

describe('dsa data', () => {
  it('has unique ids and the expected NeetCode counts', () => {
    expect(new Set(a2zItems.map((i) => i.id)).size).toBe(a2zItems.length);
    expect(neetcode.meta.counts).toMatchObject({ nc150: 150, blind75: 75 });
  });
  it('keeps twin problems in sync across trackers', () => {
    const lc = [...a2zByLc.keys()].find((k) => ncBySlug.has(k))!;
    let s = setSolved(defaultState(), 'nc', lc, true);
    const item = a2zItems.find((i) => i.lc === lc)!;
    expect(a2zSolved(s, item)).toBe(true);
    s = setSolved(s, 'a2z', item.id, false);
    expect(ncSolved(s, ncBySlug.get(lc)!)).toBe(false);
    expect(s.neetDone[lc]).toBeUndefined();
  });
  it('only ever links takeUforward articles at the current blog path', () => {
    for (const it of a2zItems) for (const r of it.reads) if (r.source === 'tuf')
      expect(r.url).toMatch(/^https:\/\/takeuforward\.org\/blogs\/data-structure-and-algorithm\/[\w-]+$/);
  });
});

describe('roadmap views', () => {
  it('maps role and course views to the right security groups', () => {
    const has = (viewId: string, trackId: string, groupIndex: number) => {
      const view = roadmapViews.find(v => v.id === viewId)!;
      const track = roadmap.tracks.find(t => t.id === trackId)!;
      return roadmapHas(view, track, track.groups[groupIndex]);
    };
    const C = roadmap.tracks.find(t => t.id === 'C')!;
    const cg = (needle: string) => C.groups.findIndex(g => g.t.toLowerCase().includes(needle.toLowerCase()));
    expect(has('pentester', 'C', cg('Web application'))).toBe(true);
    expect(has('pentester', 'C', cg('Penetration testing'))).toBe(true);
    expect(has('soc-dfir', 'C', cg('Digital forensics'))).toBe(true);
    expect(has('comp830', 'C', cg('Cryptography'))).toBe(true);
    expect(has('enge817', 'C', cg('Research methods'))).toBe(true);
    expect(has('scripting', 'C', cg('Scripting and automation'))).toBe(true);
  });
  it('has 21 views and each selects at least one group', () => {
    expect(roadmapViews).toHaveLength(21);
    for (const v of roadmapViews) {
      const n = roadmap.tracks.flatMap((t) => t.groups.map((g) => roadmapHas(v, t, g))).filter(Boolean).length;
      expect(n, v.id).toBeGreaterThan(0);
    }
  });
});

describe('curriculum ordering', () => {
  it('never schedules a skill\'s later level before an earlier one', () => {
    const rank = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;
    const best = new Map<string, number>();
    for (const w of roadmap.weeks) for (const t of coverageForWeek(w.n)) {
      if (!t.level) continue;
      const prev = best.get(t.group) ?? -1;
      expect(rank[t.level], `${t.group}: ${t.text} (week ${w.n})`).toBeGreaterThanOrEqual(prev);
      best.set(t.group, Math.max(prev, rank[t.level]));
    }
  });
});

describe('certification plan', () => {
  it('links every exam to its exam-prep checkpoints and feeding skills', () => {
    const r = certReadiness(defaultState());
    for (const c of certifications.certs) {
      const x = r.find(y => y.id === c.id)!;
      if (c.exam) expect(x.examKeys.length, c.id).toBeGreaterThan(0);
      expect(x.examPct).toBe(0);
    }
    const s = defaultState();
    const sec = r.find(y => y.id === 'secplus')!;
    sec.examKeys.forEach(k => { s.topics[k] = true; });
    expect(certReadiness(s).find(y => y.id === 'secplus')!.examPct).toBe(100);
  });
});

describe('guided weekly study', () => {
  it('paces every block within the selected weekly hours and schedules all estimated minutes', () => {
    for (const hours of [2, 12, 40]) {
      const s = { ...defaultState(), hours };
      for (const w of roadmap.weeks) {
        const work = weekWorkload(w.n, s);
        expect(work.calendarWeeks * hours * 60).toBeGreaterThanOrEqual(work.total);
        expect(studySessions(w.n, s).reduce((sum, session) => sum + session.minutes, 0)).toBe(work.total);
        expect(studySessions(w.n, s).every(session => session.minutes <= sessionTargetMinutes(hours))).toBe(true);
      }
    }
    const normal = weekWorkload(1, defaultState());
    expect(normal.dsaMinutes).toBe(normal.dsaMinutesPerWeek * normal.calendarWeeks);
    expect(normal.dsaMinutesPerWeek).toBe(4 * 2 * 25);
    // DSA runs on 4 days in every calendar week the block spans.
    expect(studySessions(1, defaultState()).filter(day => day.titles.some(title => title.includes('DSA')))).toHaveLength(4 * normal.calendarWeeks);
    const impossible = { ...defaultState(), hours: 2, dsaGoal: 20 };
    expect(weekWorkload(1, impossible).dsaFeasible).toBe(false);
    expect(studySessions(1, impossible).some(day => day.titles.some(title => title.includes('DSA')))).toBe(false);
    const slow = { ...defaultState(), hours: 2 };
    expect(weekDate(slow, 2).getTime()).toBeGreaterThan(weekDate(defaultState(), 2).getTime());
  });
  it('gives every scheduled checkpoint a reading, practice and a focused fallback search', () => {
    const first = studyResourcesFor(coverageForWeek(1)[0]);
    expect(first.learn[1]).toMatch(/^https:\/\//);
    expect(first.targeted).toBe(true);
    for (let week = 1; week <= roadmap.weeks.length; week++) {
      for (const topic of coverageForWeek(week)) {
        const resources = studyResourcesFor(topic);
        expect(resources.learn[1]).toMatch(/^https:\/\//);
        expect(resources.practice[1]).toMatch(/^https:\/\//);
        expect(resources.lookup).toMatch(/^https:\/\/www.google.com\/search/);
      }
    }
  });
  it('keeps portfolio milestones in the week and final proof honest', () => {
    const s = defaultState();
    expect(portfolioMilestonesForWeek(15).some(m => m.key === 'webapp-0')).toBe(true);
    expect(weekTasks(roadmap.weeks[14], s).some(t => t.portfolioKey === 'webapp-0')).toBe(true);
    expect(weekOutputReady(s, 1)).toBe(false);
    for (const t of coverageForWeek(1)) s.topics[t.key] = true;
    expect(weekOutputReady(s, 1)).toBe(false);
    s.weekNotionUrls['1'] = 'https://www.notion.so/example';
    expect(weekOutputReady(s, 1)).toBe(true);
    s.done['w1-output'] = true;
    expect(weekPercent(s, roadmap.weeks[0])).toBe(100);
    delete s.topics[coverageForWeek(1)[0].key];
    expect(weekPercent(s, roadmap.weeks[0])).toBeLessThan(100);
  });
  it('schedules every portfolio criterion exactly once, inside its project\'s weeks', () => {
    const scheduled = new Map<string, number>();
    for (let week = 1; week <= roadmap.weeks.length; week++) {
      for (const m of portfolioMilestonesForWeek(week)) {
        expect(scheduled.has(m.key)).toBe(false);
        scheduled.set(m.key, week);
      }
    }
    for (const project of portfolioProjects) {
      const range = project.weeks.match(/(\d+)\D+(\d+)/);
      project.criteria.forEach((_, i) => {
        const week = scheduled.get(`${project.id}-${i}`);
        expect(week, `${project.id}-${i} is never scheduled`).toBeDefined();
        if (range) { expect(week!).toBeGreaterThanOrEqual(+range[1]); expect(week!).toBeLessThanOrEqual(+range[2]); }
      });
    }
  });
  it('preserves Notion links and topic reviews in backups', () => {
    const s = parseBackup(JSON.stringify({ done: {}, weekNotionUrls: { 1: 'https://www.notion.so/example' }, topicReviews: { 'C-0-0': { due: '2026-10-11', step: 0 } } }));
    expect(s.weekNotionUrls['1']).toBe('https://www.notion.so/example');
    expect(s.topicReviews['C-0-0']?.due).toBe('2026-10-11');
    s.topics['C-0-0'] = true;
    expect(dueTopicReviews(s, '2026-10-11').map(t => t.key)).toContain('C-0-0');
    delete s.topicReviews['C-0-0'];
    expect(dueTopicReviews(s, '2026-10-11').map(t => t.key)).toContain('C-0-0');
  });
});
