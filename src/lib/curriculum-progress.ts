import { curriculum, topicRef } from '../data/curriculum';
import { degree } from '../data';
import type { AppState } from '../state/model';

export const curriculumLength = curriculum.weeks.length;
export const curriculumTopicId = (week: number, key: string) => `w${week}-r-${key}`;
export const bridgeTaskId = (week: number, bridge: 'stats' | 'cs') => `w${week}-bridge-${bridge}`;
export const curriculumTopicForKey = new Map(curriculum.weeks.flatMap(w => w.topics.map(key => [key, { ...topicRef(key), week: w.n, taskId: curriculumTopicId(w.n, key) }] as const)));
export const curriculumTopicsForWeek = (week: number) => (curriculum.weeks[week - 1]?.topics ?? []).map(key => curriculumTopicForKey.get(key)!);
export const isCurriculumTopicDone = (s: AppState, key: string) => {
  const item = curriculumTopicForKey.get(key);
  return !!s.topics[key] || !!(item && s.done[item.taskId]);
};
export const bridgeCandidateWeek = (week: number) => degree.bridgeWeeks.stats.includes(week) || degree.bridgeWeeks.cs.includes(week);
export const bridgeForWeek = (s: AppState, week: number) => {
  const bridge = s.bridge === 'stats' || s.bridge === 'cs' ? s.bridge : null;
  if (!bridge) return null;
  const lessonIndex = degree.bridgeWeeks[bridge].indexOf(week);
  if (lessonIndex < 0) return null;
  // The ID uses the lesson number so already checked bridge lessons survive a schedule change.
  return { id: bridgeTaskId(lessonIndex + 1, bridge), bridge, lessonIndex, text: degree.bridgeLessons[bridge][lessonIndex] };
};
