#!/usr/bin/env node
/** Validate non-curriculum bundled data; check-curriculum validates every weekly topic. */
import { readFile } from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(new URL(`../src/data/${p}`,import.meta.url),'utf8'));
const [a2z,nc,rm]=await Promise.all(['dsa/a2z.json','dsa/neetcode.json','roadmap.json'].map(read));
const errors=[];const check=(yes,msg)=>{if(!yes)errors.push(msg)};
const isUrl=u=>{try{return /^https?:$/.test(new URL(u).protocol)}catch{return false}};
const items=a2z.steps.flatMap(s=>s.sections.flatMap(x=>x.items));
check(new Set(items.map(i=>i.id)).size===items.length,'A2Z ids are not unique');
for(const it of items){for(const k of ['video','tuf','leetcode','gfg'])if(it[k]!=null)check(isUrl(it[k]),`${it.id}.${k} is not a URL`);for(const r of it.reads)check(isUrl(r.url),`${it.id} read link invalid`)}
check(new Set(nc.problems.map(p=>p.slug)).size===nc.problems.length,'NeetCode slugs are not unique');
check(nc.meta.counts.nc150===150,'NeetCode 150 count is wrong');
check(nc.problems.filter(p=>p.blind75).every(p=>p.nc150),'Blind 75 is not a subset of NeetCode 150');
check(rm.tracks.length===6,'expected six Atlas tracks');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`✓ data OK: ${items.length} A2Z items, ${nc.problems.length} NeetCode problems, ${rm.tracks.length} Atlas tracks`);
