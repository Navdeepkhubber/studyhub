import { useEffect } from 'react';
import { skillLanes } from '../data';
import { useRoute } from '../lib/router';
import { setSkillLevel, setText } from '../state/actions';
import { useAppState } from '../state/store';
import { Callout, Ext, Field, Label, SectionHead } from '../components/ui';

const levels = ['0 · Not started', '1 · Learning', '2 · Can do with notes', '3 · Can explain and ship'];
export function Skills() {
  const s = useAppState();
  const focus = useRoute().query.get('focus');
  const all = skillLanes.flatMap((l) => l.skills);
  const strong = all.filter((x) => Number(s.skillLevels[x.id]) === 3 && s.skillEvidence[x.id]).length;
  useEffect(() => { if (focus) document.getElementById(`skill-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [focus]);
  return <>
    <SectionHead title="Skill map">Rate what you can demonstrate, then save a link to evidence. A rating is a self-assessment, not a certification.</SectionHead>
    <Callout><b>{strong} of {all.length} skills have strong evidence.</b> Use 0 = not started, 1 = learning, 2 = can do with notes, 3 = can explain and ship. Prioritise the foundations and hands-on labs before reaching for advanced tooling.</Callout>
    {skillLanes.map((l) => <section key={l.name} className="skill-lane"><SectionHead title={l.name}>{l.description}</SectionHead>
      <div className="skill-grid">{l.skills.map((x) => <article key={x.id} id={`skill-${x.id}`} className={`skill-card ${focus === x.id ? 'focused' : ''}`}>
        <Label>Weeks {x.week}</Label><h3>{x.name}</h3><p><b>Show:</b> {x.evidence}</p>
        <div className="skill-actions"><Ext href={x.learn}>Learn</Ext><Ext href={x.practice}>Practise</Ext></div>
        <Field label="Current level"><select value={s.skillLevels[x.id] ?? 0} onChange={(e) => setSkillLevel(x.id, Number(e.target.value))}>{levels.map((t, i) => <option key={i} value={i}>{t}</option>)}</select></Field>
        <Field label="Evidence URL"><input type="url" value={s.skillEvidence[x.id] ?? ''} onChange={(e) => setText('skillEvidence', x.id, e.target.value)} placeholder="https://github.com/..." autoComplete="off" /></Field>
      </article>)}</div></section>)}
  </>;
}
