#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));
const [plan, roadmap, degree, resources] = await Promise.all(['curriculum-plan.json','roadmap.json','degree.json','study-resources.json'].map(read));
const errors=[];
const check=(yes,message)=>{if(!yes) errors.push(message)};
const expected=roadmap.tracks.flatMap(t=>t.groups.flatMap((g,gi)=>g.i.map((_,ii)=>`${t.id}-${gi}-${ii}`)));
const actual=plan.weeks.flatMap(w=>w.topics);
check(plan.weeks.length===72,'expected 72 weeks');
check(plan.weeks.every((w,i)=>w.n===i+1 && w.topics.length>0 && w.topics.length<=15), 'week numbers, nonempty coverage, or workload invalid');
check(actual.length===expected.length && new Set(actual).size===actual.length && expected.every(k=>actual.includes(k)),'every Atlas topic must be scheduled exactly once');
const groupKeys=roadmap.tracks.flatMap(t=>t.groups.map((_,gi)=>`${t.id}-${gi}`));
check(groupKeys.length===Object.keys(resources.groups).length && groupKeys.every(k=>resources.groups[k]),'every topic group needs study resources');
check(Object.keys(resources.topics).length===expected.length && expected.every(k=>resources.topics[k]),'every Atlas checkpoint needs a topic-specific resource mapping');
for(const [id,[title,url]] of Object.entries(resources.sources)) check(typeof title==='string'&&title.length>2&&/^https:\/\/[^\s]+$/.test(url),`invalid resource link ${id}`);
for(const [key,row] of Object.entries({...resources.groups,...resources.topics})) {
  check(Array.isArray(row)&&(row.length===3||row.length===4)&&resources.sources[row[0]]&&resources.sources[row[1]]&&typeof row[2]==='string'&&row[2].length>=24&&(row.length===3||(Array.isArray(row[3])&&row[3].length>0&&row[3].every(id=>resources.sources[id]))),`${key}: missing read, practice or specific action`);
  if(resources.topics[key]) check(expected.includes(key),`${key}: override has no Atlas topic`);
}

check(plan.phases.length===9 && plan.phases.every((p,i)=>p.start===i*8+1&&p.end===(i+1)*8),'phase ranges must cover 1-72');
check(degree.bridgeLessons.stats.length===12&&degree.bridgeLessons.cs.length===12,'both selected degree bridges need 12 lessons');
for (const bridge of ['stats','cs']) {
  const weeks=degree.bridgeWeeks[bridge];
  check(weeks.length===degree.bridgeLessons[bridge].length && weeks.every((w,i)=>Number.isInteger(w)&&w>=1&&w<=72&&(i===0||w>weeks[i-1])),`${bridge}: bridge lessons need unique ascending weeks`);
}
check(degree.bridgeWeeks.stats[0]>=2 && degree.bridgeWeeks.stats[1]>=13,'statistics bridge must follow R setup and probability foundations');
check(degree.bridgeWeeks.cs[0]>=4 && degree.bridgeWeeks.cs[5]>=24,'computer science bridge must follow Big-O and DSA foundations');
const weekOf=Object.fromEntries(plan.weeks.flatMap(w=>w.topics.map(k=>[k,w.n])));
for(const [name,before,after] of [
 ['Python before Spark','A-22-0','A-3-0'],
 ['SQL basics before windows','A-1-0','A-0-0'],
 ['Data lifecycle before pipelines','A-11-0','A-6-4'],
 ['R setup before tidyverse','F-0-1','F-4-0'],
 ['Probability before inference','C-2-0','C-3-0'],
 ['Classical ML before deep learning','C-4-0','C-5-0'],
 ['LLM fundamentals before RAG','B-0-0','B-2-0'],
 ['RAG before agent retrieval','B-2-0','B-3-2'],
 ['Backend before agents','A-22-11','B-3-0'],
 ['AWS essentials before Lambda','A-24-0','A-25-4'],
 ['pandas basics before groupby','C-11-1','A-2-5'],
 ['SQL windows before stored procedures','A-0-0','A-1-3'],
 ['Spark foundations before PySpark drills','A-3-0','D-1-1'],
 ['relational concepts before DDL','A-21-0','A-1-0'],
 ['SQL syntax before DDL','A-21-1','A-1-0'],
 ['basic joins before subqueries','A-21-3','A-1-2'],
 ['SQL plans before optimization','A-0-6','A-1-7'],
 ['Python OOP before dataclasses','A-22-6','A-2-3'],
 ['model mechanics before LLMs','B-10-14','B-0-0'],
 ['RAG basics before RAG implementation','B-10-15','B-2-0'],
 ['Big-O before data structures','D-0-8','D-0-0'],
 ['covariance before PCA','C-2-1','C-0-3'],
 ['normalization before dimensional modeling','A-5-4','A-5-1'],
 ['batch and streaming before Spark streaming','A-6-0','A-3-10'],
 ['ingestion patterns before orchestration','A-6-8','A-6-4'],
 ['agent basics before agentic RAG','B-3-0','B-2-7'],
 ['Python syntax before collection complexity','A-22-0','A-2-0'],
 ['Big-O before collection complexity','D-0-8','A-2-0'],
]) check(weekOf[before]<weekOf[after],`${name}: week ${weekOf[before]} before week ${weekOf[after]}`);
const viewsText=await readFile(new URL('../src/data/roadmaps.ts',import.meta.url),'utf8');
const viewLines=viewsText.split('\n').filter(line=>/\{ id: '[^']+'.*groups:/.test(line));
const requiredViewGroups={
  'data-engineer':['A-11','A-21','A-22','A-5','A-6'],
  sql:['A-21','A-1','A-0'],
  python:['A-22','A-2','D-0'],
  'python-data-analysis':['C-10','C-11','C-12','C-4'],
  'r-programming':['F-0','F-4','F-6'],
  'system-design':['A-10','A-23'],
  aws:['A-24','A-25'],
  'machine-learning':['C-0','C-2','C-4','C-5'],
  'ai-data-scientist':['C-3','C-8','C-13','D-0'],
  'ai-engineer':['B-0','B-1','B-2','B-11'],
  'prompt-engineering':['B-1','B-9'],
  'ai-agents':['A-22','B-10','B-2','B-3','B-5'],
  'gfg-data-scientist':['C-7','C-8','C-9','C-11'],
};

check(viewLines.length===13,'expected 13 source roadmap views');
for(const line of viewLines){
  const id=line.match(/\{ id: '([^']+)'/)?.[1];
  const pairs=[...line.matchAll(/\['([A-F])', (\d+)\]/g)].map(x=>[x[1],Number(x[2])]);
  check(pairs.length>0,`${id}: no mapped topic groups`);
  const pairKeys=new Set(pairs.map(([track,group])=>`${track}-${group}`));
  for (const required of requiredViewGroups[id]??[]) check(pairKeys.has(required),`${id}: missing PDF source section ${required}`);
  for(const [track,group] of pairs){
    const source=roadmap.tracks.find(t=>t.id===track)?.groups[group];
    check(!!source,`${id}: invalid group ${track}-${group}`);
    for(let item=0;item<(source?.i.length??0);item++) check(!!weekOf[`${track}-${group}-${item}`],`${id}: unscheduled topic ${track}-${group}-${item}`);
  }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`✓ curriculum OK: ${actual.length} unique topics, ${plan.weeks.length} weeks, 9 phases, 13 roadmap views, ${Object.keys(resources.topics).length} checkpoint resources, ${groupKeys.length} resource groups, 2 bridge paths`);
