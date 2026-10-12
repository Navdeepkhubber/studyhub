import { curriculumTopicForKey, curriculumTopicsForWeek, isCurriculumTopicDone } from './curriculum-progress';
import type { AppState } from '../state/model';

export interface ScheduledTopic {
  key: string; trackId: string; track: string; groupIndex: number; itemIndex: number;
  group: string; text: string; priority: boolean; week: number; taskId: string;
}

/** Every roadmap checkpoint has one exact weekly task; no broad task credits unrelated topics. */
export const coverageForWeek = (week: number): ScheduledTopic[] => curriculumTopicsForWeek(week);
export const scheduledTopicForKey = (key: string): ScheduledTopic | undefined => curriculumTopicForKey.get(key);
export const isTopicCovered = (s: AppState, t: ScheduledTopic): boolean => isCurriculumTopicDone(s, t.key);
export const coveredTopicCount = (s: AppState): number => [...curriculumTopicForKey.keys()].filter(key => isCurriculumTopicDone(s, key)).length;
