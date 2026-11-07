#!/usr/bin/env node
/**
 * Rebuild the Study Hub curriculum around the AUT Master of Cyber Security and
 * Digital Forensics, balancing job-readiness with masters coursework.
 *
 * Scheduled (weekly plan): Track C, the cybersecurity and digital forensics roadmap.
 * Optional (Atlas only, unscheduled): Track A (data engineering), Track B (GenAI),
 *   Track D (coding & interview craft). The R track and all data-science statistics/ML
 *   material are removed.
 *
 * Writes: roadmap.json, curriculum-plan.json, study-resources.json, skills.json,
 *   practice-tracks.json, titles.json, phases-names.json, and src/data/roadmaps.ts.
 * Keeps the strict invariants in scripts/check-curriculum.mjs and check-data.mjs.
 */
import { readFile, writeFile } from 'node:fs/promises';
const dir = new URL('../src/data/', import.meta.url);
const read = async (name) => JSON.parse(await readFile(new URL(name, dir), 'utf8'));
const write = async (name, obj) => writeFile(new URL(name, dir), JSON.stringify(obj, null, 2) + '\n');

const oldRoadmap = await read('roadmap.json');
const oldRes = await read('study-resources.json');
const src = oldRes.sources; // reuse the existing, link-checked source catalog

