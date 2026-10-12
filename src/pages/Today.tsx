import { Bell, Flame, Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { roadmap, weekTitles } from '../data';
import { dueTopicReviews } from '../lib/week-activities';
import { curriculumTopicForKey } from '../lib/curriculum-progress';
import { fmtDay, todayKey } from '../lib/dates';
import { dueRevisions, nextUp, solvedToday } from '../lib/dsa';
import { activityHref, nextWeekActivity } from '../lib/nextActivity';
import { CORE_WEEKS, calcStreak, currentWeek, daysUntilStart, last7Days, longestStreak, weekPercent, weekTasks, isWeekTaskDone, weekOutputReady } from '../lib/progress';
import { isActive } from '../state/model';
import { logMinutes, toggleTask, toggleCurriculumTopic, togglePortfolio } from '../state/actions';
import { useAppState } from '../state/store';
import { enableNotifications, timer, useTimer } from '../state/timer';
import { notify } from '../state/toast';
import { BackupBanner, BehindBanner } from '../components/Banners';
import { Btn, Check, Label, Panel, Progress, SectionHead } from '../components/ui';
import { WeekCard, weekRange } from './weekCard';

function TimerPanel() {
  const t = useTimer();
  const [manual, setManual] = useState('');
  const [perm, setPerm] = useState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  const mm = String(Math.floor(t.remaining / 60)), ss = String(t.remaining % 60).padStart(2, '0');
  return <Panel className="focus-panel">
    <div className="focus-head"><Label>Focus timer · {t.preset} min</Label><button className="link" onClick={() => timer.setPreset(t.preset === 25 ? 50 : 25)}>Switch to {t.preset === 25 ? 50 : 25} min</button></div>
    <div className="timer-display" role="timer" aria-label={`${mm} minutes ${ss} seconds remaining`}>{mm}:{ss}</div>
    <div className="timer-controls">
      <button className="btn" onClick={() => timer.toggle()}>{t.running ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}{t.running ? 'Pause' : 'Start'}</button>
      <button className="btn ghost small" onClick={() => timer.reset()}><RotateCcw size={14} aria-hidden />Reset</button>
      {perm === 'default' && <button className="btn ghost small" onClick={async () => setPerm(await enableNotifications())}><Bell size={14} aria-hidden />Notify me</button>}
    </div>
    <p className="tiny muted">The timer keeps running if you reload or switch tabs, chimes at the end, and logs the session for you.</p>
    <div className="manual-log">
      <label className="form-row"><span>Log minutes manually</span><input type="number" min={5} max={300} placeholder="e.g. 45" value={manual} onChange={(e) => setManual(e.target.value)} /></label>
      <button className="btn small" onClick={() => { const v = Number(manual); if (v >= 5 && v <= 300) { logMinutes(v); setManual(''); notify(`${v} minutes logged.`); } else notify('Enter 5 to 300 minutes.'); }}>Log</button>
    </div>
  </Panel>;
}

function DsaPanel() {
  const s = useAppState();
  const today = todayKey(), done = solvedToday(s, today), due = dueRevisions(s, today).length, next = nextUp(s);
  return <Panel>
    <Label>DSA today</Label>
    <div className="goal-row"><strong>{done} / {s.dsaGoal}</strong><span>problems solved today</span></div>
    <Progress value={Math.min(100, Math.round((done / s.dsaGoal) * 100))} label="Daily DSA goal" />
    {next && <a className="next-up" href={next.href}><span className="eyebrow">Next up</span><b>{next.title}</b><small>{next.where}</small></a>}
    <div className="row">{due > 0 ? <a className="btn small" href="#dsa?tab=revise">Review {due} due {due === 1 ? 'problem' : 'problems'}</a> : <span className="tiny muted">No revisions due today.</span>}<a className="link" href="#dsa">Open DSA tracker</a></div>
  </Panel>;
}

export function Today() {
  const s = useAppState();
  const cw = currentWeek(s), w = roadmap.weeks[cw - 1], wait = daysUntilStart(s);
  const next = weekTasks(w,s).filter((x) => !isWeekTaskDone(s,x)).slice(0, 5);
  const activity = nextWeekActivity(s, w);
  const reviewsDue = dueTopicReviews(s).length;
  const days = last7Days().map((d) => ({ d, mins: s.activity[d]?.minutes ?? 0, active: isActive(s.activity[d]) }));
  const max = Math.max(30, ...days.map((x) => x.mins));
  const streak = calcStreak(s);
  const core = roadmap.weeks.slice(0, CORE_WEEKS);
  const complete = core.filter((x) => weekPercent(s, x) === 100).length;
  const startLabel = new Date(`${s.start}T12:00:00`).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' });

  return <>
    <BackupBanner />
    <div className="today-head">
      <div><Label>{fmtDay(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}</Label>
        {wait > 0
          ? <><h2>Week 1 starts in {wait} {wait === 1 ? 'day' : 'days'}</h2><p className="muted">{startLabel} · {weekTitles[0]}. Use the time to set up your tools, or start early: everything below is ready.</p></>
          : <><h2>{weekTitles[cw - 1]}</h2><p className="muted">Week {cw} · {weekRange(s, cw)} · {weekPercent(s, w)}% complete</p></>}
      </div>
      <div className="streak" aria-label={`${streak} day streak`}><Flame size={26} className={streak ? 'on' : ''} aria-hidden /><div><strong>{streak}</strong><small>day streak · best {longestStreak(s)}</small></div></div>
    </div>
    <BehindBanner />
    {reviewsDue>0&&<div className="banner info" role="region" aria-label="Topic reviews due"><p><b>{reviewsDue} topic {reviewsDue===1?'review':'reviews'} due.</b> Try recalling the ideas before opening your notes.</p><a className="btn small" href={`#week-${cw}?focus=review-panel`}>Review now</a></div>}
    <div className="today-grid">
      <Panel className="start-panel">
        <Label>{wait > 0 ? 'Week 1 preview' : 'Start learning'}</Label>
        {activity ? <>
          <h3>{activity.title}</h3><p>{activity.detail}</p>
          <Btn href={activityHref(cw, activity)}>{wait > 0 ? 'Start early' : 'Start learning'}</Btn>
        </> : <><h3>Week {cw} is complete</h3><p>Review your work or choose another week.</p><Btn href="#plan">Open weekly plan</Btn></>}
        {next.length > 0 && <div className="start-focus"><Label>Weekly task checklist</Label><div className="task-list">{next.map((x) => <Check key={x.id} checked={isWeekTaskDone(s,x)} disabled={x.tag==='DELIVERABLE'&&!weekOutputReady(s,w.n)} onChange={(v) => x.topicKey ? toggleCurriculumTopic(x.topicKey,v) : x.portfolioKey ? togglePortfolio(x.portfolioKey,v) : toggleTask(x.id,v)}><span><b>{x.topicKey ? curriculumTopicForKey.get(x.topicKey)?.group : x.tag === 'BRIDGE' ? 'Master’s bridge' : x.portfolioKey ? 'Portfolio milestone' : 'Finish the week'}</b>{x.text.length > 110 ? `${x.text.slice(0, 110)}…` : x.text}</span></Check>)}</div></div>}
      </Panel>
      <TimerPanel />
      <DsaPanel />
      <Panel>
        <Label>Last 7 days</Label>
        <div className="activity-bars">{days.map(({ d, mins, active }) => <div key={d} className={`bar ${active ? 'active' : ''}`} title={`${d}: ${mins} minutes${active ? ', active' : ''}`}><div className="bar-fill" style={{ height: `${Math.max(4, Math.round((mins / max) * 100))}%` }} /><span>{d.slice(-2)}</span><small>{mins}m</small></div>)}</div>
        <p className="tiny muted">Bars show logged minutes. A day counts toward your streak if you log time, tick a task or solve a problem.</p>
      </Panel>
    </div>
    <div className="stats-grid">
      <div className="stat"><span>Current week</span><strong>{wait > 0 ? '—' : cw}</strong><small>{wait > 0 ? `Starts ${startLabel}` : weekRange(s, cw)}</small></div>
      <div className="stat"><span>Study blocks completed</span><strong>{complete}/{CORE_WEEKS}</strong><small>Full curriculum</small></div>
      <div className="stat"><span>Weekly target</span><strong>{s.hours}h</strong><small><a href="#settings">Adjust in settings</a></small></div>
      <div className="stat"><span>Time logged</span><strong>{Math.round(Object.values(s.activity).reduce((a, d) => a + d.minutes, 0) / 60)}h</strong><small>All time</small></div>
    </div>
    <SectionHead title="Up next" action={<a className="link" href="#plan">Full plan →</a>}>One deliverable each week keeps momentum.</SectionHead>
    <div className="week-grid">{core.slice(cw - 1, cw + 2).map((x) => <WeekCard key={x.n} s={s} w={x} />)}</div>
  </>;
}
