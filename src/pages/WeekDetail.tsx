import { useEffect, useState } from 'react';
import { curriculum, curriculumWeek } from '../data/curriculum';
import { roadmap } from '../data';
import { roadmapViews } from '../data/roadmaps';
import { studyResourcesFor } from '../data/study-resources';
import { coverageForWeek, isTopicCovered, type ScheduledTopic } from '../lib/coverage';
import { weekDate, weekPercent, weekOutputReady } from '../lib/progress';
import { weekWorkload, studySessions, checkpointMinutes } from '../lib/study-workload';
import { portfolioMilestonesForWeek, dueTopicReviews } from '../lib/week-activities';
import { nextUp, dueRevisions, solvedToday } from '../lib/dsa';
import { todayKey } from '../lib/dates';
import { useRoute } from '../lib/router';
import { setText, toggleCurriculumTopic, toggleTask, togglePortfolio, reviewCurriculumTopic } from '../state/actions';
import { useAppState } from '../state/store';
import { notify } from '../state/toast';
import { Check, Ext, Field, Label, SectionHead } from '../components/ui';
import { weekRange } from './weekCard';

type Group = { id: string; track: string; name: string; items: ScheduledTopic[] };
function groupsFor(items: ScheduledTopic[]): Group[] {
  const groups = new Map<string,Group>();
  for (const item of items) {
    const id = `${item.trackId}-${item.groupIndex}`;
    if (!groups.has(id)) groups.set(id,{id,track:item.track,name:item.group,items:[]});
    groups.get(id)!.items.push(item);
  }
  return [...groups.values()];
}
export function WeekDetail({ n }: { n: number }) {
  const s = useAppState();
  const focus = useRoute().query.get('focus');
  const [focusOnly, setFocusOnly] = useState(false);
  const w = roadmap.weeks[n-1], planWeek = curriculumWeek(n);
  const topics = coverageForWeek(n), groups = groupsFor(topics);
  const nextTopic = topics.find(t => !isTopicCovered(s,t));
  const visibleGroups = focusOnly && nextTopic ? groupsFor([nextTopic]) : groups;
  const workload = weekWorkload(n,s), sessions = studySessions(n,s);
  const milestones = portfolioMilestonesForWeek(n);
  const dueReviews = dueTopicReviews(s);
  const nextProblem = nextUp(s);
  const dsaDue = dueRevisions(s,todayKey()).length;
  const covered = topics.filter(t => isTopicCovered(s,t)).length;
  const outId = `w${n}-output`;
  const finishReady = weekOutputReady(s,n);
  const notionUrl = s.weekNotionUrls[n]?.trim() ?? '';
  const noteOutline = `Week ${n}: ${planWeek.title}\n\nGoals\n${topics.map(t=>`- ${t.text}`).join('\n')}\n\nWorked examples and links\n- \n\nRecall without notes\n- \n\nQuestions to revisit\n- \n\nWeekly evidence and reflection\n- `;
  useEffect(()=>{
    if (!focus) return;
    const target=document.getElementById(focus);
    const parent=target?.closest('details'); if(parent) parent.open=true;
    target?.focus({preventScroll:true}); target?.scrollIntoView({block:'start'});
  },[focus,n]);
  return <>
    <div className="detail-head"><div><a href="/plan">← All weeks</a><Label>Week {String(n).padStart(2,'0')} · {weekRange(s,n)}</Label><h2>{planWeek.title}</h2>
      <p>Follow these checkpoints from top to bottom. Read, practise, save your work in Notion, then check each one off.</p></div>
      <div><span className="badge">Core curriculum</span><p className="tiny">{weekPercent(s,w)}% complete</p></div></div>
    <section className="weekly-workload callout" aria-label="Study workload"><b>Study pace:</b> about {Math.round(workload.total/60*10)/10} hours of planned work at your {s.hours}-hour weekly target. This block spans {workload.calendarWeeks} calendar {workload.calendarWeeks===1?'week':'weeks'} ({weekRange(s,n)}). {workload.dsaFeasible ? <>That includes {workload.dsaPracticeDays} DSA practice {workload.dsaPracticeDays===1?'day':'days'} per calendar week at {s.dsaGoal} {s.dsaGoal===1?'problem':'problems'} per day (about 25 minutes per problem). Practice on other days adds time.</> : <>Your daily DSA goal needs about {Math.round(workload.dsaMinutesPerDay/60*10)/10} hours for one practice day, which does not fit the current session budget. DSA is excluded from this estimate and the suggested days. Reduce the DSA goal or raise weekly study hours in <a href="/settings">Settings</a>.</>} Estimates also include checkpoints, recall, and final evidence.</section>
    <details className="study-schedule callout"><summary><b>Suggested study days</b><span>{sessions.length} sessions, in checkpoint order</span></summary><ol>{sessions.map((session,i)=>{const date=weekDate(s,n);date.setDate(date.getDate()+session.day);return <li key={i}><b>{date.toLocaleDateString('en-NZ',{weekday:'short',day:'numeric',month:'short'})} · about {session.minutes} min</b><span>{session.titles.join(' · ')}</span></li>})}</ol></details>
    <section className="notion-notes callout"><div><b>Take notes in Notion</b><p>Make one page for this week in your Notion Education workspace. Keep examples, questions, and the final evidence there.</p></div><div className="notion-actions"><button className="btn ghost small" onClick={async()=>{try{await navigator.clipboard.writeText(noteOutline);notify('Week note outline copied. Paste it into Notion.')}catch{notify('Could not copy. Select the outline from your browser instead.')}}}>Copy note outline</button><Ext href="https://www.notion.so/">Open Notion</Ext></div><details className="note-outline"><summary>Preview note outline</summary><pre>{noteOutline}</pre></details><Field label="Link to this week’s Notion page"><input type="url" placeholder="https://www.notion.so/…" value={notionUrl} onChange={e=>setText('weekNotionUrls',String(n),e.target.value)} /></Field>{/^https:\/\//.test(notionUrl)&&<Ext href={notionUrl}>Open your week {n} notes</Ext>}</section>
    <SectionHead title="What to do this week">{topics.length} checkpoints. Each has a reading, practice link and task. Your checkmarks drive the coverage view below.</SectionHead>
    <div className="focus-switch"><button className="chip focus-toggle" aria-pressed={focusOnly} disabled={!nextTopic} onClick={()=>setFocusOnly(!focusOnly)}>{nextTopic ? focusOnly?'Show all checkpoints':'Focus on next checkpoint' : 'All checkpoints done'}</button>{focusOnly&&nextTopic&&<span className="tiny muted">Next: {nextTopic.group} · {nextTopic.text}</span>}</div>
    <div className="curriculum-groups">{visibleGroups.map((group,gi)=>{
      const first=group.items[0];
      const sources=roadmapViews.filter(v=>v.groups.some(([t,g])=>t===first.trackId&&g===first.groupIndex));
      const done=group.items.filter(t=>isTopicCovered(s,t)).length;
      return <details className="study-card curriculum-group" key={group.id} open={gi===0?true:undefined}>
        <summary><span><Label>{group.track}</Label><h3>{group.name}</h3></span><span className="tiny">{done}/{group.items.length} done</span></summary>
        <div className="curriculum-checklist">{group.items.map(t=>{
          const resources = studyResourcesFor(t);
          return <div className="curriculum-item" key={t.key} id={`lesson-${t.key}`} tabIndex={-1}>
            <Check checked={isTopicCovered(s,t)} onChange={v=>toggleCurriculumTopic(t.key,v)}><span className={t.priority?'star':''}>{t.priority?'★ ':''}{t.text}</span>{t.level&&<span className={`level-badge level-${t.level.toLowerCase()}`}>{t.level}</span>}</Check>
            <div className="topic-study" aria-label={`Study resources for ${t.text}`}><span className="study-estimate">Plan about {checkpointMinutes(t.text,t.priority)} min. {resources.targeted ? "The reading below was selected for this checkpoint." : "This reading is a starting point; use the checkpoint wording to find its section."}</span>
              <span><b>{resources.targeted ? "Checkpoint reading" : "Start reading"}</b> <Ext href={resources.learn[1]}>{resources.learn[0]}</Ext>{resources.extraLearn.length<=3 && resources.extraLearn.map(([title,url])=><span key={url}> · <Ext href={url}>{title}</Ext></span>)}</span>{resources.extraLearn.length>3 && <details className="reference-chapters"><summary>More resources ({resources.extraLearn.length})</summary><ul>{resources.extraLearn.map(([title,url])=><li key={url}><Ext href={url}>{title}</Ext></li>)}</ul></details>}{!resources.targeted && <span><Ext href={resources.lookup}>Find this checkpoint within the source</Ext></span>}
              <span><b>Practise</b> <Ext href={resources.practice[1]}>{resources.practice[0]}</Ext></span>
              <span className="topic-action"><b>Do</b> {resources.action}</span>
            </div>
          </div>;
        })}</div>
        {sources.length>0 && <p className="tiny muted source-overview">Roadmap overviews: {sources.map((v,i)=><span key={v.id}>{i?' · ':''}<Ext href={v.url}>{v.name}</Ext></span>)}</p>}
      </details>;
    })}</div>
    <section className="study-card linked-practice"><Label>Connected practice</Label><h3>DSA and portfolio work</h3><p>These use the same progress as the DSA tracker and Career page.</p><div className="practice-summary"><b>DSA today: {solvedToday(s,todayKey())}/{s.dsaGoal} problems</b><span className="tiny muted">Scheduled on {workload.dsaFeasible?workload.dsaPracticeDays:0} study {workload.dsaPracticeDays===1?"day":"days"} each calendar week</span>{nextProblem&&<a href={nextProblem.href}>Next problem: {nextProblem.title} →</a>}<a href="/dsa?tab=revise">{dsaDue} DSA reviews due →</a></div>{milestones.map(m=><div key={m.key} className="milestone-row"><Label>{m.project.name}</Label><Check checked={!!s.portfolio[m.key]} onChange={v=>togglePortfolio(m.key,v)} label={m.criterion} /><a href="/career">Open portfolio project →</a></div>)}</section>
    <section className="study-card recall-panel" id="review-panel" tabIndex={-1}><Label>Recall and revisit</Label><h3>{dueReviews.length ? `${dueReviews.length} topic ${dueReviews.length===1?'review':'reviews'} due` : 'No topic reviews due'}</h3><p>Try to explain or reproduce the idea without opening your notes first. Check your Notion page afterwards.</p>{dueReviews.slice(0,8).map(t=><div className="review-row" key={t.key}><div><b>{t.text}</b><small>Originally in week {t.week}</small></div><button className="btn ghost small" onClick={()=>reviewCurriculumTopic(t.key,false)}>Need practice</button><button className="btn small" onClick={()=>reviewCurriculumTopic(t.key,true)}>Remembered</button></div>)}{dueReviews.length>8&&<p className="tiny muted">{dueReviews.length-8} more due. Complete these to see the next set.</p>}</section>
    <section className={`study-card finish ${s.done[outId]&&finishReady?'done':''}`} id="weekly-mission" tabIndex={-1}>
      <div className="study-head"><div><Label>Finish the week</Label><h3>{w.o}</h3></div><Check checked={!!s.done[outId]&&finishReady} disabled={!finishReady} onChange={v=>toggleTask(outId,v)} label="Done" /></div>
      <p><b>Done when:</b> All checkpoints and scheduled portfolio milestones are complete; record evidence in a link or at least 30 characters of notes. {finishReady?'Ready to mark complete.':'Complete the work and add evidence to unlock this checkbox.'}</p>
      <Field label="Link to your notebook, repo or write-up"><input type="url" value={s.weekEvidence[n]??''} onChange={e=>setText('weekEvidence',String(n),e.target.value)} placeholder="https://github.com/..." autoComplete="off" /></Field>
      <Field label="Your notes"><textarea className="note" value={s.notes[n]??''} onChange={e=>setText('notes',String(n),e.target.value)} placeholder="What did you learn and what needs review?" /></Field>
    </section>
    <details className="weekly-coverage callout" aria-label="Roadmap coverage"><summary><b>Roadmap coverage · {covered}/{topics.length}</b><span>Mirrors the exact weekly checkpoints above</span></summary>
      <p className="tiny muted">Every Atlas checkpoint appears in one week. Coverage changes when that same checkpoint is checked in the weekly plan or Atlas. A checkmark records your work, not completion of an entire source course.</p>
      <div className="topic-groups">{groups.map(group=><section key={group.id} className="topic-group"><Label>{group.track}</Label><h3>{group.name}</h3>
        {group.items.map(t=><div key={t.key} data-topic-key={t.key} className={`coverage-item ${isTopicCovered(s,t)?'covered':''}`}><span className="coverage-symbol" aria-hidden>{isTopicCovered(s,t)?'✓':'○'}</span><span>{t.text}</span><small><a href={`/week-${n}?focus=lesson-${t.key}`}>Weekly task</a></small></div>)}
      </section>)}</div>
          </details>
    <div className="week-nav"><a className="btn ghost small" href={`/week-${Math.max(1,n-1)}`}>← Previous week</a><a className="btn small" href={`/week-${Math.min(curriculum.weeks.length,n+1)}`}>Next week →</a></div>
  </>;
}
