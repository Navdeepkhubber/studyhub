import planJson from './curriculum-plan.json';
import roadmapJson from './roadmap.json';
import type { Roadmap } from './types';

export interface CurriculumWeek { n: number; title: string; topics: string[] }
export interface CurriculumPhase { name: string; start: number; end: number }
export const curriculum = planJson as { version: number; source: string; weeks: CurriculumWeek[]; phases: CurriculumPhase[] };
export const curriculumWeek = (n: number): CurriculumWeek => curriculum.weeks[n - 1];
const sourceRoadmap = roadmapJson as unknown as Roadmap;
export const topicRef = (key: string) => {
  const [trackId, groupIndex, itemIndex] = key.split('-');
  const track = sourceRoadmap.tracks.find((t) => t.id === trackId)!;
  const group = track.groups[Number(groupIndex)];
  const raw = group.i[Number(itemIndex)];
  return { key, trackId, track: track.name, groupIndex: Number(groupIndex), itemIndex: Number(itemIndex), group: group.t, text: raw.replace(/^\*/, ''), priority: raw.startsWith('*') };
};
