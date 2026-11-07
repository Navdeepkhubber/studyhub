import { portfolioProjects } from '../data';
import { curriculumTopicForKey, isCurriculumTopicDone } from './curriculum-progress';
import { todayKey } from './dates';
import type { AppState } from '../state/model';

/**
 * Portfolio criteria become scheduled weekly milestones with shared checkmarks.
 * Each project's criteria are spread evenly across the weeks it declares in portfolio.json ("Weeks 25–38");
 * a project spanning the whole programme ("Across programme") is spread over weeks 10–70.
 * Derived from the data so a new project never silently drops out of the weekly plan.
 */
function milestoneWeek(weeks: string, index: number, count: number) {
  const range = weeks.match(/(\d+)\D+(\d+)/);
  const [from, to] = range ? [+range[1], +range[2]] : [10, 70];
  return count > 1 ? Math.round(from + (index * (to - from)) / (count - 1)) : to;
}
export function portfolioMilestonesForWeek(week: number) {
  return portfolioProjects.flatMap(project => project.criteria.flatMap((criterion, index) =>
    milestoneWeek(project.weeks, index, project.criteria.length) === week ? [{ key: `${project.id}-${index}`, project, criterion }] : []));
}
export function dueTopicReviews(s: AppState, today = todayKey()) {
  return [...curriculumTopicForKey.values()]
    .filter(t => isCurriculumTopicDone(s, t.key) && (!s.topicReviews[t.key] || s.topicReviews[t.key].due <= today))
    .sort((a, b) => (s.topicReviews[a.key]?.due ?? '').localeCompare(s.topicReviews[b.key]?.due ?? ''));
}
