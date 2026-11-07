import { roadmap as roadmapData } from './index-roadmap';
import { curriculum } from './curriculum';

import degreeJson from './degree.json';
import skillsJson from './skills.json';
import portfolioJson from './portfolio.json';
import practiceJson from './practice-tracks.json';
import careerJson from './career-plan.json';
import certJson from './certifications.json';
import a2zJson from './dsa/a2z.json';
import ncJson from './dsa/neetcode.json';
import type * as T from './types';

export const roadmap = roadmapData;
export const weekTitles = curriculum.weeks.map(w => w.title);
export const phaseNames = curriculum.phases.map(p => p.name);
export const degree = degreeJson as unknown as {
  catalogue: string; programme2027: string; guide: string; courseGroups: T.CourseGroup[];
};
export const skillLanes = skillsJson as T.SkillLane[];
export const portfolioProjects = portfolioJson as T.PortfolioProject[];
export const practiceTracks = practiceJson as unknown as (Omit<T.PracticeTrack, 'resources'> & { resources: T.PracticeTrack['resources'] | 'DSA_TRACKERS' })[];
export interface CareerMilestone { id: string; start: string; end: string; title: string; detail: string; link: string }
export interface CareerEmployer { name: string; kind: string; eligibility: 'visa-ok' | 'check' | 'citizen-pr' | 'clearance'; note: string; url: string }
export const careerPlan = careerJson as { checked: string; milestones: CareerMilestone[]; employers: CareerEmployer[] };
export interface Certification { id: string; name: string; when: string; role: string; exam: string; prep: string[]; cost: string; note: string; url: string }
export const certifications = certJson as { checked: string; certs: Certification[] };
export const a2z = a2zJson as unknown as T.A2zData;
export const neetcode = ncJson as unknown as T.NcData;

/** Where each DSA sheet lives; shown on the Practice Hub card and DSA page. */
export const dsaTrackers: T.PracticeTrack['resources'] = [
  ['SOURCE SHEET', "Striver's A2Z sheet (takeUforward)", a2z.meta.sheetUrl, 'The current A2Z sheet with articles, videos and practice pages.'],
  ['SOURCE SHEET', 'NeetCode practice lists', neetcode.meta.practiceUrl, 'NeetCode 150, Blind 75 and NeetCode All with video solutions.'],
  ['SOURCE SHEET', 'A2Z old sheet', a2z.meta.legacySheetUrl, 'The earlier community copy this tracker was first built from.'],
];
export * from './types';
