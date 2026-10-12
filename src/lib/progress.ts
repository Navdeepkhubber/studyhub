import { roadmap } from '../data';
import type { Week } from '../data/types';
import { bridgeForWeek, curriculumTopicsForWeek } from './curriculum-progress';
import { isCurriculumTopicDone } from './curriculum-progress';
import { dayOffset, todayKey } from './dates';
import { isActive, type AppState } from '../state/model';
import { weekWorkload } from './study-workload';
import { portfolioMilestonesForWeek } from './week-activities';
export const CORE_WEEKS = roadmap.weeks.length;
export const MAX_WEEK = roadmap.weeks.length;
export interface Task { id: string; tag: string; text: string; topicKey?: string; portfolioKey?: string }
export const weekTasks = (w: Week, s?: AppState): Task[] => {
  const bridge = s ? bridgeForWeek(s,w.n) : null;
  return [
    ...curriculumTopicsForWeek(w.n).map(t=>({id:t.taskId,tag:t.trackId,text:t.text,topicKey:t.key})),
    ...(bridge?[{id:bridge.id,tag:'BRIDGE',text:bridge.text}]:[]),
    ...portfolioMilestonesForWeek(w.n).map(m=>({id:`w${w.n}-portfolio-${m.key}`,tag:'PORTFOLIO',text:`${m.project.name}: ${m.criterion}`,portfolioKey:m.key})),
    {id:`w${w.n}-output`,tag:'DELIVERABLE',text:w.o},
  ];
};
export const isWeekTaskDone = (s: AppState, t: Task): boolean => t.topicKey ? isCurriculumTopicDone(s,t.topicKey) : t.portfolioKey ? !!s.portfolio[t.portfolioKey] : t.tag === 'DELIVERABLE' ? !!s.done[t.id] && weekOutputReady(s,Number(t.id.match(/^w(\d+)-/)?.[1])) : !!s.done[t.id];
const validProofLink = (value: string | undefined): boolean => /^https:\/\/[^\s.]+\.[^\s]+$/i.test(value?.trim()??'');
export const weekOutputReady = (s: AppState,n: number): boolean => weekTasks(roadmap.weeks[n-1],s).filter(t=>t.tag!=='DELIVERABLE').every(t=>isWeekTaskDone(s,t)) && (validProofLink(s.weekEvidence[n]) || validProofLink(s.weekNotionUrls[n]) || (s.notes[n]?.trim().length??0)>=30);
export const doneCount = (s: AppState, w: Week) => weekTasks(w,s).filter(t=>isWeekTaskDone(s,t)).length;
export const weekPercent = (s: AppState, w: Week) => Math.round(100*doneCount(s,w)/weekTasks(w,s).length);
export function coreProgress(s: AppState): number {
  const total=roadmap.weeks.reduce((a,w)=>a+weekTasks(w,s).length,0);
  const complete=roadmap.weeks.reduce((a,w)=>a+doneCount(s,w),0);
  return complete===total?100:Math.min(99,Math.round(100*complete/total));
}
export function weekDate(s: AppState,n:number):Date {const d=new Date(`${s.start}T12:00:00`);const blocks=roadmap.weeks.slice(0,n-1).reduce((sum,w)=>sum+weekWorkload(w.n,s).calendarWeeks,0);d.setDate(d.getDate()+7*blocks);return d}
export function currentWeek(s: AppState,now=new Date()):number {const start=new Date(`${s.start}T12:00:00`),a=Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()),b=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());const elapsed=Math.floor((b-a)/86_400_000);if(elapsed<0)return 1;let days=0;for(const w of roadmap.weeks){days+=7*weekWorkload(w.n,s).calendarWeeks;if(elapsed<days)return w.n}return MAX_WEEK}
export function calcStreak(s:AppState,today=todayKey()):number {let streak=0,key=today;for(let i=0;i<400;i++){if(!isActive(s.activity[key])){if(i===0){key=dayOffset(key,-1);continue}break}streak++;key=dayOffset(key,-1)}return streak}
export function longestStreak(s:AppState):number {let best=0,cur=0,prev:string|null=null;for(const k of Object.keys(s.activity).sort()){if(!isActive(s.activity[k]))continue;cur=prev&&dayOffset(prev,1)===k?cur+1:1;best=Math.max(best,cur);prev=k}return best}
export const last7Days=(today=todayKey())=>Array.from({length:7},(_,i)=>dayOffset(today,i-6));
export function daysUntilStart(s:AppState,now=new Date()):number {return Math.max(0,Math.ceil((new Date(`${s.start}T00:00:00`).getTime()-now.getTime())/86_400_000))}
export function behindTasks(s:AppState,now=new Date()):Task[] {if(daysUntilStart(s,now)>0)return[];return roadmap.weeks.slice(0,currentWeek(s,now)-1).flatMap(w=>weekTasks(w,s).filter(t=>!isWeekTaskDone(s,t)))}
