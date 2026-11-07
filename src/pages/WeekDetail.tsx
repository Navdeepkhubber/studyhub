import { useEffect } from 'react';
import { curriculum, curriculumWeek } from '../data/curriculum';
import { roadmap } from '../data';
import { studyResourcesFor } from '../data/study-resources';
import { coverageForWeek, isTopicCovered } from '../lib/coverage';
import { weekDate, weekPercent, weekOutputReady } from '../lib/progress';
import { weekWorkload, studySessions } from '../lib/study-workload';
import { portfolioMilestonesForWeek, dueTopicReviews } from '../lib/week-activities';
import { nextUp, dueRevisions, solvedToday } from '../lib/dsa';
import { todayKey } from '../lib/dates';
import { useRoute } from '../lib/router';
import { setText, toggleCurriculumTopic, toggleTask, togglePortfolio, reviewCurriculumTopic } from '../state/actions';
import { useAppState } from '../state/store';
import { notify } from '../state/toast';
import { Check, Ext, Field, Label } from '../components/ui';
import { weekRange } from './weekCard';

/**
 * One week: a single ordered list of lessons (learn, practise, task), then recall,
 * connected practice and the end-of-week check. Planning detail sits in one
 * collapsed section at the bottom so the lessons come first.
 */
export function WeekDetail({ n }: { n: number }) {
  const s = useAppState();
  const focus = useRoute().query.get('focus');
  const w = roadmap.weeks[n-1], planWeek = curriculumWeek(n);
  const topics = coverageForWeek(n);
  const workload = weekWorkload(n,s), sessions = studySessions(n,s);
  const milestones = portfolioMilestonesForWeek(n);
  const dueReviews = dueTopicReviews(s);
  const nextProblem = nextUp(s);
  const dsaDue = dueRevisions(s,todayKey()).length;
  const done = topics.filter(t => isTopicCovered(s,t)).length;
  const outId = `w${n}-output`;
  const finishReady = weekOutputReady(s,n);
  const notionUrl = s.weekNotionUrls[n]?.trim() ?? '';
  const hours = Math.round(workload.total/60);
  const noteOutline = `Week ${n}: ${planWeek.title}\n\n${topics.map(t=>`## ${t.text}\n- Notes:\n- What I built or solved:\n`).join('\n')}\nQuestions to revisit\n- `;
  useEffect(()=>{
    if (!focus) return;
    const target=document.getElementById(focus);
    const parent=target?.closest('details'); if(parent) parent.open=true;
    target?.focus({preventScroll:true}); target?.scrollIntoView({block:'start'});
  },[focus,n]);
  return <>
    <div className="detail-head week-head">
      <a href="/plan">← All weeks</a>
      <p className="week-meta">Week {n} · {weekRange(s,n)} · about {hours} h · <span>{weekPercent(s,w)}% complete</span></p>
      <h2>{planWeek.title}</h2>
      <p className="muted">{topics.length} lessons. For each one: learn it, practise it, do the task, then tick it off. {done>0 && `${done} of ${topics.length} done.`}</p>
    </div>

    <ol className="lesson-list">{topics.map((t,i)=>{
      const r = studyResourcesFor(t);
      const covered = isTopicCovered(s,t);
      return <li className={`curriculum-item lesson ${covered?'is-done':''}`} key={t.key} id={`lesson-${t.key}`} tabIndex={-1}>
        <div className="lesson-head">
          <span className="lesson-num" aria-hidden>{i+1}</span>
          <div className="lesson-title">
            <Check checked={covered} onChange={v=>toggleCurriculumTopic(t.key,v)}><span>{t.text}</span></Check>
            <p className="lesson-skill">{t.group}{t.level && <span className={`level-badge level-${t.level.toLowerCase()}`}>{t.level}</span>}</p>
          </div>
        </div>
        <div className="topic-study" aria-label={`Study resources for ${t.text}`}>
          <p><b>Learn</b> <Ext href={r.learn[1]}>{r.learn[0]}</Ext></p>
          <p><b>Practise</b> <Ext href={r.practice[1]}>{r.practice[0]}</Ext></p>
          <p className="topic-action"><b>Task</b> {r.action}</p>
          {r.extraLearn.length>0 && <p className="lesson-more">Also useful: {r.extraLearn.slice(0,2).map(([title,url],j)=><span key={url}>{j?' · ':''}<Ext href={url}>{title}</Ext></span>)}</p>}
        </div>
      </li>;
    })}</ol>

    <section className="study-card recall-panel" id="review-panel" tabIndex={-1}><Label>Recall</Label><h3>{dueReviews.length ? `${dueReviews.length} topic ${dueReviews.length===1?'review':'reviews'} due` : 'No topic reviews due'}</h3><p>Explain or redo each one without your notes first, then check.</p>{dueReviews.slice(0,8).map(t=><div className="review-row" key={t.key}><div><b>{t.text}</b><small>From week {t.week}</small></div><button className="btn ghost small" onClick={()=>reviewCurriculumTopic(t.key,false)}>Need practice</button><button className="btn small" onClick={()=>reviewCurriculumTopic(t.key,true)}>Remembered</button></div>)}{dueReviews.length>8&&<p className="tiny muted">{dueReviews.length-8} more due after these.</p>}</section>

    {(milestones.length>0 || nextProblem) && <section className="study-card linked-practice"><Label>Also this week</Label>
      <div className="practice-summary"><b>DSA today: {solvedToday(s,todayKey())}/{s.dsaGoal} problems</b>{nextProblem&&<a href={nextProblem.href}>Next problem: {nextProblem.title} →</a>}{dsaDue>0&&<a href="/dsa?tab=revise">{dsaDue} DSA reviews due →</a>}</div>
      {milestones.map(m=><div key={m.key} className="milestone-row"><Label>Portfolio · {m.project.name}</Label><Check checked={!!s.portfolio[m.key]} onChange={v=>togglePortfolio(m.key,v)} label={m.criterion} /></div>)}
    </section>}

    <section className={`study-card finish ${s.done[outId]&&finishReady?'done':''}`} id="weekly-mission" tabIndex={-1}>
      <div className="study-head"><div><Label>Finish the week</Label><h3>{w.o}</h3></div><Check checked={!!s.done[outId]&&finishReady} disabled={!finishReady} onChange={v=>toggleTask(outId,v)} label="Done" /></div>
      <p className="tiny muted">Unlocks when every lesson{milestones.length?' and portfolio item':''} is ticked and you add a link or a few lines of notes.</p>
      <Field label="Link to your repo, notebook or write-up"><input type="url" value={s.weekEvidence[n]??''} onChange={e=>setText('weekEvidence',String(n),e.target.value)} placeholder="https://github.com/..." autoComplete="off" /></Field>
      <Field label="Link to this week’s Notion page"><input type="url" placeholder="https://www.notion.so/…" value={notionUrl} onChange={e=>setText('weekNotionUrls',String(n),e.target.value)} /></Field>
      {/^https:\/\//.test(notionUrl)&&<p><Ext href={notionUrl}>Open your week {n} notes</Ext></p>}
      <Field label="Your notes"><textarea className="note" value={s.notes[n]??''} onChange={e=>setText('notes',String(n),e.target.value)} placeholder="What did you learn and what needs review?" /></Field>
    </section>

    <details className="study-card week-planning">
      <summary><b>Plan your week</b><span className="tiny muted">Time estimate and suggested study days</span></summary>
      <p className="weekly-workload">About {Math.round(workload.total/60*10)/10} hours at your {s.hours}-hour weekly target, over {workload.calendarWeeks} calendar {workload.calendarWeeks===1?'week':'weeks'}. {workload.dsaFeasible ? <>This includes {workload.dsaPracticeDays} DSA practice {workload.dsaPracticeDays===1?'day':'days'} per calendar week at {s.dsaGoal} {s.dsaGoal===1?'problem':'problems'} a day.</> : <>Your DSA goal does not fit your weekly hours, so it is left out; change it in <a href="/settings">Settings</a>.</>}</p>
      <ol className="study-days">{sessions.map((session,i)=>{const date=weekDate(s,n);date.setDate(date.getDate()+session.day);return <li key={i}><b>{date.toLocaleDateString('en-NZ',{weekday:'short',day:'numeric',month:'short'})} · about {session.minutes} min</b><span>{session.titles.join(' · ')}</span></li>})}</ol>
      <button className="btn ghost small" onClick={async()=>{try{await navigator.clipboard.writeText(noteOutline);notify('Note outline copied.')}catch{notify('Could not copy the outline.')}}}>Copy a note outline for this week</button>
    </details>

    <div className="week-nav"><a className="btn ghost small" href={`/week-${Math.max(1,n-1)}`}>← Previous week</a><a className="btn small" href={`/week-${Math.min(curriculum.weeks.length,n+1)}`}>Next week →</a></div>
  </>;
}
