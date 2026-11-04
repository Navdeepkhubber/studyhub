import { curriculumTopicsForWeek } from './curriculum-progress';
import type { AppState } from '../state/model';
import { portfolioMilestonesForWeek } from './week-activities';

/** Planning estimates, including hands-on work. They are guidance, not a claim about course duration. */
export function checkpointMinutes(text: string, priority = false): number {
  if (/basics|introduction|overview|what |setup|syntax|definitions/i.test(text) && text.length < 100) return 45;
  if (priority || /build|implement|train|deploy|evaluate|pipeline|system design|experiment|architecture|distributed/i.test(text)) return 90;
  return 60;
}
export function weekWorkload(n: number, s: AppState) {
  const topics = curriculumTopicsForWeek(n);
  const topicMinutes = topics.reduce((sum, t) => sum + checkpointMinutes(t.text, t.priority), 0);
  const finishMinutes = 60;
  const reviewMinutes = 30;
  const portfolioMinutes = portfolioMilestonesForWeek(n).length * 90;
  const coreMinutes = topicMinutes + finishMinutes + reviewMinutes + portfolioMinutes;
  // Schedule the daily problem goal on study days rather than assuming one hour per block.
  const dsaPracticeDays = Math.min(4, Math.max(1, Math.floor(s.hours / 3)));
  const dsaMinutesPerDay = s.dsaGoal * 25;
  const dsaMinutesPerWeek = dsaPracticeDays * dsaMinutesPerDay;
  const capacity = s.hours * 60;
  const dsaFeasible = dsaMinutesPerDay <= sessionTargetMinutes(s.hours) && dsaMinutesPerWeek < capacity;
  const calendarWeeks = Math.max(1, Math.ceil(coreMinutes / (dsaFeasible ? capacity - dsaMinutesPerWeek : capacity)));
  const dsaMinutes = dsaFeasible ? dsaMinutesPerWeek * calendarWeeks : 0;
  const total = coreMinutes + dsaMinutes;
  return { topicMinutes, finishMinutes, reviewMinutes, dsaMinutes, dsaMinutesPerDay, dsaMinutesPerWeek, dsaPracticeDays, dsaFeasible, portfolioMinutes, total, calendarWeeks };
}
export const sessionsPerCalendarWeek = (hours: number) => Math.max(2, Math.ceil(hours * 60 / 180));
export const sessionTargetMinutes = (hours: number) => Math.ceil(hours * 60 / sessionsPerCalendarWeek(hours));
export function studySessions(n: number, s: AppState) {
  const topics = curriculumTopicsForWeek(n);
  const workload = weekWorkload(n, s);
  const span = workload.calendarWeeks;
  const perWeek = sessionsPerCalendarWeek(s.hours);
  const slots = span * perWeek;
  const days = Array.from({ length: slots }, (_, i) => Math.floor(i / perWeek) * 7 + (perWeek===4 ? [0, 2, 4, 6][i % 4] : Math.floor((i % perWeek) * 7 / perWeek)));
  const buckets: { day: number; titles: string[]; minutes: number }[] = days.map(day => ({ day, titles: [], minutes: 0 }));
  if (workload.dsaFeasible) {
    for (let week = 0; week < span; week++) {
      for (let practiceDay = 0; practiceDay < workload.dsaPracticeDays; practiceDay++) {
        const index = week * perWeek + Math.floor((practiceDay + 0.5) * perWeek / workload.dsaPracticeDays);
        buckets[index].titles.push(`Solve ${s.dsaGoal} DSA ${s.dsaGoal === 1 ? 'problem' : 'problems'} and review earlier solutions`);
        buckets[index].minutes += workload.dsaMinutesPerDay;
      }
    }
  }
  const items = [
    ...topics.map(t => ({ title: t.text, minutes: checkpointMinutes(t.text, t.priority) })),
    ...portfolioMilestonesForWeek(n).map(m => ({ title: `${m.project.name}: ${m.criterion}`, minutes: 90 })),
    { title: 'Recall completed topics without notes', minutes: 30 },
    { title: 'Save evidence and finish the week', minutes: 60 },
  ];
  const target = sessionTargetMinutes(s.hours);
  let slot = 0;
  for (const item of items) {
    let remaining = item.minutes;
    while (remaining > 0) {
      if (buckets[slot].minutes >= target && slot < slots - 1) slot++;
      const portion = Math.min(remaining, Math.max(1, target - buckets[slot].minutes));
      buckets[slot].titles.push(remaining === item.minutes && portion === remaining ? item.title : `${item.title} (${remaining === item.minutes ? 'start' : 'continue'})`);
      buckets[slot].minutes += portion;
      remaining -= portion;
      if (remaining > 0 && slot < slots - 1) slot++;
    }
  }
  return buckets.filter(b => b.titles.length);
}
