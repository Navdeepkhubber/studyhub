import { roadmap } from './index-roadmap';
import type { Track, TopicGroup } from './types';

/**
 * Atlas views group the roadmap's tracks into role- and course-oriented lenses.
 * Views reference security groups by a distinctive substring of their title (resolved
 * at load) so adding or reordering groups never silently misplaces a view.
 * The optional tracks (A data engineering, B GenAI, D interview craft) appear as
 * whole-track views for brush-up.
 */
export interface RoadmapView { id: string; name: string; source: string; url: string; groups: [track: string, group: number][] }

const C = roadmap.tracks.find((t) => t.id === 'C');
/** Resolve a Track C group index by a case-insensitive title substring. */
const cg = (needle: string): number => {
  const i = C ? C.groups.findIndex((g) => g.t.toLowerCase().includes(needle.toLowerCase())) : -1;
  return i;
};
/** Build [ 'C', index ] pairs for the named security groups, dropping any not found. */
const cGroups = (...needles: string[]): [string, number][] =>
  needles.map((n) => ['C', cg(n)] as [string, number]).filter(([, i]) => i >= 0);
const allGroups = (id: string): [string, number][] => {
  const t = roadmap.tracks.find((x) => x.id === id);
  return t ? t.groups.map((_, gi) => [id, gi] as [string, number]) : [];
};

const AUT = 'https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/courses/master-of-cyber-security-and-digital-forensics';

export const roadmapViews: RoadmapView[] = [
  // Job-role lenses over the security track
  { id: 'pentester', name: 'Penetration Tester', source: 'OWASP WSTG', url: 'https://owasp.org/www-project-web-security-testing-guide/', groups: cGroups('Security foundations', 'Networking', 'Scripting and automation', 'Secure coding', 'Web application', 'Penetration testing', 'Active Directory', 'architecture, engineering and career') },
  { id: 'soc-dfir', name: 'SOC Analyst & Digital Forensics', source: 'MITRE ATT&CK and NIST', url: 'https://attack.mitre.org/', groups: cGroups('Security foundations', 'Networking', 'Scripting and automation', 'SOC and incident', 'Digital forensics', 'SIEM and detection', 'Active Directory', 'architecture, engineering and career') },
  { id: 'appsec', name: 'Application Security Engineer', source: 'OWASP SAMM', url: 'https://owaspsamm.org/', groups: cGroups('Security foundations', 'Secure coding', 'Cryptography', 'Web application', 'Cloud and infrastructure', 'Application security and DevSecOps', 'architecture, engineering and career') },
  { id: 'security-engineer', name: 'Security Engineer', source: 'NIST SP 800-53', url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final', groups: cGroups('Security foundations', 'Networking', 'Scripting and automation', 'Cryptography', 'Cloud and infrastructure', 'Application security and DevSecOps', 'Active Directory', 'architecture, engineering and career') },

  // AUT course lenses
  { id: 'comp844', name: 'COMP844 Cybercrime, Law & Policy', source: 'AUT', url: AUT, groups: cGroups('Cybercrime, law', 'Security foundations', 'SOC and incident') },
  { id: 'comp832-843', name: 'COMP832 / COMP843 Digital Forensics', source: 'AUT', url: AUT, groups: cGroups('Digital forensics', 'Malware analysis', 'SOC and incident') },
  { id: 'comp830', name: 'COMP830 Cryptography & Cryptanalysis', source: 'AUT', url: AUT, groups: cGroups('Cryptography') },
  { id: 'comp833', name: 'COMP833 Network Security & Forensics', source: 'AUT', url: AUT, groups: cGroups('Networking', 'Digital forensics') },
  { id: 'comp821', name: 'COMP821 Information Security', source: 'AUT', url: AUT, groups: cGroups('Security foundations', 'Application security and DevSecOps', 'architecture, engineering and career') },
  { id: 'infs803', name: 'INFS803 Cloud Computing', source: 'AUT', url: AUT, groups: cGroups('Cloud security depth', 'Cloud and infrastructure') },
  { id: 'enge817', name: 'ENGE817 Research Methods & Dissertation', source: 'AUT', url: 'https://www.aut.ac.nz/research/postgraduate-research', groups: cGroups('Research methods') },
  { id: 'comp816', name: 'COMP816 IoT Security', source: 'AUT', url: AUT, groups: cGroups('IoT security', 'Networking') },

  // Emerging / market-demand lenses
  { id: 'certifications', name: 'Certifications (exam prep)', source: 'Vendor exam objectives', url: 'https://learn.microsoft.com/en-us/credentials/', groups: [...cGroups('Exam prep: CompTIA Security+', 'Exam prep: eJPT', 'Exam prep: Microsoft SC-200', 'Exam prep: Blue Team Level 1'), ...allGroups('E')] },
  { id: 'job-ready-nz', name: 'Job-ready in NZ (search, certs, presence)', source: 'NZ employer research', url: 'https://www.summeroftech.co.nz/', groups: cGroups('NZ job search', 'architecture, engineering and career', 'Security foundations') },
  { id: 'scripting', name: 'Scripting & automation (Python, Bash, PowerShell)', source: 'NZ job ads', url: 'https://exercism.org/tracks/python', groups: cGroups('Scripting and automation', 'Linux and Windows') },
  { id: 'siem-detection', name: 'SIEM & Detection Engineering (Sentinel, KQL)', source: 'Microsoft Learn / SC-200', url: 'https://learn.microsoft.com/en-us/azure/sentinel/', groups: cGroups('SIEM and detection', 'SOC and incident', 'Digital forensics') },
  { id: 'ai-security', name: 'AI Security', source: 'OWASP LLM Top 10 / NIST AI RMF', url: 'https://genai.owasp.org/llm-top-10/', groups: cGroups('AI security', 'Secure coding', 'Application security and DevSecOps') },
  { id: 'malware-re', name: 'Malware Analysis & Reverse Engineering', source: 'Ghidra / YARA', url: 'https://ghidra-sre.org/', groups: cGroups('Malware analysis', 'Linux and Windows', 'Digital forensics') },
  { id: 'cloud-security', name: 'Cloud Security Engineer', source: 'Well-Architected / CSPM', url: 'https://docs.prowler.com/', groups: cGroups('Cloud security depth', 'Cloud and infrastructure', 'Networking', 'Application security and DevSecOps') },

  // Optional brush-up tracks (not scheduled)
  { id: 'data-engineering', name: 'Data engineering (optional)', source: 'roadmap.sh', url: 'https://roadmap.sh/data-engineer', groups: allGroups('A') },
  { id: 'genai', name: 'GenAI, RAG & agents (optional)', source: 'roadmap.sh', url: 'https://roadmap.sh/ai-engineer', groups: allGroups('B') },
  { id: 'interview', name: 'Coding & interview craft (optional)', source: 'NeetCode', url: 'https://neetcode.io/practice', groups: allGroups('D') },
];

export function roadmapHas(view: RoadmapView, track: Track, group: TopicGroup): boolean {
  const gi = track.groups.indexOf(group);
  return view.groups.some(([t, g]) => t === track.id && g === gi);
}

/** e.g. "48 topics · Track C". Computed so it never drifts from roadmap.json. */
export function roadmapScope(view: RoadmapView): string {
  const n = view.groups.reduce((a, [t, g]) => a + (roadmap.tracks.find((x) => x.id === t)?.groups[g]?.i.length ?? 0), 0);
  const tr = [...new Set(view.groups.map(([t]) => t))].join(', ');
  return `${n} topics · Track ${tr}`;
}