// ---------------------------------------------------------------------------
// 1. TRACKS
// ---------------------------------------------------------------------------
// Scheduled security track (C). A leading '*' marks a priority checkpoint.
// 13 groups, each a coherent block. No filler "Applied lab N" items.
const securityGroups = [
  { t: 'Security foundations', i: [
    '*Security principles: confidentiality, integrity, availability',
    '*Threat, vulnerability, exploit and risk',
    '*Assets, trust boundaries and attack surface',
    'Adversary goals, capability and opportunity',
    'Threat modelling with STRIDE',
    'Risk assessment: likelihood, impact and treatment',
    'Security controls: preventive, detective, corrective',
    'Build a home lab: VMs, snapshots, isolated networking and safe scope',
  ] },
  { t: 'Networking and protocols', i: [
    '*TCP/IP, OSI layers, routing and subnetting',
    '*DNS resolution, records, caching and abuse cases',
    '*HTTP request/response, headers, cookies and sessions',
    '*TLS handshake, certificates and common configuration errors',
    'Ports, sockets, NAT, firewalls and network segmentation',
    '*Packet capture with Wireshark: filters and protocol reading',
    'Network scanning with nmap: host discovery and service enumeration in a lab',
  ] },
  { t: 'Linux and Windows for security', i: [
    '*Linux filesystem, permissions, users and groups',
    '*Processes, services, logs and systemd',
    '*Windows architecture, accounts, services and event logs',
    'The Windows registry, scheduled tasks and services for investigation',
    'Command-line fluency on both OSes for daily security work',
  ] },
  { t: 'Scripting and automation for security', i: [
    // Explicit levels: a from-scratch ladder across Bash, Python, PowerShell and Git.
    '[B]*Bash basics: navigation, pipes, redirection, variables and globbing',
    '[B]*Python from scratch: data types, control flow, functions, modules',
    '[B]*Git and GitHub: branches, commits and reproducible lab notes',
    '[B]PowerShell basics: cmdlets, objects, the pipeline and remoting',
    '[I]*Bash scripting: loops, conditionals, functions and safe quoting',
    '[I]Bash for security: grep, awk, sed, jq and log triage one-liners',
    '[I]*Python files, strings and regular expressions for parsing logs',
    '[I]*Python for the web: requests, JSON and talking to security APIs',
    '[I]PowerShell for investigation: event logs, processes, the registry',
    '[A]Python for automation: argparse, error handling, small security tools',
    '[A]*Build a portfolio tool: automate a real security task end to end',
  ] },
  { t: 'Secure coding and application fundamentals', i: [
    '*HTTP clients, JSON, APIs and input validation',
    '*JavaScript execution model, the DOM and browser security',
    '*SQL fundamentals and parameterized queries',
    'Memory, processes and basic C concepts for vulnerability literacy',
    '*Authentication, authorization and session design',
    'Secrets management and configuration hygiene',
    'Unit and integration testing for security behaviour',
    'Dependency management, SBOM concepts and supply-chain risk',
    '*Read code and trace untrusted input to a sensitive operation',
  ] },
  { t: 'Cryptography and identity', i: [
    '*Cryptographic goals and correct primitive selection',
    '*Encoding versus encryption versus hashing',
    '*Symmetric encryption, modes and authenticated encryption',
    '*Public-key cryptography, signatures and key exchange',
    '*Password hashing, salts and work factors',
    '*PKI, certificates, trust chains and revocation',
    'MFA, passkeys and phishing-resistant authentication',
    'OAuth 2.0, OpenID Connect and SAML concepts',
    'Key lifecycle: storage, rotation and access',
    'Number theory basics behind RSA and Diffie-Hellman (COMP830)',
    'Common crypto failures and how to review an implementation',
  ] },
  { t: 'Web application security', i: [
    '*OWASP Top 10 overview and risk context',
    '*HTTP security headers, CORS and browser boundaries',
    '*Access control failures and IDOR testing in a lab',
    '*SQL injection: root cause, safe reproduction and remediation',
    '*Cross-site scripting: reflected, stored and DOM cases',
    '*CSRF, cookies, SameSite and request integrity',
    'Server-side request forgery and egress controls',
    'Path traversal, file upload and parser risks',
    'Authentication, session fixation and account recovery',
    'Business logic abuse and race-condition fundamentals',
    'API security: object authorization, rate limits and schema validation',
  ] },
  { t: 'Penetration testing methodology', i: [
    '*Rules of engagement, authorization and scope',
    '*Reconnaissance: passive sources and asset inventory',
    'Service discovery and evidence-based enumeration',
    'Vulnerability triage: exploitability, impact and false positives',
    'Exploitation in a lab: initial access and validation',
    'Post-exploitation, privilege escalation and lateral movement concepts',
    '*Report writing: findings, risk rating, remediation and retest',
    'Certification path: PNPT then OSCP (plan for the first years of work)',
  ] },
  { t: 'SOC and incident response', i: [
    '*SOC roles, alert lifecycle and escalation quality',
    '*Log sources: endpoint, identity, DNS, proxy and cloud',
    '*SIEM data model, normalization and enrichment',
    'Detection engineering: hypothesis, query and test data',
    '*MITRE ATT&CK mapping and analytic coverage',
    'Windows event analysis and Sysmon fundamentals',
    '*Incident response lifecycle: prepare, detect, contain, eradicate, recover',
    'Write and test a Sigma detection rule',
  ] },
  { t: 'Digital forensics', i: [
    '*Forensic principles: integrity, repeatability and documentation',
    '*Chain of custody and evidence-handling requirements',
    '*Disk images, partitions, file systems and acquisition',
    '*Forensic imaging, write blockers and verification hashes',
    '*Deleted files, metadata and file-system artefacts',
    '*Windows artefacts: registry, event logs, Prefetch and timelines',
    'Linux artefacts: auth logs, shell history and the journal',
    'Memory forensics with Volatility: processes, network and injection',
    'Mobile forensics scope, acquisition constraints and privacy',
    'Network forensics: carving a PCAP into a sourced timeline',
  ] },
  { t: 'Cloud and infrastructure security', i: [
    // Azure is the primary hands-on platform (NZ SOC and security roles lean Microsoft);
    // each topic names the AWS equivalent so the concepts transfer.
    '*Shared responsibility and cloud threat modelling (Azure first, mapped to AWS)',
    'Certification (optional): SC-900 or AZ-900 fundamentals',
    '*Cloud identity: Entra ID, Azure RBAC and least privilege (compare AWS IAM)',
    '*Network boundaries: VNets, NSGs and private endpoints (compare AWS VPCs and security groups)',
    '*Storage exposure: Azure Storage access, encryption and logging (compare Amazon S3)',
    '*Cloud audit logs: Azure Activity and Entra sign-in logs (compare AWS CloudTrail)',
    'Containers: image hygiene, isolation and runtime risks',
    'Kubernetes identity, network policy and secrets basics (AKS and EKS)',
    'Infrastructure as code review and policy checks (Bicep, Terraform, Azure Policy)',
    'CI/CD pipeline permissions and artifact integrity',
    'Cloud detection and posture with Microsoft Defender for Cloud',
  ] },
  { t: 'Application security and DevSecOps', i: [
    '*Secure SDLC and security requirements',
    '*Code review for trust boundaries and authorization',
    '*SAST, DAST, SCA and secrets scanning: strengths and limits',
    'Threat modelling during design and change review',
    'CI security gates with actionable findings',
    'Dependency pinning, provenance and artifact signing',
    'Container and infrastructure scanning workflow',
    'Vulnerability management, SLAs and exception handling',
  ] },
  { t: 'Research methods and dissertation', i: [
    '*Turn a broad security topic into a researchable question (ENGE817)',
    '*Literature search, source evaluation and the research gap',
    '*Research design: experiment, case study or measurement',
    '*Ethics, privacy, consent and responsible disclosure',
    'Data collection, provenance and reproducibility',
    'Evaluation metrics, baselines and threats to validity',
    '*Research proposal: question, method, scope and timeline',
    'Maintain a literature matrix and annotated bibliography',
    'Reproducible experiments, versioning and an audit trail',
  ] },
  { t: 'Security architecture, engineering and career', i: [
    '*Security architecture principles and trust boundaries',
    '*Zero trust concepts and practical access decisions',
    'Network segmentation and secure remote access',
    'Risk registers, treatment plans and control ownership',
    '*NIST SP 800-53 control families and evidence',
    'ISO/IEC 27001 ISMS concepts and audit evidence',
    'CIS Controls and CIS Benchmarks for hardening',
    'NZ Information Security Manual (NZISM) and government context',
    'Privacy by design and data minimization',
    'Business continuity, backup and recovery testing',
    '*Choose a target role and map evidence to its requirements',
    '*Security-focused resume and STAR examples with measurable evidence',
    'Portfolio hygiene: remove secrets, sanitize data, verify licences',
    '*Interview preparation: networking, Linux, web, forensics and security concepts',
    'Build a 90-day learning and job-search plan',
  ] },
  // ---- New in-demand tracks (groups 13-18) ----
  { t: 'Cybercrime, law and policy (COMP844)', i: [
    '*Cybercrime typology: fraud, ransomware, intrusion, insider, nation-state',
    '*The cyber threat landscape and attacker motivations',
    'Cybercrime profiling and the socio-technical view of offending',
    'NZ legal context: Privacy Act 2020, Crimes Act computer offences, Harmful Digital Communications Act',
    'International law, jurisdiction and cross-border investigation',
    'Evidence law, admissibility and expert-witness duties',
    'Cyberwarfare, critical infrastructure and the dark web',
    'Security governance, policy writing and acceptable-use frameworks',
    'Ethics, responsible disclosure and the law around testing',
    'Write a case-study report with a risk-mitigation plan',
  ] },
  { t: 'SIEM and detection: Microsoft Sentinel & Defender', i: [
    '*SOC tooling landscape: SIEM, EDR/XDR, SOAR and where each fits',
    '*Microsoft Sentinel architecture: workspaces, data connectors, ingestion',
    '*KQL fundamentals: where, project, summarize, join, time windows',
    '*KQL for hunting: parsing logs, aggregations, anomalies',
    'Microsoft Defender XDR: endpoints, identity, email and cloud apps',
    'Analytics rules, incidents and the alert lifecycle in Sentinel',
    'Detection engineering: hypothesis, rule, test data, tuning',
    'Sigma rules and converting them to KQL',
    'SOAR playbooks and automated response in Sentinel',
    'Threat hunting with ATT&CK and KQL notebooks',
    'Security data engineering: log pipelines, parsing and normalization (Sentinel ASIM)',
    'Cost-aware ingestion: table plans, retention and filtering at the source',
    'Build a mini-SOC: ingest logs, write detections, triage an incident',
    'Portfolio: a detection pipeline that showcases your data engineering background',
  ] },
  { t: 'AI security', i: [
    '*How LLMs and ML systems work, from a security viewpoint',
    '*OWASP Top 10 for LLM applications',
    '*Prompt injection, direct and indirect, and jailbreaks',
    'Data poisoning, model and supply-chain integrity',
    'Securing AI pipelines: data, training, deployment, monitoring',
    'Sensitive-data disclosure, output handling and guardrails',
    'Agentic systems: tool abuse, excessive agency, sandboxing',
    'NIST AI Risk Management Framework and governance',
    'AI for defence: LLM-assisted triage, detection and log analysis',
    'Red-teaming an AI application end to end',
  ] },
  { t: 'Malware analysis and reverse engineering', i: [
    '*Malware types, behaviour and the analysis lab setup (isolated, snapshotted)',
    '*Static analysis: strings, hashes, PE structure, imports',
    '*Dynamic analysis: sandboxing, process and network behaviour',
    'Windows internals for analysts: processes, DLLs, registry, API calls',
    'Assembly and x86/x64 basics for reversing',
    'Disassembly and decompilation with Ghidra',
    'Debugging with x64dbg: breakpoints, memory, patching',
    'Unpacking, obfuscation and anti-analysis techniques',
    'Writing YARA rules from malware traits',
    'Document findings: IOCs, capability, attribution caveats',
  ] },
  { t: 'Cloud security depth (INFS803)', i: [
    '*Cloud models, shared responsibility and the Azure Well-Architected security pillar',
    '*Identity and access: Entra ID roles, managed identities, privileged access, federation',
    '*Network security: segmentation, private access and egress control in Azure and AWS',
    'Data protection: Azure Key Vault, encryption and key management (compare AWS KMS)',
    'Logging, monitoring and cloud-native detection with Defender for Cloud and Sentinel',
    'Posture management: Defender for Cloud secure score, Azure Policy and Prowler (multi-cloud)',
    'Container security: images, registries, runtime (Trivy, Falco)',
    'Kubernetes security: RBAC, network policy, secrets, admission control',
    'Infrastructure as code scanning (Checkov) and policy as code',
    'Cloud incident response and forensics across Azure and AWS',
    'Certification path: SC-500 Cloud and AI Security Engineer (replaced AZ-500; plan for after your first role)',
  ] },
  { t: 'Active Directory and Microsoft identity', i: [
    '[B]*Active Directory fundamentals: domains, forests, OUs, users and groups',
    '[B]*Group Policy, DNS and authentication flow in a Windows domain',
    '[B]Entra ID and Microsoft 365 administration basics',
    '[I]*Kerberos and NTLM: tickets, delegation and why they get abused',
    '[I]Entra ID security: conditional access, MFA, privileged identity management',
    '[I]AD attack paths in a lab: enumeration, BloodHound concepts, Kerberoasting',
    '[A]Detecting identity attacks with Defender for Identity and Sentinel',
    '[A]AD hardening: tiered admin model, LAPS, least privilege and auditing',
  ] },
  { t: 'NZ job search and professional presence', i: [
    '[B]*Check work-rights eligibility on every listing before applying',
    '[B]*NZ-format CV and tailored cover letter for security roles',
    '[B]*LinkedIn profile and a GitHub with two or three security projects',
    '[B]Register with Summer of Tech and AUT Employability and Careers',
    '[I]*Apply in the March–April graduate and internship round',
    '[I]Join the AUT Cyber Security & Intelligence club and compete in CTFs',
    '[I]Network in person: meetups, Kawaiicon, the NZ Cyber Security Challenge',
    '[I]Behavioural interviews: STAR stories from labs, projects and work',
    '[A]Technical interviews: explain a lab, a detection or a finding out loud',
    '[A]Write up and publish one project or CTF solution per month',
  ] },
  { t: 'Exam prep: CompTIA Security+ (SY0-701)', i: [
    '[B]*Exam basics: 5 domains, up to 90 questions in 90 minutes, PBQs, 750/900 to pass; confirm SY0-701 or SY0-801 before booking',
    '[B]Domain 1 General Security Concepts (12%): control types, CIA and AAA, zero trust, change management, cryptographic solutions',
    '[I]*Domain 2 Threats, Vulnerabilities and Mitigations (22%): threat actors, vectors, vulnerability types, indicators, mitigations',
    '[I]Domain 3 Security Architecture (18%): architecture models, secure infrastructure, data protection, resilience and recovery',
    '[I]*Domain 4 Security Operations (28%): hardening, asset and vulnerability management, monitoring, IAM, automation, IR, investigation',
    '[I]Domain 5 Security Program Management and Oversight (20%): governance, risk, third parties, compliance, audits, awareness',
    '[A]Performance-based questions: firewall rule ordering, device placement and log analysis',
    '[A]*Timed full-length practice exams; drill any domain below 80%',
    '[A]Book and pass the exam',
  ] },
  { t: 'Exam prep: eJPT (INE)', i: [
    '[B]*Exam basics: 48-hour browser lab, 35 questions, 70% to pass (PJPT is an Active Directory-focused alternative)',
    '[I]Assessment Methodologies (25%): host discovery, port and service enumeration, vulnerability identification',
    '[I]Host and Network Auditing (25%): enumerate systems and services, gather hashes and credentials, transfer files',
    '[I]*Host and Network Penetration Testing (35%): exploitation including Metasploit, brute force, hash cracking, pivoting',
    '[I]Web Application Penetration Testing (15%): web recon, hidden directories, login brute force, common web vulnerabilities',
    '[A]*Full practice lab under exam conditions with a methodology checklist and notes',
    '[A]Book and pass the exam',
  ] },
  { t: 'Exam prep: Microsoft SC-200', i: [
    '[B]*Exam basics: skills outline as of 21 October 2026, 700 to pass, free annual renewal; free Microsoft Learn path and practice assessment',
    '[B]Ingest data into Sentinel: data connectors, Windows Security Events via AMA, Syslog and CEF, Azure activity logs, custom tables',
    '[I]Configure automation: Defender for Endpoint settings and ASR rules, automated investigation, Sentinel automation rules and playbooks',
    '[I]*Configure detections: Advanced Hunting custom detections, Sentinel analytics rules (scheduled, NRT), MITRE ATT&CK coverage',
    '[I]*Respond to incidents in Defender XDR: Office 365, Entra ID, Defender for Identity, Cloud Apps, Purview and Sentinel alerts',
    '[I]Respond on endpoints and M365: device timelines, live response, investigation packages, Purview Audit',
    '[A]*Threat hunting (20-25%): choose tables, KQL and Advanced Hunting, threat analytics, hunting graphs, Sentinel hunting queries',
    '[A]Manage the platform: Sentinel roles, data retention tiers, workbooks and SOC optimization',
    '[A]Practice assessment, then book and pass the exam',
  ] },
  { t: 'Exam prep: Blue Team Level 1 (BTL1)', i: [
    '[B]*Exam basics: 24-hour practical incident response exam, 70% to pass (provider renamed Centri in June 2026)',
    '[B]Security Fundamentals: controls, networking, risk and Active Directory basics',
    '[I]Phishing Analysis: headers, URLs, attachments, artefacts, defensive actions and reporting',
    '[I]Threat Intelligence: actors and APTs, operational, tactical and strategic intelligence, MITRE ATT&CK',
    '[I]*Digital Forensics: evidence collection, Windows and Linux investigations, Volatility, Autopsy',
    '[I]*SIEM: logging, aggregation, correlation and investigation in Splunk',
    '[A]*Incident Response: NIST lifecycle, linking SIEM alerts to forensic artefacts across one incident',
    '[A]Practise full investigations on CyberDefenders, then book and pass the exam',
  ] },
  { t: 'IoT security (COMP816)', i: [
    '*IoT architecture, protocols (MQTT, CoAP) and the expanded attack surface',
    '*Device, firmware, network and cloud layers of IoT risk',
    'Firmware extraction and analysis basics',
    'Hardware interfaces and common IoT weaknesses (OWASP IoT Top 10)',
    'Securing IoT: identity, updates, segmentation and monitoring',
  ] },
];

