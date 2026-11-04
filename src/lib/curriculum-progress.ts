import { curriculum, topicRef } from '../data/curriculum';
import type { AppState } from '../state/model';
export const curriculumLength = curriculum.weeks.length;
export const curriculumTopicId = (week: number, key: string) => 'w'+week+'-r-'+key;
export const bridgeTaskId = (week: number, bridge: 'stats' | 'cs') => 'w'+week+'-bridge-'+bridge;
export const curriculumTopicForKey = new Map(curriculum.weeks.flatMap(w => w.topics.map(key => [key, { ...topicRef(key), week: w.n, taskId: curriculumTopicId(w.n, key) }] as const)));
export const curriculumTopicsForWeek = (week: number) => (curriculum.weeks[week - 1]?.topics ?? []).map(key => curriculumTopicForKey.get(key)!);
export const isCurriculumTopicDone = (s: AppState, key: string) => { const item = curriculumTopicForKey.get(key); return !!s.topics[key] || !!(item && s.done[item.taskId]); };
// Legacy bridge choices remain readable in old backups but are no longer part of this curriculum.
export const bridgeCandidateWeek = (_week: number) => false;
export const bridgeForWeek = (_s: AppState, _week: number) => null;
