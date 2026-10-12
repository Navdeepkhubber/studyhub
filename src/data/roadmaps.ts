import { roadmap } from './index-roadmap';
import type { Track, TopicGroup } from './types';

/**
 * The 13 roadmap views in the Topic atlas, rebuilt from the 13 PDFs in your Roadmap folder.
 * Each view lists [trackId, groupIndex] pairs from roadmap.json.
 *
 * Each source view includes its domain topics and the prerequisite groups explicitly named by
 * that PDF. A group can appear in several views because the study task is shared.
 * The PDFs use short diagram labels; the Atlas checkpoints combine related labels into a
 * workable task. Source overlap is therefore intentional.
 */
export interface RoadmapView { id: string; name: string; source: string; url: string; groups: [track: string, group: number][] }

export const roadmapViews: RoadmapView[] = [
  { id: 'data-engineer', name: 'Data Engineer', source: 'data-engineer.pdf', url: 'https://roadmap.sh/data-engineer', groups: [['A', 3], ['A', 4], ['A', 5], ['A', 6], ['A', 7], ['A', 8], ['A', 11], ['A', 12], ['A', 13], ['A', 14], ['A', 16], ['A', 17], ['A', 18], ['A', 19], ['A', 20], ['A', 0], ['A', 1], ['A', 2], ['A', 21], ['A', 22], ['D', 0]] },
  { id: 'sql', name: 'SQL', source: 'sql.pdf', url: 'https://roadmap.sh/sql', groups: [['A', 0], ['A', 1], ['A', 21], ['D', 1]] },
  { id: 'python', name: 'Python', source: 'python.pdf', url: 'https://roadmap.sh/python', groups: [['A', 2], ['A', 22], ['D', 0]] },
  { id: 'python-data-analysis', name: 'Python for Data Analysis', source: 'python-data-analysis.pdf', url: 'https://roadmap.sh/python-data-analysis', groups: [['C', 3], ['C', 10], ['C', 11], ['C', 12], ['A', 21], ['C', 4], ['C', 5]] },
  { id: 'r-programming', name: 'R Programming', source: 'r-programming.pdf', url: 'https://roadmap.sh/roadmaps', groups: [['F', 0], ['F', 1], ['F', 2], ['F', 3], ['F', 4], ['F', 5], ['F', 6], ['F', 7]] },
  { id: 'system-design', name: 'System Design', source: 'system-design.pdf', url: 'https://roadmap.sh/system-design', groups: [['A', 9], ['A', 10], ['A', 23]] },
  { id: 'aws', name: 'AWS', source: 'aws.pdf', url: 'https://roadmap.sh/aws', groups: [['A', 15], ['A', 24], ['A', 25]] },
  { id: 'machine-learning', name: 'Machine Learning', source: 'machine-learning.pdf', url: 'https://roadmap.sh/machine-learning', groups: [['C', 0], ['C', 1], ['C', 2], ['C', 3], ['C', 4], ['C', 5], ['C', 6], ['C', 7], ['C', 9], ['C', 13], ['C', 8], ['C', 10], ['C', 11]] },
  { id: 'ai-data-scientist', name: 'AI and Data Scientist', source: 'ai-data-scientist.pdf', url: 'https://roadmap.sh/ai-data-scientist', groups: [['C', 0], ['C', 1], ['C', 2], ['C', 3], ['C', 4], ['C', 5], ['C', 9], ['C', 10], ['C', 12], ['C', 13], ['A', 21], ['C', 8], ['C', 11], ['D', 0]] },
  { id: 'ai-engineer', name: 'AI Engineer', source: 'ai-engineer.pdf', url: 'https://roadmap.sh/ai-engineer', groups: [['B', 0], ['B', 2], ['B', 4], ['B', 6], ['B', 7], ['B', 8], ['B', 11], ['A', 22], ['B', 1], ['B', 3]] },
  { id: 'prompt-engineering', name: 'Prompt Engineering', source: 'prompt-engineering.pdf', url: 'https://roadmap.sh/prompt-engineering', groups: [['B', 0], ['B', 1], ['B', 9]] },
  { id: 'ai-agents', name: 'AI Agents', source: 'ai-agents.pdf', url: 'https://roadmap.sh/ai-agents', groups: [['B', 0], ['B', 3], ['B', 5], ['B', 10], ['A', 11], ['A', 22], ['B', 1], ['B', 2]] },
  { id: 'gfg-data-scientist', name: 'Data Scientist (GeeksforGeeks)', source: 'Data Scientist Roadmap - GeeksforGeeks.pdf', url: 'https://www.geeksforgeeks.org/blogs/data-scientist-roadmap/', groups: [['C', 0], ['C', 2], ['C', 3], ['C', 4], ['C', 5], ['C', 7], ['C', 9], ['C', 10], ['C', 11], ['C', 12], ['C', 8], ['D', 0]] },
];

export function roadmapHas(view: RoadmapView, track: Track, group: TopicGroup): boolean {
  const gi = track.groups.indexOf(group);
  return view.groups.some(([t, g]) => t === track.id && g === gi);
}

/** e.g. "112 topics · Track A, B". Computed so it never drifts from roadmap.json. */
export function roadmapScope(view: RoadmapView): string {
  const n = view.groups.reduce((a, [t, g]) => a + (roadmap.tracks.find((x) => x.id === t)?.groups[g]?.i.length ?? 0), 0);
  const tr = [...new Set(view.groups.map(([t]) => t))].join(', ');
  return `${n} topics · Track ${tr}`;
}
