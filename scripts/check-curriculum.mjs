#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));
const [plan, roadmap, degree, resources] = await Promise.all(['curriculum-plan.json','roadmap.json','degree.json','study-resources.json'].map(read));
const errors=[]; const check=(yes,message)=>{if(!yes) errors.push(message)};
const expected=roadmap.tracks.flatMap(t=>t.groups.flatMap((g,gi)=>g.i.map((_,ii)=>`${t.id}-${gi}-${ii}`)));
const actual=plan.weeks.flatMap(w=>w.topics);
check(plan.weeks.length===72,'expected 72 scheduled blocks');
check(plan.weeks.every((w,i)=>w.n===i+1&&w.topics.length>0&&w.topics.length<=15),'week numbering, coverage or workload invalid');
check(actual.length===expected.length&&new Set(actual).size===actual.length&&expected.every(k=>actual.includes(k)),'every Atlas checkpoint must be scheduled exactly once');
const groupKeys=roadmap.tracks.flatMap(t=>t.groups.map((_,gi)=>`${t.id}-${gi}`));
check(groupKeys.length===Object.keys(resources.groups).length&&groupKeys.every(k=>resources.groups[k]),'every topic group needs study resources');
check(Object.keys(resources.topics).length===expected.length&&expected.every(k=>resources.topics[k]),'every checkpoint needs a topic-specific resource mapping');
for(const [id,[title,url]] of Object.entries(resources.sources)) check(typeof title==='string'&&title.length>2&&/^https:\/\/[^\s]+$/.test(url),`invalid resource link ${id}`);
for(const [key,row] of Object.entries({...resources.groups,...resources.topics})) {
 check(Array.isArray(row)&&(row.length===3||row.length===4)&&resources.sources[row[0]]&&resources.sources[row[1]]&&typeof row[2]==='string'&&row[2].length>=24&&(row.length===3||(Array.isArray(row[3])&&row[3].length>0&&row[3].every(id=>resources.sources[id]))),`${key}: missing reading, practice or concrete action`);
 if(resources.topics[key]) check(expected.includes(key),`${key}: resource override has no Atlas checkpoint`);
}
check(plan.phases.length===9&&plan.phases.every((p,i)=>p.start===i*8+1&&p.end===(i+1)*8),'phase ranges must cover blocks 1-72');
const cyber=roadmap.tracks.find(t=>t.id==='C');
check(cyber?.name==='Cybersecurity and digital forensics','track C must be the cybersecurity and digital forensics roadmap');
check(cyber?.groups.length===14,'cybersecurity roadmap should retain the existing 14-group Atlas layout');
check(degree.catalogue.includes('master-of-cyber-security-and-digital-forensics'),'degree must link to the AUT programme page');
check(degree.courseGroups.some(g=>g.codes.includes('COMP844')&&g.codes.includes('COMP832')&&g.codes.includes('ENGE817')),'AUT compulsory courses missing');
check(degree.courseGroups.some(g=>g.codes==='COMP997 Dissertation')&&degree.courseGroups.some(g=>g.codes==='COMP998 Thesis'),'AUT research pathways missing');
const weekOf=Object.fromEntries(plan.weeks.flatMap(w=>w.topics.map(k=>[k,w.n])));
for(let g=0;g<cyber.groups.length;g++) for(let i=0;i<cyber.groups[g].i.length;i++) check(!!weekOf[`C-${g}-${i}`],`unscheduled security checkpoint C-${g}-${i}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`✓ curriculum OK: ${actual.length} unique checkpoints, ${plan.weeks.length} blocks, AUT programme map, cybersecurity roadmap and topic-level resources`);
