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
export function Atlas() {
  const s = useAppState();
  const route = useRoute();
  const [q, setQ] = useState('');
  const [track, setTrack] = useState('all');
  const [rm, setRm] = useState(route.query.get('roadmap') ?? 'all');
  const [star, setStar] = useState(false);
  const view = roadmapViews.find((r) => r.id === rm);
  let count = 0;
  const groups = roadmap.tracks.filter((t) => track === 'all' || t.id === track).flatMap((t) => t.groups.map((g, gi) => {
    if (view && !roadmapHas(view, t, g)) return null;
    const items = g.i.map((raw, ii) => ({ text: raw.replace(/^\*/, ''), key: `${t.id}-${gi}-${ii}`, priority: raw.startsWith('*') }))
      .filter((x) => (!star || x.priority) && (!q || `${g.t} ${x.text}`.toLowerCase().includes(q.toLowerCase())));
    if (!items.length) return null;
    count += items.length;
    return <section key={`${t.id}-${gi}`} className="topic-group"><Label>{t.name}</Label><h3>{g.t}</h3>
      {items.map((x) => {
        const scheduled = scheduledTopicForKey(x.key);
        if (!scheduled) return <Check key={x.key} checked={!!s.topics[x.key]} onChange={(v) => toggleCurriculumTopic(x.key, v)}><span className={x.priority ? 'star' : ''}>{x.priority ? '★ ' : ''}{x.text}</span></Check>;
        const done = isTopicCovered(s, scheduled);
        const carried = !s.done[scheduled.taskId] && !!s.topics[x.key];
        return <div key={x.key} data-topic-key={x.key} className={`coverage-item ${done ? 'covered' : ''}`}>
          <span className="coverage-symbol" aria-hidden>{done ? '✓' : '○'}</span>
          <span className={x.priority ? 'star' : ''}>{x.priority ? '★ ' : ''}{x.text}</span>
          <small>{carried ? 'Previously checked' : done ? 'Covered' : 'Planned'} · <a href={`/week-${scheduled.week}?focus=lesson-${scheduled.key}`}>Week {scheduled.week}</a></small>
        </div>;
      })}</section>;
  }));
  return <>
    <Callout><b>What is included:</b> {total} grouped topic checkpoints across {roadmap.tracks.length} tracks. Related concepts are merged, so this is not a one-to-one copy of any single roadmap. All Atlas checkpoints are scheduled across the complete weekly plan. Each checkpoint links to its exact weekly task; checking it here or in the week updates both views. Views combine role roadmaps and official programme context. <Checked source="roadmaps" /></Callout>
    <SectionHead title={`${roadmapViews.length} roadmap views`}>Select one to inspect its related topics. Overlapping topics appear in several views.</SectionHead>
    <div className="card-grid three">{roadmapViews.map((r) => <div key={r.id} className={`card ${rm === r.id ? 'selected' : ''}`}><Label>Source roadmap</Label><h3>{r.name}</h3><p>{roadmapScope(r)}</p>
      <div className="row"><button className="btn small" onClick={() => { setRm(r.id); document.getElementById('topic-count')?.scrollIntoView({ behavior: 'smooth' }); }}>View topics</button><Ext href={r.url}>Open source</Ext></div></div>)}</div>
    <SectionHead title="Search the topic atlas">Filter by roadmap, track or text. Every topic has a weekly task. Checking it here updates the same progress.</SectionHead>
    <div className="toolbar">
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all roadmap topics…" aria-label="Search topics" />
      <select className="chip" value={rm} onChange={(e) => setRm(e.target.value)} aria-label="Filter roadmap"><option value="all">All {roadmapViews.length} roadmaps</option>{roadmapViews.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <select className="chip" value={track} onChange={(e) => setTrack(e.target.value)} aria-label="Filter track"><option value="all">All tracks</option>{roadmap.tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <Check checked={star} onChange={setStar} label="★ Priority only" />
    </div>
    <p className="tiny muted" id="topic-count">{count} topics shown{view ? ` · ${view.name} view` : ''}</p>
    <div className="topic-groups">{groups.some(Boolean) ? groups : <p className="empty">No topics match your search.</p>}</div>
  </>;
}
