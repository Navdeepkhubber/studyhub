import { dsaTrackers, practiceTracks } from '../data';
import { Btn, Ext, Label } from '../components/ui';

export function Practice() {
  return <>
    <section className="intro"><Label>Hands-on practice</Label><h2>Pick one track and solve real problems.</h2>
      <p>Use these resources alongside the exact checkpoints in your weekly plan. The scheduled plan is cybersecurity and digital forensics; data engineering, GenAI and interview topics stay optional in the Atlas. DSA remains a separate interview practice tracker and does not mark a university course complete.</p>
      <Btn small href="/today">Back to today</Btn></section>
    <div className="practice-grid">{practiceTracks.map((t) => {
      const resources = t.resources === 'DSA_TRACKERS' ? dsaTrackers : t.resources;
      return <section key={t.key} className="practice-card" id={`practice-${t.key}`}>
        <Label>{t.when}</Label><h3>{t.name}</h3><p>{t.goal}</p><span className="cadence">{t.cadence}</span>
        <div className="practice-links">{resources.map(([type, name, url, desc]) => <Ext key={url} href={url}><span className="eyebrow">{type}</span><b>{name}</b><small>{desc}</small></Ext>)}</div>
        {t.key === 'dsa' && <Btn href="/dsa">Open the DSA tracker</Btn>}
      </section>;
    })}</div>
    <p className="tiny muted">Use the exercise sites to track problem completion. Record useful solutions or links in your weekly notes here.</p>
  </>;
}