// Resolve a group's index by a distinctive substring of its title, so the rest of
// the script never hard-codes numeric indices (which shift when groups are added).
const gi = (needle) => {
  const idx = securityGroups.findIndex((g) => g.t.toLowerCase().includes(needle.toLowerCase()));
  if (idx < 0) throw new Error(`No security group matching "${needle}"`);
  return idx;
};

// Tag every security checkpoint with a level. Within a group, progress from
// Beginner to Advanced across its items (first ~third B, middle I, last ~third A),
// preserving any existing priority star. The level is encoded as a "[B]/[I]/[A]"
// prefix that the app parses into a badge.
for (const g of securityGroups) {
  const n = g.i.length;
  g.i = g.i.map((raw, idx) => {
    if (/^\[(B|I|A)\]/.test(raw)) return raw; // respect explicit level tags
    const frac = n <= 1 ? 0 : idx / (n - 1);
    const tag = frac < 0.34 ? '[B]' : frac < 0.70 ? '[I]' : '[A]';
    return tag + raw; // raw may already start with '*'
  });
}

// Optional, unscheduled tracks: keep data engineering, GenAI, and interview craft.
// Reuse the existing Track A, B, D group CONTENT but relabel the goals as optional.
const A = oldRoadmap.tracks.find(t => t.id === 'A');
const B = oldRoadmap.tracks.find(t => t.id === 'B');
const D = oldRoadmap.tracks.find(t => t.id === 'D');

const ccGroups = [
  { t: 'Exam prep: ISC2 Certified in Cybersecurity (CC)', i: [
    '[B]*Exam basics: adaptive, 100-125 items in 2 hours, 700/1000 to pass; outline effective 1 September 2026; US$199 plus US$50 a year',
    '[B]Domain 1 Security Principles (24%): CIA, AAA, privacy, risk management, control types, ISC2 Code of Ethics',
    '[I]Domain 2 Security Governance (17.3%): GRC planning, redundancy and BCDR, security awareness, measuring effectiveness',
    '[I]Domain 3 Identity and Access Management Concepts (20%): logical access controls and identity lifecycle',
    '[I]Domain 4 Networking and Cloud Security Concepts (21.3%): network security, architecture, cloud security, zero trust',
    '[I]Domain 5 Security Operations and Incident Response (17.3%): data security, operations, IR, asset protection, testing',
    '[A]Timed practice exams written for the post-September 2026 outline',
    '[A]Book and pass the exam',
  ] },
];
const tracks = [
  { id: 'A', name: 'Data engineering (optional)',
    goal: 'Optional brush-up: SQL, Spark, lakehouse, pipelines and system design. Not scheduled — dip in from the Atlas on any day.',
    groups: A.groups },
  { id: 'B', name: 'GenAI, RAG and agents (optional)',
    goal: 'Optional brush-up: how LLMs work, retrieval, agents and evaluation. Useful for AI-security work and dissertation ideas. Not scheduled.',
    groups: B.groups },
  { id: 'C', name: 'Cybersecurity and digital forensics',
    goal: 'The scheduled core: academic mastery for the AUT masters plus demonstrable skills for security engineering, penetration testing, SOC, application security and digital forensics roles.',
    groups: securityGroups },
  { id: 'E', name: 'Certification alternatives (optional)',
    goal: 'Optional: ISC2 CC as a cheaper, lighter alternative to Security+. Take one of the two, not both. Not scheduled.',
    groups: ccGroups },
  { id: 'D', name: 'Coding and interview craft (optional)',
    goal: 'Optional: algorithms, timed drills and behavioural practice for technical screens. Not scheduled; the DSA tracker runs alongside.',
    groups: D.groups },
];

