export type Pair = [name: string, url: string];
export type WeekFocus = [tag: string, text: string];
export interface Week { n: number; f: WeekFocus[]; o: string }
export interface Phase { name: string; weeks: [number, number]; exit: string }
export interface TopicGroup { t: string; i: string[] }
export interface Track { id: string; name: string; goal: string; groups: TopicGroup[] }
export interface Roadmap { tracks: Track[]; weeks: Week[]; phases: Phase[] }
export interface Mission { steps: string[]; proof: string }
export interface Skill { id: string; name: string; week: string; evidence: string; learn: string; practice: string }
export interface SkillLane { name: string; description: string; skills: Skill[] }
export interface PortfolioProject { id: string; name: string; role: string; weeks: string; brief: string; criteria: string[] }
export type WeekLinkRow = [type: string, name: string, url: string, note: string];
export type WeeklySource = [topic: string, learn: Pair, read?: Pair, practice?: Pair];
export interface WeekOneTopic { name: string; skills: string[]; goal: string; goalHref?: string; focus: string; learn: Pair; read: Pair; practice: Pair }
export interface CourseGroup { title: string; points: string; codes: string; description: string }
export type Bridge = 'unknown' | 'stats' | 'cs' | 'other';
export interface PracticeTrack { key: string; name: string; when: string; cadence: string; goal: string; resources: [type: string, name: string, url: string, desc: string][] }

// DSA
export interface ReadLink { label: string; url: string; source: 'tuf' | 'gfg' }
export interface A2zItem {
  id: string; title: string; difficulty: string | null; video: string | null; reads: ReadLink[];
  tuf: string | null; leetcode: string | null; lc: string | null; gfg: string | null; other: Pair | null;
}
export interface A2zSection { title: string; items: A2zItem[] }
export interface A2zStep { step: number; title: string; sections: A2zSection[] }
export interface A2zData { meta: { sheetUrl: string; legacySheetUrl: string; tufTopicCountLive: number; note: string }; steps: A2zStep[] }
export interface NcProblem { slug: string; title: string; pattern: string; difficulty: string; video: string | null; nc150: boolean; blind75: boolean }
export interface NcData { meta: { practiceUrl: string; patterns: string[]; counts: { nc150: number; blind75: number; all: number } }; problems: NcProblem[] }
