import { useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, NotebookPen, PlayCircle } from 'lucide-react';
import { a2z, neetcode } from '../data';
import type { A2zItem, NcProblem } from '../data/types';
import { todayKey } from '../lib/dates';
import { a2zItems, a2zLocation, a2zByLc, a2zSolved, canonA2z, canonNc, describe, dueRevisions, ncBySlug, ncLists, ncSolved, nextUp, solvedToday, REVISION_DAYS, type ListId } from '../lib/dsa';
import { reviewProblem, setDsaGoal, setDsaNote, setRevision, toggleSolved } from '../state/actions';
import { useAppState } from '../state/store';
import { useRoute } from '../lib/router';
import { Check, Ext, ImpactTags, Label, Progress } from '../components/ui';
import { Checked } from '../components/Checked';
import type { AppState } from '../state/model';

type Tab = ListId | 'revise';
const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const diffClass = (d: string | null) => (d ?? 'concept').toLowerCase();
const tabs: { id: Tab; label: string }[] = [{ id: 'a2z', label: 'Striver A2Z' }, ...ncLists.map((l) => ({ id: l.id as Tab, label: l.label })), { id: 'revise', label: 'Revision' }];

function RowTools({ s, k }: { s: AppState; k: string }) {
  const [open, setOpen] = useState(!!s.dsaNotes[k]);
  const flagged = !!s.dsaRevise[k];
  return <>
    <div className="row-tools">
      <button className={`tool revision-tool ${flagged ? 'on' : ''}`} aria-pressed={flagged} onClick={() => setRevision(k, !flagged)} title={flagged ? 'Remove from revision' : 'Add to revision queue'}>{flagged ? <BookmarkCheck size={15} aria-hidden /> : <Bookmark size={15} aria-hidden />}{flagged ? 'In revision' : 'Revise later'}</button>
      <button className={`tool note-tool ${s.dsaNotes[k] ? 'on' : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}><NotebookPen size={15} aria-hidden />{s.dsaNotes[k] ? 'Note' : 'Add note'}</button>
    </div>
    {open && <textarea className="dsa-note" aria-label="Your note for this problem" value={s.dsaNotes[k] ?? ''} onChange={(e) => setDsaNote(k, e.target.value)} placeholder="Key idea, edge cases, complexity, what tripped you up…" />}
  </>;
}

function A2zRow({ s, it }: { s: AppState; it: A2zItem }) {
  const nc = it.lc ? ncBySlug.get(it.lc) : undefined, done = a2zSolved(s, it);
  return <article className={`dsa-row ${done ? 'done' : ''}`}>
    <div className="dsa-row-head">
      <div><span className={`diff ${diffClass(it.difficulty)}`}>{it.difficulty ?? 'Concept'}</span>
        {nc?.nc150 && <span className="pill">NeetCode 150</span>}{nc?.blind75 && <span className="pill">Blind 75</span>}
        <h4>{it.title}</h4></div>
      <Check checked={done} onChange={(v) => toggleSolved('a2z', it.id, v)} label="Done" />
    </div>
    <div className="dsa-links">
      {it.video ? <Ext href={it.video}>Watch lesson</Ext> : <span className="na">No lesson listed</span>}
      {it.reads.map((r) => <Ext key={r.url} href={r.url}>{r.source === 'tuf' ? 'Read on takeUforward' : 'Read on GfG'}</Ext>)}
      {it.tuf && <Ext href={it.tuf}>Practise on takeUforward</Ext>}
      {it.leetcode && <Ext href={it.leetcode}>LeetCode</Ext>}
      {it.gfg && <Ext href={it.gfg}>GFG</Ext>}
      {it.other && <Ext href={it.other[1]}>{it.other[0]}</Ext>}
      {nc?.video && <Ext href={yt(nc.video)}>NeetCode video</Ext>}
    </div>
    <RowTools s={s} k={canonA2z(it)} />
  </article>;
}

function NcRow({ s, p }: { s: AppState; p: NcProblem }) {
  const twins = (a2zByLc.get(p.slug) ?? []).map((id) => a2zLocation.get(id)!.step.step), done = ncSolved(s, p);
  return <article className={`dsa-row ${done ? 'done' : ''}`}>
    <div className="dsa-row-head">
      <div><span className={`diff ${diffClass(p.difficulty)}`}>{p.difficulty}</span>
        {p.blind75 && <span className="pill">Blind 75</span>}
        {twins.length > 0 && <span className="pill">Also in A2Z step {[...new Set(twins)].join(', ')}</span>}
        <h4>{p.title}</h4></div>
      <Check checked={done} onChange={(v) => toggleSolved('nc', p.slug, v)} label="Done" />
    </div>
    <div className="dsa-links">
      {p.video ? <Ext href={yt(p.video)}><PlayCircle size={13} aria-hidden /> NeetCode video</Ext> : <span className="na">No video listed</span>}
      <Ext href={`https://leetcode.com/problems/${p.slug}/`}>LeetCode</Ext>
    </div>
    <RowTools s={s} k={canonNc(p)} />
  </article>;
}

function Revision({ s }: { s: AppState }) {
  const today = todayKey();
  const due = dueRevisions(s, today).map(describe).filter((x) => x !== null);
  const upcoming = Object.entries(s.dsaRevise).filter(([, r]) => r.due > today).sort((a, b) => a[1].due.localeCompare(b[1].due));
  if (!Object.keys(s.dsaRevise).length) return <p className="empty">Your revision queue is empty. Use <b>Revise later</b> on any problem you found hard; it comes back tomorrow, then after {REVISION_DAYS.slice(1, 4).join(', ')} days and longer each time you get it right.</p>;
  return <>
    <h3 className="dsa-step-title">Due today ({due.length})</h3>
    {due.length ? <div className="dsa-list flat">{due.map((d) => <article key={d.key} className="dsa-row">
      <div className="dsa-row-head"><div><span className="pill">{d.where}</span><h4>{d.title}</h4>{s.dsaNotes[d.key] && <p className="note-preview">{s.dsaNotes[d.key]}</p>}</div>
        <div className="review-actions"><a className="btn ghost small" href={d.href}>Open</a><button className="btn ghost small" onClick={() => reviewProblem(d.key, false)}>Still hard</button><button className="btn small" onClick={() => reviewProblem(d.key, true)}>Got it</button></div></div>
    </article>)}</div> : <p className="tiny muted">Nothing due today. Come back tomorrow.</p>}
    {upcoming.length > 0 && <><h3 className="dsa-step-title">Coming up ({upcoming.length})</h3>
      <ul className="upcoming">{upcoming.slice(0, 15).map(([k, r]) => { const d = describe(k); return d && <li key={k}><span>{new Date(`${r.due}T12:00:00`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</span><a href={d.href}>{d.title}</a><button className="link" onClick={() => setRevision(k, false)}>Remove</button></li>; })}</ul></>}
  </>;
}

export function Dsa() {
  const route = useRoute();
  return <DsaInner key={route.query.toString()} initTab={(route.query.get('tab') as Tab) || 'a2z'} initQ={route.query.get('q') ?? ''} />;
}

function DsaInner({ initTab, initQ }: { initTab: Tab; initQ: string }) {
  const s = useAppState();
  const [tab, setTab] = useState<Tab>(tabs.some((t) => t.id === initTab) ? initTab : 'a2z');
  const [q, setQ] = useState(initQ);
  const [step, setStep] = useState(() => { const it = s.dsaLast?.list === 'a2z' ? a2zItems.find((i) => canonA2z(i) === s.dsaLast!.key) : undefined; return it ? a2zLocation.get(it.id)!.step.step : 1; });
  const [diff, setDiff] = useState('all');
  const [hideDone, setHideDone] = useState(false);
  const ql = q.trim().toLowerCase();
  const okDiff = (d: string | null) => diff === 'all' || (d ?? '').toLowerCase() === diff;
  const today = todayKey(), doneToday = solvedToday(s, today), due = dueRevisions(s, today).length;

  const list = ncLists.find((l) => l.id === tab);
  const ncProblems = useMemo(() => (list ? neetcode.problems.filter(list.filter) : []), [list]);
  const next = tab === 'revise' ? null : nextUp(s, tab);

  let shown = 0, body: React.ReactNode[] = [];
  if (tab === 'a2z') {
    body = a2z.steps.filter((st) => ql || st.step === step).map((st) => {
      const sections = st.sections.map((sec, si) => {
        const items = sec.items.filter((it) => okDiff(it.difficulty) && (!hideDone || !a2zSolved(s, it)) && (!ql || `${st.title} ${sec.title} ${it.title}`.toLowerCase().includes(ql)));
        if (!items.length) return null;
        shown += items.length;
        return <details className="dsa-section" key={sec.title} open={!!ql || si === 0}><summary><span>{sec.title}</span><small>{items.filter((i) => a2zSolved(s, i)).length}/{items.length} done</small></summary>
          <div className="dsa-list">{items.map((it) => <A2zRow key={it.id} s={s} it={it} />)}</div></details>;
      }).filter(Boolean);
      return sections.length ? <section key={st.step} className="dsa-step"><h3 className="dsa-step-title">Step {st.step} · {st.title}</h3>{sections}</section> : null;
    });
  } else if (list) {
    body = neetcode.meta.patterns.map((pat) => {
      const items = ncProblems.filter((p) => p.pattern === pat && okDiff(p.difficulty) && (!hideDone || !ncSolved(s, p)) && (!ql || `${pat} ${p.title}`.toLowerCase().includes(ql)));
      if (!items.length) return null;
      shown += items.length;
      return <details className="dsa-section" key={pat} open={!!ql || pat === neetcode.meta.patterns[0]}><summary><span>{pat}</span><small>{items.filter((p) => ncSolved(s, p)).length}/{items.length} done</small></summary>
        <div className="dsa-list">{items.map((p) => <NcRow key={p.slug} s={s} p={p} />)}</div></details>;
    });
  }
  const total = tab === 'a2z' ? a2zItems.length : ncProblems.length;
  const done = tab === 'a2z' ? a2zItems.filter((i) => a2zSolved(s, i)).length : ncProblems.filter((p) => ncSolved(s, p)).length;

  return <>
    <section className="dsa-intro">
      <Label>Data structures and algorithms</Label><h2>Learn, then solve, then revise</h2>
      <p>Follow Striver’s A2Z in order, or drill patterns with NeetCode. Problems that appear in both share one done tick, one note and one revision schedule. Reading links go to takeUforward’s current blog articles.</p>
      <ImpactTags skills={['algorithms']} goal="CS bridge and interviews" />
      <div className="dsa-sources"><Ext href={a2z.meta.sheetUrl}>Live A2Z sheet ({a2z.meta.tufTopicCountLive} topics)</Ext><Ext href={neetcode.meta.practiceUrl}>NeetCode practice lists</Ext><Checked source="dsa" /></div>
    </section>
    <div className="dsa-today">
      <div className="goal"><span className="eyebrow">Today</span><strong>{doneToday} / {s.dsaGoal}</strong><Progress value={Math.min(100, Math.round((doneToday / s.dsaGoal) * 100))} label="Daily goal" />
        <label className="goal-edit">Daily goal <input type="number" min={1} max={20} value={s.dsaGoal} onChange={(e) => setDsaGoal(Number(e.target.value))} aria-label="Daily problem goal" /></label></div>
      {next ? <a className="next-up" href={next.href} onClick={() => { setQ(next.title); }}><span className="eyebrow">Continue where you left off</span><b>{next.title}</b><small>{next.where}</small></a>
        : tab !== 'revise' && <div className="next-up"><span className="eyebrow">All done</span><b>Every problem in this list is solved.</b></div>}
      <button className={`next-up revise-card ${due ? 'has-due' : ''}`} onClick={() => setTab('revise')}><span className="eyebrow">Revision</span><b>{due} due today</b><small>{Object.keys(s.dsaRevise).length} in queue</small></button>
    </div>
    <div className="tabs" role="tablist" aria-label="Problem list">{tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} className={`chip ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}{t.id === 'revise' && due > 0 ? ` (${due})` : ''}</button>)}</div>
    {tab === 'revise' ? <Revision s={s} /> : <>
      <div className="dsa-controls">
        {tab === 'a2z' && <label className="form-row"><span>Step</span><select value={step} onChange={(e) => setStep(Number(e.target.value))}>{a2z.steps.map((st) => <option key={st.step} value={st.step}>Step {st.step} · {st.title} ({st.sections.reduce((n, x) => n + x.items.length, 0)})</option>)}</select></label>}
        <label className="form-row"><span>Find a problem</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search all ${total} problems…`} autoComplete="off" /></label>
        <label className="form-row"><span>Difficulty</span><select value={diff} onChange={(e) => setDiff(e.target.value)}><option value="all">All</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <Check checked={hideDone} onChange={setHideDone} label="Hide done" />
      </div>
      <div className="dsa-progress"><Progress value={total ? Math.round((done / total) * 100) : 0} label="List progress" /><span>{done} / {total} done · {shown} shown</span></div>
      {body.some(Boolean) ? body : <p className="empty">No problems match. Clear the search or filters to see the full list.</p>}
    </>}
  </>;
}
