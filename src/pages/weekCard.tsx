import type { Week } from '../data/types';
import { curriculum } from '../data/curriculum';
import { weekTitles } from '../data';
import { coverageForWeek, isTopicCovered } from '../lib/coverage';
import { currentWeek, weekDate, weekPercent } from '../lib/progress';
import { fmtDay } from '../lib/dates';
import { weekWorkload } from '../lib/study-workload';
import type { AppState } from '../state/model';
import { Progress } from '../components/ui';
export function weekRange(s:AppState,n:number){const a=weekDate(s,n),b=new Date(a);b.setDate(a.getDate()+7*weekWorkload(n,s).calendarWeeks-1);const o:Intl.DateTimeFormatOptions={day:'numeric',month:'short'};return `${fmtDay(a,o)} – ${fmtDay(b,o)}`}
export function WeekCard({s,w}:{s:AppState;w:Week}){
  const p=weekPercent(s,w),cur=w.n===currentWeek(s),coverage=coverageForWeek(w.n),covered=coverage.filter(t=>isTopicCovered(s,t)).length;
  const phase=curriculum.phases.find(x=>w.n>=x.start&&w.n<=x.end);
  return <a className={`week-card ${cur?'current':''} ${p===100?'done':''}`} href={`/week-${w.n}`}>
    <div className="week-top"><span className="week-number">Week {String(w.n).padStart(2,'0')}</span><span className="badge">{p===100?'Complete':cur?'Current':phase?.name??'Curriculum'}</span></div>
    <h3>{weekTitles[w.n-1]}</h3><p>{w.o}</p><Progress value={p} label={`Week ${w.n} progress`}/>
    <small>{weekRange(s,w.n)} · ~{Math.round(weekWorkload(w.n,s).total/60*10)/10}h across {weekWorkload(w.n,s).calendarWeeks} calendar {weekWorkload(w.n,s).calendarWeeks===1?'week':'weeks'} · {p}% complete · {covered}/{coverage.length} roadmap checkpoints</small>
  </a>;
}
