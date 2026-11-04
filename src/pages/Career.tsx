import { portfolioProjects } from '../data';
import { setText, togglePortfolio } from '../state/actions';
import { useAppState } from '../state/store';
import { Btn, Check, Ext, Field, Label, Panel, SectionHead } from '../components/ui';
import { Checked } from '../components/Checked';

const roles = [
  ['Role 01', 'SOC Analyst / Detection Engineer', 'Show alert triage, log analysis, clear escalation, tested detections and incident communication.', 'https://www.seek.co.nz/soc-analyst-jobs'],
  ['Role 02', 'Penetration Tester', 'Show authorized lab methodology, careful evidence, risk-ranked findings, remediation and retesting.', 'https://www.seek.co.nz/penetration-tester-jobs'],
  ['Role 03', 'Security Engineer / Application Security Analyst', 'Show secure design, code review, CI security controls, cloud fundamentals and strong engineering collaboration.', 'https://www.seek.co.nz/cyber-security-jobs'],
];
export function Career() {
  const s = useAppState();
  return <>
    <section className="intro"><Label>Career path · New Zealand</Label><h2>Build proof for cybersecurity roles.</h2>
      <p>Connect AUT coursework and practical labs to evidence for SOC, penetration testing, application security, security engineering and digital forensics roles. These projects are scoped for isolated labs, public data or explicitly authorized targets.</p>
      <Btn small href="/skills">Review skill gaps</Btn></section>
    <div className="card-grid three">{roles.map(([code, title, text, url]) => <article key={code} className="card"><span className="code">{code}</span><h3>{title}</h3><p>{text}</p><Ext href={url}>Browse current NZ roles</Ext></article>)}</div>
    <SectionHead title="Portfolio build tracker">Use public or permitted datasets. Save your project link and tick each review criterion when the proof is visible.</SectionHead>
    <div className="card-grid three">{portfolioProjects.map((p) => {
      const count = p.criteria.filter((_, i) => s.portfolio[`${p.id}-${i}`]).length;
      return <Panel key={p.id}><Label>{p.role} · {p.weeks}</Label><h3>{p.name}</h3><p>{p.brief}</p><span className="cadence">{count}/{p.criteria.length} criteria</span>
        <div className="task-list">{p.criteria.map((c, i) => <Check key={c} checked={!!s.portfolio[`${p.id}-${i}`]} onChange={(v) => togglePortfolio(`${p.id}-${i}`, v)} label={c} />)}</div>
        <Field label="Project URL"><input type="url" value={s.portfolioLinks[p.id] ?? ''} onChange={(e) => setText('portfolioLinks', p.id, e.target.value)} placeholder="https://github.com/..." autoComplete="off" /></Field></Panel>;
    })}</div>
    <Panel className="mt"><Label>NZ role signals</Label><h3>What employers are asking for</h3>
      <p>Use current New Zealand job listings to check role requirements before applying. Employers commonly distinguish hands-on monitoring and response, testing and reporting, and secure engineering; tailor project evidence to each role and validate current requirements against live postings.</p>
      <p><Ext href="https://www.seek.co.nz/cyber-security-jobs">Current cybersecurity roles in New Zealand</Ext> · <Ext href="https://www.seek.co.nz/security-analyst-jobs">Security analyst roles</Ext></p>
      <p className="tiny muted">Role links may expire. Re-check current listings and work eligibility before applying. <Checked source="career" /></p></Panel>
  </>;
}
