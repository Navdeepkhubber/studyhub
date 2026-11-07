import roadmapJson from './roadmap.json';
import { curriculum } from './curriculum';
import type { Roadmap } from './types';
const source = roadmapJson as unknown as Roadmap;
const exits = [
  'Set up a safe home lab, work confidently on Linux and Windows from the command line, write small scripts, and cover the Security+ domains.',
  'Read a packet capture, trace untrusted input to a sensitive operation, and explain and use the core cryptographic primitives (COMP830).',
  'Find and remediate the main OWASP Top 10 classes in a lab, and run an authorized test from scope to report.',
  'Stand up a mini-SOC in Microsoft Sentinel: ingest logs, write KQL detections, and triage an incident toward SC-200 outcomes.',
  'Acquire and verify evidence, carry a forensic case to defensible findings (COMP832/843), and analyse a malware sample safely.',
  'Secure a cloud environment (INFS803) with IAM, network and logging controls; scan containers and reason about IoT risk (COMP816).',
  'Red-team an AI application: prompt injection, pipeline risks, and using AI to assist detection; map to the NIST AI RMF.',
  'Turn a security topic into a researchable question with ethics, method and baseline (ENGE817); draft a proposal.',
  'Explain NZ cybercrime law (COMP844) with real cases, write a risk register and a security policy, and finish your portfolio projects.',
];
const capstoneOutputs: Record<number,string> = {
  65: 'Publish one portfolio project end to end with a clear README, evidence and limitations.',
  66: 'Re-do one earlier lab without notes and record what you had forgotten.',
  67: 'Publish an architecture or investigation write-up and explain the key trade-offs.',
  68: 'Write up one investigation or finding in full: method, evidence, conclusion.',
  69: 'Pin your strongest repositories with reproducible setup and sanitized data.',
  70: 'Review weak areas across the programme and record corrections.',
  71: 'Dry-run your dissertation companion repo: question, method, evidence and reproducibility.',
  72: 'Link finished projects from your resume and complete a final portfolio and degree review.',
};
export const roadmap: Roadmap = {
  tracks: source.tracks,
  weeks: curriculum.weeks.map(w => ({
    n: w.n,
    f: [...new Set(w.topics.map(key => key[0]))].map(id => [id, `Complete the scheduled ${source.tracks.find(t => t.id === id)!.name.toLowerCase()} checkpoints below.`] as [string,string]),
    o: capstoneOutputs[w.n] ?? `Save worked examples or project evidence for this week's ${w.topics.length} roadmap checkpoints.`,
  })),
  phases: curriculum.phases.map((p,i) => ({ name:p.name, weeks:[p.start,p.end], exit:exits[i] })),
};
