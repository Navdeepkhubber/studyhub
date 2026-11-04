import { curriculumTopicsForWeek, isCurriculumTopicDone } from './curriculum-progress';
import { weekOutputReady } from './progress';
import type { Week } from '../data/types';
import type { AppState } from '../state/model';
export interface NextActivity { target:string; title:string; detail:string }
export function nextWeekActivity(s:AppState,w:Week):NextActivity|null {
  const next=curriculumTopicsForWeek(w.n).find(t=>!isCurriculumTopicDone(s,t.key));
  if(next)return {target:`lesson-${next.key}`,title:next.group,detail:next.text};
  if(!s.done[`w${w.n}-output`] || !weekOutputReady(s,w.n))return {target:'weekly-mission',title:'Finish the week',detail:w.o};
  return null;
}
export const activityHref=(week:number,activity:NextActivity)=>`/week-${week}?focus=${activity.target}`;
