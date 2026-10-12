import { portfolioProjects } from '../data';
import { setText, togglePortfolio } from '../state/actions';
import { useAppState } from '../state/store';
import { Btn, Check, Ext, Field, Label, Panel, SectionHead } from '../components/ui';
import { Checked } from '../components/Checked';

const roles = [
  ['Role 01', 'Data engineer / analytics engineer', 'Show reliable pipelines, SQL, Python, cloud data and measured performance. Your existing experience should be visible in project decisions.', 'https://www.seek.co.nz/data-engineer-jobs'],
  ['Role 02', 'Data scientist', 'Show statistical inference, experiments, honest validation, R/Python and clear communication. Auckland coursework and the forecasting study support this path.', 'https://www.seek.co.nz/data-scientist-jobs'],
  ['Role 03', 'ML / AI engineer', 'Show deployable models, retrieval, evaluation, testing and safe operation. One evaluated system is more persuasive than a collection of demos.', 'https://www.seek.co.nz/machine-learning-engineer-jobs'],
];
export function Career() {
  const s = useAppState();
  return <>
    <section className="intro"><Label>Career path · New Zealand</Label><h2>Build proof for three related roles.</h2>
      <p>Your data engineering experience is a strong base. Add statistical reasoning, responsible model evaluation and one evaluated AI application. The projects below are designed to produce evidence you can discuss in interviews during or after the degree.</p>
      <Btn small href="#skills">Review skill gaps</Btn></section>
    <div className="card-grid three">{roles.map(([code, title, text, url]) => <article key={code} className="card"><span className="code">{code}</span><h3>{title}</h3><p>{text}</p><Ext href={url}>Browse current NZ roles</Ext></article>)}</div>
    <SectionHead title="Portfolio build tracker">Use public or permitted datasets. Save your project link and tick each review criterion when the proof is visible.</SectionHead>
    <div className="card-grid three">{portfolioProjects.map((p) => {
      const count = p.criteria.filter((_, i) => s.portfolio[`${p.id}-${i}`]).length;
      return <Panel key={p.id}><Label>{p.role} · {p.weeks}</Label><h3>{p.name}</h3><p>{p.brief}</p><span className="cadence">{count}/{p.criteria.length} criteria</span>
        <div className="task-list">{p.criteria.map((c, i) => <Check key={c} checked={!!s.portfolio[`${p.id}-${i}`]} onChange={(v) => togglePortfolio(`${p.id}-${i}`, v)} label={c} />)}</div>
        <Field label="Project URL"><input type="url" value={s.portfolioLinks[p.id] ?? ''} onChange={(e) => setText('portfolioLinks', p.id, e.target.value)} placeholder="https://github.com/..." autoComplete="off" /></Field></Panel>;
    })}</div>
    <Panel className="mt"><Label>NZ role signals</Label><h3>What employers are asking for</h3>
      <p>Recent New Zealand postings emphasise advanced SQL and Python, applied modelling, end-to-end delivery, privacy, and communicating results. Some research and analyst roles also explicitly ask for R and causal or forecasting work. These are examples, not a complete or permanent job-market survey.</p>
      <p><Ext href="https://jobs.govt.nz/jobtools/jncustomsearch.viewFullSingle?in_jnCounter=226704024&in_orderby=dateinput+desc&in_organid=16563">ACC data scientist example</Ext> · <Ext href="https://jobs.govt.nz/jobs/NZ-1951809">MSD forecasting example</Ext> · <Ext href="https://jobs.lever.co/tracksuit-limited/8a3a1a5a-c713-4fea-8b43-2180a46d855b">Tracksuit data scientist example</Ext></p>
      <p className="tiny muted">Role links may expire. Re-check current listings and work eligibility before applying. <Checked source="career" /></p></Panel>
  </>;
}
