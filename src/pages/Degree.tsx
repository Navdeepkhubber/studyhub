import { degree } from '../data';
import { useAppState } from '../state/store';
import { Btn, Callout, Ext, Label, Panel, SectionHead } from '../components/ui';
import { Checked } from '../components/Checked';

export function bridgeName(b: string) {
  return b === 'stats' ? 'Statistics bridge · STATS 707 → 765' : b === 'cs' ? 'Computer science bridge · COMPSCI 717 + 751' : 'Bridging courses not recorded';
}
export function Degree() {
  const s = useAppState();
  const text = s.bridge === 'stats'
    ? <><b>Statistics bridge selected:</b> The University guide says students with a computer science background take STATS 707 in Semester One and STATS 765 in Semester Two before STATS 762 and STATS 769. Most also take COMPSCI 762 before COMPSCI 760.</>
    : s.bridge === 'cs'
      ? <><b>Computer science bridge selected:</b> The University guide says students with a statistics background take COMPSCI 717 and 751 in Semester One before COMPSCI 752 and 762; COMPSCI 762 normally precedes COMPSCI 760.</>
      : <><b>Bridging not yet recorded:</b> Your offer specifies whether you need STATS 707 + 765, COMPSCI 717 + 751, or another combination. Add it in Settings for a relevant weekly bridge focus.</>;
  return <>
    <Callout><b>Your confirmed programme:</b> Master of Data Science, taught 240 points. The requirement map below comes from the 2026 plan. The <Ext href={degree.programme2027}>2027 programme catalogue</Ext> is now published; confirm your offer, bridge, prerequisites and course availability there before enrolment. <Checked source="degree" /></Callout>
    <section className="hero"><div><Label>University of Auckland · 240 points</Label><h2>Two years of data science, with a bridge matched to your prior study.</h2>
      <p>Complete the compulsory computer science and statistics core, approved elective groups, statistical computing, and a 30-point research project. Your data engineering experience supports the big-data work; the bridge prepares you for the other discipline.</p></div>
      <div className="hero-actions"><a className="btn light" href={degree.catalogue} target="_blank" rel="noopener noreferrer">Official 240-point plan</a><a className="btn outline-light" href={degree.guide} target="_blank" rel="noopener noreferrer">Enrolment guide</a></div></section>
    <Panel><Label>Your bridging path</Label><h3>{bridgeName(s.bridge)}</h3><p>{text}</p><Btn small href="#settings">Set bridging courses</Btn></Panel>
    <SectionHead title="240-point requirement map">Meet each group’s rule and make course choices that total 240 points.</SectionHead>
    <div className="card-grid">{degree.courseGroups.map((g) => <div key={g.title} className="card"><span className="code">{g.points}</span><h3>{g.title}</h3><p className="codes">{g.codes}</p><p>{g.description}</p><Ext href={degree.catalogue}>View in official plan</Ext></div>)}</div>
    <SectionHead title="Sequencing checkpoints">From the University’s 240-point enrolment guide.</SectionHead>
    <div className="card-grid">
      <div className="card"><span className="code">First year</span><h3>Complete your assigned bridge</h3><p>Course prerequisites and semester offerings determine the order. The guide gives separate computer science and statistics background pathways, and advises checking your offer with Academic Advisers.</p><Ext href={degree.guide}>Read sequencing guide</Ext></div>
      <div className="card"><span className="code">Second year</span><h3>Statistical computing and research</h3><p>The guide places DATASCI 779 in Semester Three and the full-time DATASCI 791 research project in the final semester. Start shaping a research question and reproducible workflow during preparation.</p><Ext href={degree.guide}>Read sequencing guide</Ext></div>
    </div>
  </>;
}
