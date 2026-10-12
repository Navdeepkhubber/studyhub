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
  else if (tag === 'STATS') skills = [/metrics|calibration|model comparison|backtest/.test(t) ? 'evaluation' : 'stats'];
  else if (tag === 'ML') skills = [/pytorch|backprop|neural|deep learning|sgd|adam/.test(t) ? 'dl' : /llm|nlp|transformer|embedding/.test(t) ? 'rag' : /backtest|calibration|evaluation|failure/.test(t) ? 'evaluation' : 'ml'];
  else if (tag === 'PRJ') skills = [/rag|agent|ai /.test(t) ? 'rag' : /pipeline|ingest|data quality/.test(t) ? 'quality' : /forecast|backtest|model|evaluation/.test(t) ? 'evaluation' : 'ml'];
  const portfolio = tag === 'PRJ' || tag === 'AI';
  const goal = portfolio ? 'Portfolio proof' : tag === 'DE' ? 'Engineering portfolio' : tag === 'R' ? 'Statistics bridge' : 'Master’s readiness';
  return { skills, goal, goalHref: portfolio || tag === 'DE' ? '/career' : '/degree' };
}
