import { careerPlan, certifications, portfolioProjects } from '../data';
import { certReadiness } from '../lib/cert-readiness';
import { scheduledTopicForKey } from '../lib/coverage';
import { setText, togglePortfolio, toggleTask } from '../state/actions';
import { todayKey } from '../lib/dates';
import { useAppState } from '../state/store';
import { Btn, Check, Ext, Field, Label, Panel, Progress, SectionHead } from '../components/ui';
import { Checked } from '../components/Checked';

const roles = [
  ['Most common entry', 'SOC Analyst', 'The usual first cyber job in NZ. Show alert triage, log analysis, KQL in Sentinel, clear escalation and incident write-ups.', 'https://www.seek.co.nz/soc-analyst-jobs'],
  ['Your edge', 'Detection / Security Data Engineer', 'Your data engineering background is rare in security. Show log pipelines, normalization, tested detections and cost-aware ingestion.', 'https://www.seek.co.nz/cyber-security-jobs'],
  ['Structured route', 'Cyber Graduate (Big 4, corporates)', 'Rotations across advisory, testing and response. Apply in the March–April round, and only to programmes that accept your visa type.', 'https://www.seek.co.nz/cyber-security-jobs'],
  ['Usually a second job', 'Penetration Tester', 'NZ pentest roles typically ask for 2–3 years and certs like eJPT/PJPT, PNPT or OSCP. Build toward it from a SOC or graduate role.', 'https://www.seek.co.nz/penetration-tester-jobs'],
];
const ELIG: Record<string, [string, string]> = {
  'visa-ok': ['Accepts student or work visa (reported)', 'elig-ok'],
  'check': ['Check the listing', 'elig-check'],
  'citizen-pr': ['Citizen or PR only (reported)', 'elig-no'],
  'clearance': ['Security clearance needed', 'elig-no'],
};
function phaseOf(start: string, end: string, today: string) { return today < start ? 'upcoming' : today > end ? 'past' : 'now'; }
const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });
export function Career() {
  const s = useAppState();
  const today = todayKey();
  const readiness = certReadiness(s);
  return <>
    <section className="intro"><Label>Career path · New Zealand</Label><h2>Build proof for cybersecurity roles.</h2>
      <p>Connect AUT coursework and practical labs to evidence for SOC, penetration testing, application security, security engineering and digital forensics roles. These projects are scoped for isolated labs, public data or explicitly authorized targets.</p>
      <Btn small href="/skills">Review skill gaps</Btn></section>
    <div className="card-grid">{roles.map(([code, title, text, url]) => <article key={code} className="card"><span className="code">{code}</span><h3>{title}</h3><p>{text}</p><Ext href={url}>Browse current NZ roles</Ext></article>)}</div>
    <SectionHead title="Career timeline">Dated milestones from the research for a 22 February 2027 start. NZ hires in one March–April window each year, so your first internship round opens weeks after you arrive. Tick each milestone when it is done.</SectionHead>
    <ol className="career-timeline">{careerPlan.milestones.map((m) => { const ph = phaseOf(m.start, m.end, today); const id = `career-${m.id}`; return <li key={m.id} className={`timeline-item ${ph}`}>
      <span className="timeline-when">{fmt(m.start)}{m.start.slice(0, 7) !== m.end.slice(0, 7) ? ` – ${fmt(m.end)}` : ''}{ph === 'now' ? <b className="timeline-now">Now</b> : null}</span>
      <Check checked={!!s.done[id]} onChange={(v) => toggleTask(id, v)}><span><b>{m.title}</b> {m.detail} {m.link ? <Ext href={m.link}>Open</Ext> : null}</span></Check>
    </li>; })}</ol>
    <SectionHead title="Employer eligibility tracker">Work rights decide where you can apply as much as skills do. These notes come from employer pages and listings checked on {new Date(`${careerPlan.checked}T12:00:00`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}; rules change, so confirm on each listing before applying.</SectionHead>
    <div className="table-scroll"><table className="elig-table"><thead><tr><th scope="col">Employer</th><th scope="col">Type</th><th scope="col">Eligibility</th><th scope="col">Notes</th></tr></thead><tbody>{careerPlan.employers.map((e) => <tr key={e.name}><td><Ext href={e.url}>{e.name}</Ext></td><td>{e.kind}</td><td><span className={`elig ${ELIG[e.eligibility][1]}`}>{ELIG[e.eligibility][0]}</span></td><td>{e.note}</td></tr>)}</tbody></table></div>
    <SectionHead title="Certification plan">Built from each vendor's current exam objectives (checked {new Date(`${certifications.checked}T12:00:00`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}). "Skills done" counts the plan topics that feed the exam, so finishing your normal weeks moves you toward each cert. Prices are approximate US dollars; check the vendor.</SectionHead>
    <div className="card-grid three">{certifications.certs.map((c) => { const r = readiness.find((x) => x.id === c.id)!; const next = r.nextKey ? scheduledTopicForKey(r.nextKey) : undefined; return <article key={c.id} className="card cert-card">
      <Label>{c.when}</Label><h3>{c.name}</h3><p className="tiny muted">{c.role} · {c.cost}</p>
      {c.exam ? <Progress value={r.examPct} label={`${c.name} exam prep ${r.examPct}%`} /> : null}
      <p className="tiny">{c.exam ? <>Exam prep {r.examPct}% · </> : <>Planning only · </>}Skills done {r.prepPct}%</p>
      <p>{c.note}</p>
      <div className="row">{next ? <a className="btn small" href={`/week-${next.week}?focus=lesson-${next.key}`}>Next: week {next.week}</a> : c.exam && r.examPct === 100 ? <span className="badge">Exam prep complete</span> : c.exam ? <a className="btn small" href="/atlas">Open in Atlas</a> : null}<Ext href={c.url}>Official objectives</Ext></div>
    </article>; })}</div>
    <SectionHead title="Portfolio build tracker">Use public or permitted datasets. Save your project link and tick each review criterion when the proof is visible.</SectionHead>
    <div className="card-grid three">{portfolioProjects.map((p) => {
      const count = p.criteria.filter((_, i) => s.portfolio[`${p.id}-${i}`]).length;
      return <Panel key={p.id}><Label>{p.role} · {p.weeks}</Label><h3>{p.name}</h3><p>{p.brief}</p><span className="cadence">{count}/{p.criteria.length} criteria</span>
        <div className="task-list">{p.criteria.map((c, i) => <Check key={c} checked={!!s.portfolio[`${p.id}-${i}`]} onChange={(v) => togglePortfolio(`${p.id}-${i}`, v)} label={c} />)}</div>
        <Field label="Project URL"><input type="url" value={s.portfolioLinks[p.id] ?? ''} onChange={(e) => setText('portfolioLinks', p.id, e.target.value)} placeholder="https://github.com/..." autoComplete="off" /></Field></Panel>;
    })}</div>
    <Panel className="mt"><Label>NZ role signals</Label><h3>What NZ employers are asking for</h3>
      <p>From current New Zealand listings, the recurring requirements are: scripting in <b>Python, PowerShell and Bash</b>; the <b>Microsoft/Azure security stack</b> (Defender, Sentinel, KQL); solid <b>networking</b> (TCP/IP, firewalls, VPN, IDS/IPS); and <b>compliance frameworks</b> (ISO 27001, SOC 2, NIST, CIS Benchmarks, the NZ Information Security Manual). Clear written reporting and communication are screened for, not optional.</p>
      <p>Most people enter via a <b>SOC analyst</b> role rather than straight into penetration testing. Useful certifications, roughly in order: CompTIA Security+ or ISC2 CC, then Blue Team Level 1 or Microsoft SC-200 for SOC, and PNPT or OSCP for offensive work.</p>
      <p><b>Work eligibility and clearance:</b> many government, defence and MSP SOC roles require NZ citizenship or residency and a security clearance (for example AGSVA NV1). Check each posting's eligibility before investing time in applying.</p>
      <p><Ext href="https://www.seek.co.nz/cyber-security-jobs">Current cybersecurity roles in New Zealand</Ext> · <Ext href="https://www.seek.co.nz/security-analyst-jobs">Security analyst roles</Ext></p>
      <p className="tiny muted">Role links and requirements change. Re-check live postings and work eligibility before applying. <Checked source="career" /></p></Panel>
  </>;
}