// ---------------------------------------------------------------------------
// 2. WEEKLY PLAN (balanced, security-only; 72 blocks)
// ---------------------------------------------------------------------------
// Only Track C checkpoints are scheduled. Each is scheduled exactly once.
// Balanced ordering: each phase pairs job-ready skills with masters coursework.
const C = { groups: securityGroups };
const keysOf = (g) => securityGroups[g].i.map((_, i) => `C-${g}-${i}`);

// Group index reference:
// 0 foundations, 1 networking, 2 linux/win/scripting, 3 secure coding,
// 4 crypto, 5 web, 6 pentest, 7 soc, 8 forensics, 9 cloud, 10 appsec,
// 11 research, 12 architecture+career.

// Round-robin interleave across several groups' key lists (balances practical +
// coursework within a phase). Takes arrays of keys and alternates between them.
function interleave(keyLists) {
  const queues = keyLists.map(l => [...l]);
  const out = [];
  let more = true;
  while (more) {
    more = false;
    for (const q of queues) { if (q.length) { out.push(q.shift()); more = true; } }
  }
  return out;
}

// Each phase owns a set of groups and runs over exactly 8 blocks. Within a phase
// we interleave its groups so each block pairs practical skills with coursework,
// which is the "balanced" goal. Groups shared across phases (8 forensics, 12
// architecture/career) are split so no checkpoint is scheduled twice.
const half = (g, which) => { const k = keysOf(g); const mid = Math.ceil(k.length / 2); return which === 0 ? k.slice(0, mid) : k.slice(mid); };

const BLOCKS = 72;
const PHASE_LEN = 8;
const phaseNames = [
  'Foundations, systems & Security+',
  'Networking, secure coding & cryptography',
  'Web security & offensive labs',
  'SOC, SIEM & detection engineering',
  'Digital forensics & malware analysis',
  'Cloud, IoT & application security',
  'AI security & emerging skills',
  'Research methods & dissertation',
  'Career, cybercrime law & consolidation',
];
// Phases reference groups by name via gi(), so adding or reordering groups above
// never silently misplaces content. Each phase runs over exactly 8 blocks.
const G = {
  foundations: gi('Security foundations'),
  networking: gi('Networking'),
  os: gi('Linux and Windows'),
  scripting: gi('Scripting and automation'),
  secureCoding: gi('Secure coding'),
  crypto: gi('Cryptography'),
  web: gi('Web application'),
  pentest: gi('Penetration testing'),
  soc: gi('SOC and incident'),
  forensics: gi('Digital forensics'),
  cloudCore: gi('Cloud and infrastructure'),
  appsec: gi('Application security and DevSecOps'),
  research: gi('Research methods'),
  career: gi('architecture, engineering and career'),
  cybercrime: gi('Cybercrime, law'),
  siem: gi('SIEM and detection'),
  aisec: gi('AI security'),
  malware: gi('Malware analysis'),
  cloudDepth: gi('Cloud security depth'),
  iot: gi('IoT security'),
  ad: gi('Active Directory'),
  secplus: gi('Exam prep: CompTIA Security+'),
  ejpt: gi('Exam prep: eJPT'),
  sc200: gi('Exam prep: Microsoft SC-200'),
  btl1: gi('Exam prep: Blue Team Level 1'),
  jobsearch: gi('NZ job search'),
};
const phaseGroups = [
  interleave([keysOf(G.jobsearch), keysOf(G.foundations), keysOf(G.os), keysOf(G.scripting), keysOf(G.secplus)]), // P1 foundations + OS + scripting + networking + NZ job search (the first application round opens weeks after arrival)
  interleave([keysOf(G.networking), keysOf(G.secureCoding), keysOf(G.crypto)]),                        // P2 secure coding + cryptography (COMP830)
  interleave([keysOf(G.web), keysOf(G.pentest), keysOf(G.ad), keysOf(G.ejpt)]),                 // P3 web + offensive labs + Active Directory
  interleave([keysOf(G.soc), keysOf(G.siem), keysOf(G.sc200)]),                                   // P4 SOC/IR + Sentinel/KQL detection (NZ market)
  interleave([keysOf(G.forensics), keysOf(G.malware), keysOf(G.btl1)]),                          // P5 forensics (COMP832/843) + malware/RE
  interleave([keysOf(G.cloudCore), keysOf(G.cloudDepth), keysOf(G.iot), keysOf(G.appsec)]), // P6 cloud + IoT + appsec
  interleave([keysOf(G.aisec)]),                                                 // P7 AI security
  interleave([keysOf(G.research)]),                                              // P8 research & dissertation (ENGE817)
  interleave([keysOf(G.cybercrime), keysOf(G.career)]),                          // P9 cybercrime/law (COMP844) + career & architecture
];

// Safety: append any checkpoint not placed by the phase groups into the final phase.
const placed = new Set(phaseGroups.flat());
for (let g = 0; g < securityGroups.length; g++) for (const k of keysOf(g)) if (!placed.has(k)) { placed.add(k); phaseGroups[8].push(k); }

const TOTAL = [...placed].length;

// Slice each phase's keys evenly across its 8 blocks (1..15 per block, never 0;
// empty phases still get one placeholder-free distribution from neighbours).
const weeks = Array.from({ length: BLOCKS }, (_, i) => ({ n: i + 1, topics: [] }));
for (let p = 0; p < phaseGroups.length; p++) {
  const keys = phaseGroups[p];
  const startBlock = p * PHASE_LEN;            // 0-based
  if (!keys.length) continue;
  // Slice in order (not round-robin), so a phase's sequence and its
  // Beginner -> Advanced progression survive into the weekly blocks.
  for (let i = 0; i < keys.length; i++) {
    const block = startBlock + Math.min(PHASE_LEN - 1, Math.floor((i * PHASE_LEN) / keys.length));
    weeks[block].topics.push(keys[i]);
  }
}
// No block may be empty (the final phase can be light). Pull one checkpoint from
// the nearest earlier over-full block if any block ended empty.
for (let b = 0; b < BLOCKS; b++) {
  if (weeks[b].topics.length) continue;
  for (let d = 1; d < BLOCKS; d++) {
    const src = weeks[b - d];
    if (src && src.topics.length > 1) { weeks[b].topics.push(src.topics.pop()); break; }
  }
}

// Titles: name each block by the groups its checkpoints come from.
const groupName = (g) => securityGroups[g].t;
for (const w of weeks) {
  const gs = [...new Set(w.topics.map(k => Number(k.split('-')[1])))].map(groupName);
  w.title = gs.join(' · ') || 'Review and consolidation';
}

const phases = phaseNames.map((name, i) => ({ name, start: i * 8 + 1, end: i * 8 + 8 }));

