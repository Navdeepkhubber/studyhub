import { useState } from 'react';
import { roadmap } from '../data';
import { isTopicCovered, scheduledTopicForKey } from '../lib/coverage';
import { roadmapHas, roadmapScope, roadmapViews } from '../data/roadmaps';
import { useRoute } from '../lib/router';
import { toggleCurriculumTopic } from '../state/actions';
import { useAppState } from '../state/store';
import { Callout, Check, Ext, Label, SectionHead } from '../components/ui';
import { Checked } from '../components/Checked';

const total = roadmap.tracks.reduce((a, t) => a + t.groups.reduce((b, g) => b + g.i.length, 0), 0);
const LEVELS = [
  { key: 'B', name: 'Beginner' },
  { key: 'I', name: 'Intermediate' },
  { key: 'A', name: 'Advanced' },
] as const;
const levelOf = (raw: string) => (raw.match(/^\[(B|I|A)\]/)?.[1] ?? null) as 'B' | 'I' | 'A' | null;

export function Atlas() {
  const s = useAppState();
  const route = useRoute();
  const [q, setQ] = useState('');
  const [track, setTrack] = useState('all');
  const [rm, setRm] = useState(route.query.get('roadmap') ?? 'all');
  const [star, setStar] = useState(false);
  const [level, setLevel] = useState('all');
  const view = roadmapViews.find((r) => r.id === rm);
  let count = 0;

  const renderItem = (x: { text: string; key: string; priority: boolean }) => {
    const scheduled = scheduledTopicForKey(x.key);
    if (!scheduled) return <Check key={x.key} checked={!!s.topics[x.key]} onChange={(v) => toggleCurriculumTopic(x.key, v)}><span className={x.priority ? 'star' : ''}>{x.priority ? '★ ' : ''}{x.text}</span></Check>;
    const done = isTopicCovered(s, scheduled);
    const carried = !s.done[scheduled.taskId] && !!s.topics[x.key];
    return <div key={x.key} data-topic-key={x.key} className={`coverage-item ${done ? 'covered' : ''}`}>
      <span className="coverage-symbol" aria-hidden>{done ? '✓' : '○'}</span>
      <span className={x.priority ? 'star' : ''}>{x.priority ? '★ ' : ''}{x.text}</span>
      <small>{carried ? 'Previously checked' : done ? 'Covered' : 'Planned'} · <a href={`/week-${scheduled.week}?focus=lesson-${scheduled.key}`}>Week {scheduled.week}</a></small>
    </div>;
  };

  const groups = roadmap.tracks.filter((t) => track === 'all' || t.id === track).flatMap((t) => t.groups.map((g, gi) => {
    if (view && !roadmapHas(view, t, g)) return null;
    const items = g.i.map((raw, ii) => { const lvl = levelOf(raw); const afterLevel = raw.replace(/^\[(B|I|A)\]/, ''); return { text: afterLevel.replace(/^\*/, ''), key: `${t.id}-${gi}-${ii}`, priority: afterLevel.startsWith('*'), level: lvl }; })
      .filter((x) => (!star || x.priority) && (level === 'all' || x.level === level) && (!q || `${g.t} ${x.text}`.toLowerCase().includes(q.toLowerCase())));
    if (!items.length) return null;
    count += items.length;
    const hasLevels = items.some((x) => x.level);
    const doneInGroup = items.filter((x) => { const sc = scheduledTopicForKey(x.key); return sc && isTopicCovered(s, sc); }).length;
    return <section key={`${t.id}-${gi}`} className="topic-group skill-ladder">
      <div className="skill-ladder-head"><Label>{t.name}</Label><h3>{g.t}</h3><span className="tiny muted">{doneInGroup}/{items.length} done</span></div>
      {hasLevels && level === 'all'
        ? LEVELS.map((lv) => {
            const forLevel = items.filter((x) => x.level === lv.key);
            if (!forLevel.length) return null;
            const lvDone = forLevel.filter((x) => { const sc = scheduledTopicForKey(x.key); return sc && isTopicCovered(s, sc); }).length;
            return <div key={lv.key} className={`ladder-rung rung-${lv.name.toLowerCase()}`}>
              <div className="rung-head"><span className={`level-badge level-${lv.name.toLowerCase()}`}>{lv.name}</span><span className="tiny muted">{lvDone}/{forLevel.length}</span></div>
              {forLevel.map(renderItem)}
            </div>;
          })
        : items.map(renderItem)}
    </section>;
  }));
  return <>
    <Callout><b>What is included:</b> {total} grouped topic checkpoints across {roadmap.tracks.length} tracks. The cybersecurity and digital forensics track is scheduled across the weekly plan; each of its checkpoints links to its exact week, and checking it here or in the week updates both. The data engineering, GenAI and interview tracks are optional and unscheduled — tick them any time you brush up. Views map to job roles, AUT courses and the optional roadmaps. <Checked source="roadmaps" /></Callout>
    <SectionHead title={`${roadmapViews.length} roadmap views`}>Select one to inspect its related topics. Overlapping topics appear in several views.</SectionHead>
    <div className="card-grid three">{roadmapViews.map((r) => <div key={r.id} className={`card ${rm === r.id ? 'selected' : ''}`}><Label>Source roadmap</Label><h3>{r.name}</h3><p>{roadmapScope(r)}</p>
      <div className="row"><button className="btn small" onClick={() => { setRm(r.id); document.getElementById('topic-count')?.scrollIntoView({ behavior: 'smooth' }); }}>View topics</button><Ext href={r.url}>Open source</Ext></div></div>)}</div>
    <SectionHead title="Search the topic atlas">Pick a skill to see its Beginner, Intermediate and Advanced checkpoints laid out in order, each linking to its week. Filter by roadmap, track, level or text; checking a topic here updates the same progress.</SectionHead>
    <div className="toolbar">
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all roadmap topics…" aria-label="Search topics" />
      <select className="chip" value={rm} onChange={(e) => setRm(e.target.value)} aria-label="Filter roadmap"><option value="all">All {roadmapViews.length} roadmaps</option>{roadmapViews.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <select className="chip" value={track} onChange={(e) => setTrack(e.target.value)} aria-label="Filter track"><option value="all">All tracks</option>{roadmap.tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <select className="chip" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Filter level"><option value="all">All levels</option>{LEVELS.map((l) => <option key={l.key} value={l.key}>{l.name}</option>)}</select>
      <Check checked={star} onChange={setStar} label="★ Priority only" />
    </div>
    <p className="tiny muted" id="topic-count">{count} topics shown{view ? ` · ${view.name} view` : ''}</p>
    <div className="topic-groups">{groups.some(Boolean) ? groups : <p className="empty">No topics match your search.</p>}</div>
  </>;
}
