import { useState } from 'react';
import { curriculum } from '../data/curriculum';
import { roadmap } from '../data';
import { weekPercent, currentWeek } from '../lib/progress';
import { weekWorkload } from '../lib/study-workload';
import { useAppState } from '../state/store';
import { SectionHead } from '../components/ui';
import { WeekCard } from './weekCard';
export function Plan(){
  const s=useAppState();
  const calendarWeeks=roadmap.weeks.reduce((sum,w)=>sum+weekWorkload(w.n,s).calendarWeeks,0);
  const phaseNow=Math.floor((currentWeek(s)-1)/8);
  const [filter,setFilter]=useState('current');
  const phase=filter==='current'?phaseNow:Number(filter);
  const weeks=filter==='all'?roadmap.weeks:filter==='incomplete'?roadmap.weeks.filter(w=>weekPercent(s,w)<100):roadmap.weeks.slice(phase*8,phase*8+8);
  return <>
    <SectionHead title="Complete weekly curriculum">{curriculum.weeks.length} study blocks (about {calendarWeeks} calendar weeks at {s.hours} hours/week), all 593 Atlas checkpoints, plus the master’s bridge selected in Settings. Each checkpoint has reading, practice and a small task. Follow them in order and save your work.</SectionHead>
    <div className="callout"><b>How to use this plan:</b> Open the current week, work through its checkpoint groups from top to bottom, save an example for each, then check it off. Roadmap coverage mirrors those exact checkmarks. Dense blocks automatically span extra calendar weeks to fit your hour target. DSA is scheduled on study days at your daily problem goal; open a week for its time estimate. You can also shift the start date in Today.</div>
    {!weekWorkload(currentWeek(s),s).dsaFeasible && <div className="callout" role="alert">Your DSA daily goal cannot fit the current weekly hour target. The dates exclude DSA until you lower the goal or raise hours in <a href="/settings">Settings</a>.</div>}
    <div className="toolbar" role="group" aria-label="Filter weeks">
      <button className={`chip ${filter==='current'?'active':''}`} onClick={()=>setFilter('current')}>Current phase</button>
      <button className={`chip ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>All {curriculum.weeks.length} weeks</button>
      <button className={`chip ${filter==='incomplete'?'active':''}`} onClick={()=>setFilter('incomplete')}>Incomplete</button>
      <select className="chip" aria-label="Choose phase" value={filter==='all'||filter==='incomplete'?'':filter==='current'?String(phaseNow):filter} onChange={e=>setFilter(e.target.value)}><option value="" disabled>Choose phase</option>{curriculum.phases.map((p,i)=><option key={i} value={String(i)}>{i+1}. {p.name}</option>)}</select>
    </div>
    {filter!=='all'&&filter!=='incomplete'&&<p className="muted">Phase {phase+1}: {roadmap.phases[phase]?.exit}</p>}
    <div className="week-grid">{weeks.map(w=><WeekCard key={w.n} s={s} w={w}/>)}</div>
  </>;
}