const plan = {
  version: 2,
  source: 'Security-first 72-block plan for the AUT Master of Cyber Security and Digital Forensics. Only the cybersecurity and digital forensics track (C) is scheduled; data engineering, GenAI and interview tracks remain optional in the Atlas.',
  weeks,
  phases,
};

// ---------------------------------------------------------------------------
// 3. STUDY RESOURCES
// ---------------------------------------------------------------------------
// Keep the full existing source catalog (link-checked). Add any security
// sources we rely on if missing. Then build group + per-topic resource rows
// for EVERY checkpoint in all four tracks (checks require groups for all
// groups, and a topic override for every scheduled C checkpoint — we give
// topic overrides for all checkpoints so moving anything keeps its links).

const need = {
  cyberFund: ['NIST Cybersecurity Framework 2.0', 'https://www.nist.gov/cyberframework'],
  cyberTop10: ['OWASP Top 10', 'https://owasp.org/www-project-top-ten/'],
  cyberWstg: ['OWASP Web Security Testing Guide', 'https://owasp.org/www-project-web-security-testing-guide/'],
  cyberSecure: ['OWASP Cheat Sheet Series', 'https://cheatsheetseries.owasp.org/'],
  cyberPortswigger: ['PortSwigger Web Security Academy', 'https://portswigger.net/web-security'],
  cyberTryHack: ['TryHackMe learning paths', 'https://tryhackme.com/paths'],
  cyberHTB: ['Hack The Box Academy', 'https://academy.hackthebox.com/'],
  cyberHacksplaining: ['Hacksplaining interactive security lessons', 'https://www.hacksplaining.com/lessons'],
  cyberPractice: ['OverTheWire Wargames', 'https://overthewire.org/wargames/'],
  cyberNetwork: ['Cisco Networking Basics', 'https://skillsforall.com/course/networking-basics'],
  cyberLinux: ['Linux Journey', 'https://linuxjourney.com/'],
  cyberPython: ['Python tutorial', 'https://docs.python.org/3/tutorial/'],
  cyberAttack: ['MITRE ATT&CK Enterprise', 'https://attack.mitre.org/'],
  cyberNist: ['NIST SP 800-61 Rev. 3 Incident Response', 'https://csrc.nist.gov/pubs/sp/800/61/r3/final'],
  cyberBlue: ['Microsoft Learn: security operations', 'https://learn.microsoft.com/training/browse/?terms=security%20operations'],
  cyberSigma: ['Sigma rules specification', 'https://sigmahq.io/docs/'],
  cyberForensics: ['NIST Computer Forensics Tool Testing', 'https://www.nist.gov/itl/ssd/software-quality-group/computer-forensics-tool-testing-program-cftt'],
  cyberDFIR: ['DFIR Diva resources', 'https://dfirdiva.com/'],
  cyberCloud: ['AWS Security Documentation', 'https://docs.aws.amazon.com/security/'],
  cyberWell: ['OWASP SAMM', 'https://owaspsamm.org/'],
  cyberCisa: ['CISA Secure by Design', 'https://www.cisa.gov/securebydesign'],
  cyberCapstone: ['CyberDefenders blue-team labs', 'https://cyberdefenders.org/'],
  cyberResearch: ['AUT research repository', 'https://openrepository.aut.ac.nz/'],
  cyberResearchMethods: ['AUT postgraduate research', 'https://www.aut.ac.nz/research/postgraduate-research'],
  // extra security sources for new checkpoints
  cyberVolatility: ['Volatility Foundation documentation', 'https://volatility3.readthedocs.io/en/latest/'],
  cyberNmap: ['Nmap reference guide', 'https://nmap.org/book/man.html'],
  cyberWireshark: ['Wireshark User Guide', 'https://www.wireshark.org/docs/wsug_html_chunked/'],
  cyberNist53: ['NIST SP 800-53 security controls', 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final'],
  cyberIso: ['ISO/IEC 27001 overview', 'https://www.iso.org/standard/27001'],
  cyberCrypto: ['Cryptography I (Stanford, Dan Boneh)', 'https://www.coursera.org/learn/crypto'],
  cyberCryptopals: ['Cryptopals crypto challenges', 'https://cryptopals.com/'],
  cyberLlmTop10: ['OWASP Top 10 for LLM applications', 'https://genai.owasp.org/llm-top-10/'],
  cyberOauth: ['OAuth 2.0 and OpenID Connect overview', 'https://oauth.net/2/'],
  cyberResume: ['NZ CV and job-search guidance (Careers NZ)', 'https://www.careers.govt.nz/'],
  cyberSeek: ['SEEK New Zealand cyber security roles', 'https://www.seek.co.nz/cyber-security-jobs'],
  // Cybercrime, law & policy (COMP844)
  cyberNzLaw: ['NZ CERT and national cyber security guidance', 'https://www.cert.govt.nz/'],
  cyberPrivacyNz: ['NZ Privacy Act 2020 (Privacy Commissioner)', 'https://www.privacy.org.nz/privacy-act-2020/'],
  cyberCrimesAct: ['NZ Crimes Act computer offences (sections 248-252)', 'https://www.legislation.govt.nz/act/public/1961/0043/latest/DLM329881.html'],
  // Microsoft SIEM stack (NZ market)
  cyberSentinel: ['Microsoft Sentinel documentation', 'https://learn.microsoft.com/en-us/azure/sentinel/'],
  cyberKql: ['Kusto Query Language (KQL) tutorial', 'https://learn.microsoft.com/en-us/kusto/query/tutorials/learn-common-operators'],
  cyberDefender: ['Microsoft Defender XDR documentation', 'https://learn.microsoft.com/en-us/defender-xdr/'],
  cyberSc200: ['Microsoft SC-200 Security Operations Analyst', 'https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst/'],
  // AI security
  cyberLlmTop10b: ['OWASP Top 10 for LLM applications', 'https://genai.owasp.org/llm-top-10/'],
  cyberAiLab: ['TryHackMe AI security content', 'https://tryhackme.com/paths'],
  cyberAiRmf: ['NIST AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework'],
  cyberHfLlm: ['Hugging Face LLM course', 'https://huggingface.co/learn/llm-course'],
  // Malware analysis & RE
  cyberMalware: ['Practical Malware Analysis lab guidance (MalwareUnicorn RE101)', 'https://malwareunicorn.org/workshops/re101.html'],
  cyberGhidra: ['Ghidra documentation and courses', 'https://ghidra-sre.org/'],
  cyberx64dbg: ['x64dbg documentation', 'https://help.x64dbg.com/en/latest/'],
  cyberYara: ['YARA documentation', 'https://yara.readthedocs.io/en/stable/'],
  // Cloud security depth (INFS803)
  cyberProwler: ['Prowler cloud security scanner', 'https://docs.prowler.com/'],
  cyberKubeSec: ['Kubernetes security documentation', 'https://kubernetes.io/docs/concepts/security/'],
  // IoT security (COMP816)
  cyberIotTop10: ['OWASP IoT Top 10', 'https://owasp.org/www-project-internet-of-things-top-10/'],
  // Scripting (NZ job ads name Python, Bash and PowerShell explicitly)
  cyberBash: ['Bash scripting guide (Linux Documentation Project)', 'https://tldp.org/LDP/Bash-Beginners-Guide/html/'],
  cyberPowershell: ['PowerShell learning documentation', 'https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/00-introduction'],
  cyberPyPractice: ['Exercism Python track', 'https://exercism.org/tracks/python'],
  // Compliance frameworks named in NZ ads
  cyberCis: ['CIS Critical Security Controls and Benchmarks', 'https://www.cisecurity.org/controls'],
  cyberNzism: ['NZ Information Security Manual (NZISM)', 'https://nzism.gcsb.govt.nz/'],
  cyberAdLearn: ['Microsoft Learn: Active Directory Domain Services overview', 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview'],
  cyberEntra: ['Microsoft Entra ID documentation', 'https://learn.microsoft.com/en-us/entra/identity/'],
  cyberMdi: ['Microsoft Defender for Identity documentation', 'https://learn.microsoft.com/en-us/defender-for-identity/'],
  cyberAsim: ['Microsoft Sentinel ASIM normalization', 'https://learn.microsoft.com/en-us/azure/sentinel/normalization'],
  cyberSecPlus: ['CompTIA Security+ (exam objectives)', 'https://www.comptia.org/en-us/certifications/security/'],
  cyberIsc2cc: ['ISC2 Certified in Cybersecurity (CC)', 'https://www.isc2.org/certifications/cc'],
  cyberEjpt: ['INE eJPT certification', 'https://ine.com/security/certifications/ejpt-certification'],
  cyberTcm: ['TCM Security certifications (PJPT, PNPT)', 'https://certifications.tcm-sec.com/'],
  cyberOscp: ['OffSec OSCP', 'https://www.offsec.com/courses/pen-200/'],
  cyberBtl1: ['Security Blue Team BTL1', 'https://www.securityblue.team/certifications/blue-team-level-1'],
  cyberSot: ['Summer of Tech (NZ internships)', 'https://www.summeroftech.co.nz/'],
  cyberAzureSec: ['Azure security documentation', 'https://learn.microsoft.com/en-us/azure/security/'],
  cyberAzureLearn: ['Microsoft Learn: Azure training', 'https://learn.microsoft.com/en-us/training/azure/'],
  cyberDefenderCloud: ['Microsoft Defender for Cloud documentation', 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/'],
  cyberSc900: ['SC-900 study guide (Microsoft Learn)', 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900'],
  cyberSc500: ['SC-500 study guide (Microsoft Learn)', 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500'],
  cyberSc200Guide: ['SC-200 study guide (Microsoft Learn)', 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200'],
  cyberSc200Practice: ['SC-200 practice assessment', 'https://aka.ms/SC200-LearnPA'],
  cyberIsc2Outline: ['ISC2 CC exam outline', 'https://www.isc2.org/certifications/cc/cc-certification-exam-outline'],
  cyberAutCareers: ['AUT Employability and Careers', 'https://www.aut.ac.nz/student-life/opportunities-and-careers'],
};
for (const [k, v] of Object.entries(need)) if (!src[k]) src[k] = v;

// Per-group default resources for the security track, as [learn, practice, action, [extraRead]].
const act = {
  concept: 'Write a concise lab note: concept, threat, control, verification evidence and one remaining question.',
  demo: 'Demonstrate the concept in an isolated lab; save sanitized commands, expected output and a short explanation.',
  build: 'Build a small reproducible artifact, test the security property, and document assumptions and limitations.',
  review: 'Write a short design or review note: threat, evidence, impact, recommended fix and retest result.',
};
const secGroupRes = {
  [G.foundations]: ['cyberFund', 'cyberTryHack', act.concept, ['cyberFund']],
  [G.networking]: ['cyberNetwork', 'cyberWireshark', act.demo, ['cyberNmap']],
  [G.os]: ['cyberLinux', 'cyberPractice', act.build, ['cyberLinux']],
  [G.scripting]: ['cyberPython', 'cyberPractice', act.build, ['cyberBash', 'cyberPowershell']],
  [G.secureCoding]: ['cyberSecure', 'cyberHacksplaining', act.review, ['cyberTop10']],
  [G.crypto]: ['cyberCrypto', 'cyberCryptopals', act.build, ['cyberSecure']],
  [G.web]: ['cyberWstg', 'cyberPortswigger', act.demo, ['cyberTop10']],
  [G.pentest]: ['cyberWstg', 'cyberHTB', act.demo, ['cyberTryHack']],
  [G.soc]: ['cyberNist', 'cyberCapstone', act.build, ['cyberAttack', 'cyberSigma']],
  [G.forensics]: ['cyberForensics', 'cyberCapstone', act.build, ['cyberDFIR', 'cyberVolatility']],
  [G.cloudCore]: ['cyberAzureSec', 'cyberAzureLearn', act.review, ['cyberDefenderCloud', 'cyberCloud']],
  [G.appsec]: ['cyberWell', 'cyberSecure', act.review, ['cyberCisa']],
  [G.research]: ['cyberResearchMethods', 'cyberResearch', act.build, ['cyberResearch']],
  [G.career]: ['cyberNist53', 'cyberSeek', act.review, ['cyberIso', 'cyberCis', 'cyberNzism', 'cyberResume']],
  [G.cybercrime]: ['cyberNzLaw', 'cyberFund', act.review, ['cyberPrivacyNz', 'cyberCrimesAct']],
  [G.siem]: ['cyberSentinel', 'cyberKql', act.build, ['cyberSc200', 'cyberSigma']],
  [G.aisec]: ['cyberLlmTop10b', 'cyberAiLab', act.build, ['cyberAiRmf', 'cyberHfLlm']],
  [G.malware]: ['cyberMalware', 'cyberGhidra', act.build, ['cyberx64dbg', 'cyberYara']],
  [G.cloudDepth]: ['cyberAzureSec', 'cyberProwler', act.review, ['cyberDefenderCloud', 'cyberKubeSec', 'cyberCloud']],
  [G.secplus]: ['cyberSecPlus', 'cyberTryHack', act.concept, ['cyberSecPlus']],
  [G.ejpt]: ['cyberEjpt', 'cyberHTB', act.demo, ['cyberTcm']],
  [G.sc200]: ['cyberSc200Guide', 'cyberSc200Practice', act.build, ['cyberSentinel', 'cyberDefender', 'cyberKql']],
  [G.btl1]: ['cyberBtl1', 'cyberCapstone', act.build, ['cyberVolatility']],
  [G.iot]: ['cyberIotTop10', 'cyberTryHack', act.demo, ['cyberIotTop10']],
  [G.ad]: ['cyberAdLearn', 'cyberHTB', act.demo, ['cyberEntra', 'cyberMdi']],
  [G.jobsearch]: ['cyberResume', 'cyberSot', act.review, ['cyberSeek', 'cyberAutCareers']],
};

// Per-checkpoint overrides for the security track where a more precise link helps.
// Per-checkpoint overrides, targeted by a text match within a named group so they
// survive reordering. Each entry: [groupNeedle, textNeedle, row].
const secTopicOverrides = [
  ['Cloud and infrastructure', 'SC-900 or AZ-900', ['cyberSc900', 'cyberAzureLearn', act.concept, ['cyberSc900']]],
  ['Cloud security depth', 'SC-500', ['cyberSc500', 'cyberAzureSec', act.concept, ['cyberSc500']]],
  ['Penetration testing', 'PNPT then OSCP', ['cyberTcm', 'cyberOscp', act.concept, ['cyberOscp']]],
  ['SIEM and detection', 'Security data engineering', ['cyberAsim', 'cyberKql', act.build, ['cyberSentinel']]],
  ['NZ job search', 'Summer of Tech', ['cyberSot', 'cyberAutCareers', act.review, ['cyberSot']]],
  ['Networking', 'Packet capture with Wireshark', ['cyberWireshark', 'cyberWireshark', act.demo, ['cyberNetwork']]],
  ['Networking', 'Network scanning with nmap', ['cyberNmap', 'cyberHTB', act.demo, ['cyberNmap']]],
  ['Scripting', 'Bash basics', ['cyberBash', 'cyberPractice', act.build, ['cyberBash']]],
  ['Scripting', 'Bash scripting', ['cyberBash', 'cyberPractice', act.build, ['cyberBash']]],
  ['Scripting', 'Python from scratch', ['cyberPython', 'cyberPyPractice', act.build, ['cyberPython']]],
  ['Scripting', 'Python files, strings', ['cyberPython', 'cyberPyPractice', act.build, ['cyberPython']]],
  ['Scripting', 'PowerShell basics', ['cyberPowershell', 'cyberPractice', act.build, ['cyberPowershell']]],
  ['Scripting', 'PowerShell for investigation', ['cyberPowershell', 'cyberCapstone', act.build, ['cyberPowershell']]],
  ['Cryptography', 'Number theory', ['cyberCrypto', 'cyberCrypto', act.concept, ['cyberCrypto']]],
  ['Web application', 'OWASP Top 10 overview', ['cyberTop10', 'cyberPortswigger', act.demo, ['cyberWstg']]],
  ['Web application', 'SQL injection', ['cyberWstg', 'cyberPortswigger', act.demo, ['cyberPortswigger', 'cyberHacksplaining']]],
  ['Web application', 'Cross-site scripting', ['cyberWstg', 'cyberPortswigger', act.demo, ['cyberPortswigger', 'cyberHacksplaining']]],
  ['SOC and incident', 'MITRE ATT&CK', ['cyberAttack', 'cyberCapstone', act.build, ['cyberAttack']]],
  ['SOC and incident', 'Sigma detection', ['cyberSigma', 'cyberCapstone', act.build, ['cyberSigma']]],
  ['SIEM and detection', 'KQL fundamentals', ['cyberKql', 'cyberKql', act.build, ['cyberSentinel']]],
  ['SIEM and detection', 'KQL for hunting', ['cyberKql', 'cyberKql', act.build, ['cyberSentinel']]],
  ['Digital forensics', 'Memory forensics', ['cyberVolatility', 'cyberCapstone', act.build, ['cyberVolatility']]],
  ['Malware analysis', 'Disassembly and decompilation', ['cyberGhidra', 'cyberGhidra', act.build, ['cyberGhidra']]],
  ['Malware analysis', 'Writing YARA rules', ['cyberYara', 'cyberCapstone', act.build, ['cyberYara']]],
  ['AI security', 'prompt injection', ['cyberLlmTop10b', 'cyberAiLab', act.demo, ['cyberLlmTop10b']]],
  ['Research methods', 'researchable question', ['cyberResearchMethods', 'cyberResearch', act.concept, ['cyberResearchMethods']]],
  ['architecture, engineering and career', 'target role', ['cyberSeek', 'cyberSeek', act.review, ['cyberResume']]],
  ['architecture, engineering and career', 'resume', ['cyberResume', 'cyberSeek', act.review, ['cyberResume']]],
  ['architecture, engineering and career', 'Interview preparation', ['cyberFund', 'cyberTryHack', act.review, ['cyberPortswigger']]],
];
const secTopicRes = {};
for (const [groupNeedle, textNeedle, row] of secTopicOverrides) {
  const g = gi(groupNeedle);
  const idx = securityGroups[g].i.findIndex((it) => it.replace(/^\[(B|I|A)\]/, '').replace(/^\*/, '').toLowerCase().includes(textNeedle.toLowerCase()));
  if (idx >= 0) secTopicRes[`C-${g}-${idx}`] = row;
  else console.warn(`override not matched: ${groupNeedle} / ${textNeedle}`);
}

// Build resources.groups: one row per group across ALL tracks (check requires this).
const groups = {};
for (const t of tracks) {
  for (let gi = 0; gi < t.groups.length; gi++) {
    const key = `${t.id}-${gi}`;
    if (t.id === 'C') { groups[key] = secGroupRes[gi]; continue; }
    // Optional tracks: reuse the old group row if it still exists, else a sane default.
    groups[key] = oldRes.groups[key] ?? defaultOptionalRow(t.id);
  }
}
function defaultOptionalRow(id) {
  if (id === 'A') return ['deLearn', 'dePractice', 'Optional brush-up: work one small example and note how it applies to securing data systems.', ['github']];
  if (id === 'B') return ['hfLlm', 'hfPractice', 'Optional brush-up: try one example and note an AI-security implication (prompt injection, data leakage).', ['cyberLlmTop10']];
  if (id === 'E') return ['cyberIsc2Outline', 'cyberIsc2cc', 'Optional: study this domain from the official outline and score at least 80% on practice questions for it.', ['cyberIsc2cc']];
  return ['dsa', 'dsaPractice', 'Optional: solve one problem and record the pattern and complexity.', ['dsa']];
}

// Build resources.topics: an override for EVERY checkpoint in every track.
// Security checkpoints get the tailored action text; optional-track checkpoints
// inherit their group row so links stay relevant if ever scheduled.
const topics = {};
const actionFor = (trackId, raw, group = '') => {
  const text = raw.replace(/^\[(B|I|A)\]/, '').replace(/^\*/, '');
  if (trackId === 'C' && group.startsWith('Exam prep')) return `For “${text}”, study the official objectives for this part, score at least 80% on practice questions for it, and list weak sub-objectives to revisit.`;
  if (trackId === 'C') return `For “${text}”, complete a safe hands-on exercise, save reproducible evidence, explain the risk and mitigation, then record one limitation.`;
  if (trackId === 'A') return `Optional brush-up on “${text}”: work one small example and note where it matters for securing data systems.`;
  if (trackId === 'B') return `Optional brush-up on “${text}”: try one example and note an AI-security implication.`;
  if (trackId === 'E') return `For “${text}”, study the official objectives, score at least 80% on practice questions for it, and list weak sub-objectives to revisit.`;
  return `Optional practice on “${text}”: solve or summarize one example and record the key idea.`;
};
for (const t of tracks) {
  for (let gi = 0; gi < t.groups.length; gi++) {
    const groupRow = groups[`${t.id}-${gi}`];
    for (let ii = 0; ii < t.groups[gi].i.length; ii++) {
      const key = `${t.id}-${gi}-${ii}`;
      if (t.id === 'C') {
        const override = secTopicRes[key];
        const [learn, practice, , extra] = override ?? groupRow;
        topics[key] = [learn, practice, actionFor('C', t.groups[gi].i[ii], t.groups[gi].t), extra ?? [learn]];
      } else {
        const [learn, practice, , extra] = groupRow;
        topics[key] = [learn, practice, actionFor(t.id, t.groups[gi].i[ii]), extra ?? [learn]];
      }
    }
  }
}

const resources = { sources: src, groups, topics };

// ---------------------------------------------------------------------------
// 4. SKILLS (rebuild — the old file was corrupted to single characters)
// ---------------------------------------------------------------------------
const skills = [
  { name: 'Foundations and systems', description: 'The baseline every security role relies on.', skills: [
    { id: 'networking', name: 'Networking & protocols', week: 'See weekly plan', evidence: 'A Wireshark capture read and explained; subnetting and TLS notes.', learn: src.cyberNetwork[1], practice: src.cyberWireshark[1] },
    { id: 'linux', name: 'Linux & Windows internals', week: 'See weekly plan', evidence: 'Lab notes on permissions, services, logs and event analysis.', learn: src.cyberLinux[1], practice: src.cyberPractice[1] },
    { id: 'python-sec', name: 'Scripting & automation', week: 'See weekly plan', evidence: 'A small Python tool that parses logs or calls an API.', learn: src.cyberPython[1], practice: src.cyberPractice[1] },
    { id: 'crypto', name: 'Cryptography & identity', week: 'See weekly plan', evidence: 'A crypto challenge solved; a short implementation review.', learn: src.cyberCrypto[1], practice: src.cyberCryptopals[1] },
    { id: 'threat-model', name: 'Threat modelling', week: 'See weekly plan', evidence: 'A STRIDE model with trust boundaries and prioritised risks.', learn: src.cyberFund[1], practice: src.cyberTryHack[1] },
  ] },
  { name: 'Offensive & defensive practice', description: 'Investigate, test, detect and communicate safely.', skills: [
    { id: 'pentest', name: 'Web & application testing', week: 'See weekly plan', evidence: 'PortSwigger labs completed; a concise finding with remediation.', learn: src.cyberWstg[1], practice: src.cyberPortswigger[1] },
    { id: 'soc', name: 'SOC & detection engineering', week: 'See weekly plan', evidence: 'A tested detection mapped to ATT&CK with triage notes.', learn: src.cyberNist[1], practice: src.cyberCapstone[1] },
    { id: 'dfir', name: 'Digital forensics & IR', week: 'See weekly plan', evidence: 'A casefile: acquisition, hashes, timeline and defensible findings.', learn: src.cyberForensics[1], practice: src.cyberCapstone[1] },
    { id: 'cloudsec', name: 'Cloud security', week: 'See weekly plan', evidence: 'IAM, network and logging controls applied and reviewed in a sandbox.', learn: src.cyberCloud[1], practice: src.cyberWell[1] },
    { id: 'appsec', name: 'AppSec & DevSecOps', week: 'See weekly plan', evidence: 'A pipeline with SAST/SCA/secret scanning and triaged findings.', learn: src.cyberWell[1], practice: src.cyberSecure[1] },
    { id: 'siem', name: 'SIEM & detection (Sentinel, KQL)', week: 'See weekly plan', evidence: 'KQL detections in Sentinel with a triaged incident; progress toward SC-200.', learn: src.cyberSentinel[1], practice: src.cyberKql[1] },
    { id: 'ad-identity', name: 'Active Directory & Microsoft identity', week: 'See weekly plan', evidence: 'A lab domain you attacked and then hardened, with detections for the attacks.', learn: src.cyberAdLearn[1], practice: src.cyberHTB[1] },
    { id: 'malware', name: 'Malware analysis & RE', week: 'See weekly plan', evidence: 'A casefile with static/dynamic analysis and YARA rules.', learn: src.cyberMalware[1], practice: src.cyberGhidra[1] },
  ] },
  { name: 'Engineering, research & career', description: 'Turn security knowledge into shipped controls, defensible research and job offers.', skills: [
    { id: 'architecture', name: 'Security architecture', week: 'See weekly plan', evidence: 'A design note with zero-trust decisions and control mapping.', learn: src.cyberNist53[1], practice: src.cyberCisa[1] },
    { id: 'aisec', name: 'AI security', week: 'See weekly plan', evidence: 'An AI app red-team report mapped to the OWASP LLM Top 10 and NIST AI RMF.', learn: src.cyberLlmTop10b[1], practice: src.cyberAiLab[1] },
    { id: 'cloudsec-depth', name: 'Cloud security engineering', week: 'See weekly plan', evidence: 'A hardened cloud baseline with IAM, logging and a CSPM scan.', learn: src.cyberCloud[1], practice: src.cyberProwler[1] },
    { id: 'cybercrime-law', name: 'Cybercrime, law & policy', week: 'See weekly plan', evidence: 'A case-study report citing NZ law and a risk-mitigation plan.', learn: src.cyberNzLaw[1], practice: src.cyberPrivacyNz[1] },
    { id: 'research', name: 'Research & dissertation', week: 'See weekly plan', evidence: 'A proposal: question, method, ethics, baseline and validity threats.', learn: src.cyberResearchMethods[1], practice: src.cyberResearch[1] },
    { id: 'career', name: 'Career readiness', week: 'See weekly plan', evidence: 'A security resume, STAR stories and a 90-day job-search plan.', learn: src.cyberResume[1], practice: src.cyberSeek[1] },
  ] },
];

// ---------------------------------------------------------------------------
// 5. PRACTICE TRACKS (drop R; keep security-relevant practice)
// ---------------------------------------------------------------------------
const practice = [
  { key: 'labs', name: 'Hands-on security labs', when: 'Use with scheduled weekly checkpoints', cadence: '2–4 exercises per week · 45–90 minutes',
    goal: 'Practise skills on deliberately vulnerable, isolated or authorized targets. Never test systems you do not own or have written permission to test.',
    resources: [
      ['START HERE', 'TryHackMe paths', src.cyberTryHack[1], 'Guided rooms from beginner to role-based paths.'],
      ['WEB SECURITY', 'PortSwigger Web Security Academy', src.cyberPortswigger[1], 'Free, high-quality labs for every web vulnerability class.'],
      ['GO DEEPER', 'Hack The Box Academy', src.cyberHTB[1], 'Structured modules and machines once fundamentals are solid.'],
      ['FUNDAMENTALS', 'OverTheWire wargames', src.cyberPractice[1], 'Linux and networking skills through a terminal.'],
    ] },
  { key: 'bluelabs', name: 'Blue-team & forensics labs', when: 'Use with SOC, IR and forensics weeks', cadence: '1–2 investigations per week · 60–120 minutes',
    goal: 'Build detection, triage and forensic evidence skills on realistic, legal datasets.',
    resources: [
      ['START HERE', 'CyberDefenders', src.cyberCapstone[1], 'Blue-team and DFIR challenges with sample data.'],
      ['DETECTIONS', 'Sigma rules', src.cyberSigma[1], 'Write and test portable detection rules.'],
      ['MEMORY', 'Volatility', src.cyberVolatility[1], 'Analyse memory images for processes and injection.'],
      ['MAPPING', 'MITRE ATT&CK', src.cyberAttack[1], 'Map detections and techniques to adversary behaviour.'],
    ] },
  { key: 'crypto', name: 'Cryptography', when: 'Use with the cryptography weeks (COMP830)', cadence: '1–2 challenges per week · 45–60 minutes',
    goal: 'Understand primitives by using and breaking them in a controlled setting.',
    resources: [
      ['LEARN', 'Cryptography I (Stanford)', src.cyberCrypto[1], 'Dan Boneh\u2019s course on the maths and primitives.'],
      ['PRACTISE', 'Cryptopals', src.cyberCryptopals[1], 'Hands-on challenges that reveal real crypto failures.'],
    ] },
  { key: 'dsa', name: 'DSA (interview prep)', when: 'Optional, for technical screens', cadence: '2–4 problems per week · ~25 minutes each',
    goal: 'Keep algorithm skills warm for engineering interviews. Tracked separately in the DSA tracker.',
    resources: 'DSA_TRACKERS' },
];

// ---------------------------------------------------------------------------
// 6. WRITE FILES
// ---------------------------------------------------------------------------
await write('roadmap.json', { tracks });
await write('curriculum-plan.json', plan);
await write('study-resources.json', resources);
await write('skills.json', skills);
await write('practice-tracks.json', practice);
await write('titles.json', weeks.map(w => w.title));
await write('phases-names.json', phaseNames);

console.log(`Rebuilt curriculum: ${TOTAL} security checkpoints across ${BLOCKS} blocks.`);
console.log(`Tracks: ${tracks.map(t => `${t.id}(${t.groups.reduce((a, g) => a + g.i.length, 0)})`).join(' ')}`);
const perBlock = weeks.map(w => w.topics.length);
console.log(`Per-block range: ${Math.min(...perBlock)}–${Math.max(...perBlock)}`);
