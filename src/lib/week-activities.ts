import { portfolioProjects } from '../data';
import { curriculumTopicForKey, isCurriculumTopicDone } from './curriculum-progress';
import { todayKey } from './dates';
import type { AppState } from '../state/model';

/** Existing portfolio criteria become scheduled weekly milestones with shared checkmarks. */
const milestoneWeeks: Record<string, number[]> = {
  pipeline: [20, 34, 45, 62, 69],
  forecast: [24, 31, 45, 58, 68],
  rag: [42, 47, 52, 60, 69],
};
export function portfolioMilestonesForWeek(week: number) {
  return portfolioProjects.flatMap(project => project.criteria.flatMap((criterion, index) =>
    milestoneWeeks[project.id]?.[index] === week ? [{ key: `${project.id}-${index}`, project, criterion }] : []));
}
export function dueTopicReviews(s: AppState, today = todayKey()) {
  return [...curriculumTopicForKey.values()]
    .filter(t => isCurriculumTopicDone(s, t.key) && (!s.topicReviews[t.key] || s.topicReviews[t.key].due <= today))
    .sort((a, b) => (s.topicReviews[a.key]?.due ?? '').localeCompare(s.topicReviews[b.key]?.due ?? ''));
}
