import { degree } from '../data';
import { Ext, Label, SectionHead } from '../components/ui';
import { Checked } from '../components/Checked';

export function Degree() {
  return <>
    <aside className="callout"><b>Programme facts are from AUT’s current public programme page.</b> AK1324 · NZQF Level 9 · 180 points · 1.5 years full-time; part-time study is available. Course availability and your approved study plan can change, so confirm your enrolment with AUT. <Checked source="degree" /></aside>
    <section className="hero"><div><Label>Auckland University of Technology · AK1324</Label><h2>Master of Cyber Security and Digital Forensics</h2>
      <p>Use this page to connect your AUT coursework, practical labs, research and dissertation to a job-ready body of evidence. The weekly plan covers the compulsory courses and the electives you're likely to take — cryptography (COMP830), network security (COMP833), information security (COMP821), cloud (INFS803) and IoT (COMP816) — plus market-demand skills (Sentinel/KQL detection, AI security, malware analysis) that AUT papers touch only lightly. It is preparatory study and role preparation; it does not replace course teaching or AUT assessment, and it does not cover the blockchain elective (COMP842).</p></div>
      <div className="hero-actions"><a className="btn light" href={degree.catalogue} target="_blank" rel="noopener noreferrer">Official programme page</a><a className="btn outline-light" href={degree.guide} target="_blank" rel="noopener noreferrer">AUT postgraduate handbook</a></div></section>
    <SectionHead title="Official 180-point structure">Choose the coursework or thesis pathway with AUT. Confirm your individual course plan, prerequisites, availability and research approval requirements.</SectionHead>
    <div className="card-grid">{degree.courseGroups.map(g=><article key={g.title} className="card"><span className="code">{g.points}</span><h3>{g.title}</h3><p className="codes">{g.codes}</p><p>{g.description}</p><Ext href={degree.catalogue}>Check AUT programme details</Ext></article>)}</div>
    <SectionHead title="Coursework-to-career study loop">For each course topic, create a small lab, connect the result to a security control or investigative claim, and keep a short evidence note. For the dissertation, retain a literature matrix, approved method, reproducible artefacts, evaluation and limitations.</SectionHead>
    <div className="card-grid three"><article className="card"><h3>Before each assessment</h3><p>Map the rubric to the relevant checkpoints, readings, lab evidence and questions for your lecturer. Use the weekly notes to track gaps and revision.</p></article><article className="card"><h3>Research and dissertation</h3><p>Start with a narrow research question. Confirm ethics and data access with AUT, keep a reproducible research log, compare against a baseline, and state validity threats.</p></article><article className="card"><h3>Build employable proof</h3><p>Turn assessed and personal work into sanitized, permission-safe portfolio artefacts with a clear README, diagrams, findings, remediation and lessons learned.</p></article></div>
  </>;
}
