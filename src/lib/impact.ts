import { skillLanes } from '../data';
export const skillNames: Record<string, string> = Object.fromEntries(skillLanes.flatMap((l) => l.skills).map((s) => [s.id, s.name]));
export interface Impact { skills: string[]; goal: string; goalHref: string }

/** Maps a weekly focus line to the skill(s) and goal it supports. Ported unchanged from Study Compass. */
export function focusImpact(tag: string, focus: string): Impact {
  const t = focus.toLowerCase();
  let skills: string[] = [];
  if (tag === 'R') skills = ['r'];
  else if (tag === 'AI') skills = [/evaluat|safety|failure|attack|malicious/.test(t) ? 'ai-eval' : /retriev|embedding|chunk/.test(t) ? 'retrieval' : /agent|tool/.test(t) ? 'agents' : 'rag'];
  else if (tag === 'DE') skills = [/quality|lineage|ingest|reproducib|backfill/.test(t) ? 'quality' : /sql/.test(t) && !/spark|distributed|parquet|stream/.test(t) ? 'sql' : 'spark'];
  else if (tag === 'C') skills = [/forensic|evidence|chain of custody|timeline/.test(t) ? 'dfir' : /soc|detection|incident|log|siem/.test(t) ? 'soc' : /web|application|injection|xss|csrf|api/.test(t) ? 'pentest' : /network|tcp|dns|tls/.test(t) ? 'networking' : /python|script/.test(t) ? 'python-sec' : /cloud/.test(t) ? 'cloudsec' : 'threat-model'];
  else if (tag === 'ML' || tag === 'STATS') skills = ['threat-model'];
  else if (tag === 'PRJ') skills = [/rag|agent|ai /.test(t) ? 'rag' : /pipeline|ingest|data quality/.test(t) ? 'quality' : /forecast|backtest|model|evaluation/.test(t) ? 'evaluation' : 'ml'];
  const portfolio = tag === 'PRJ' || tag === 'AI';
  const goal = portfolio ? 'Portfolio proof' : tag === 'DE' ? 'Engineering portfolio' : tag === 'R' ? 'Research readiness' : 'Security foundations';
  return { skills, goal, goalHref: portfolio || tag === 'DE' || tag === 'C' ? '/career' : '/degree' };
}
