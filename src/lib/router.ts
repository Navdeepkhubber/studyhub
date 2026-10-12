import { curriculum } from '../data/curriculum';
import { useSyncExternalStore } from 'react';

export interface Route { path: string; query: URLSearchParams; week: number | null }
function parse(): Route {
  const raw = location.hash.slice(1) || 'today';
  const [pathPart, qs = ''] = raw.split('?');
  const m = pathPart.match(/^week-(\d+)$/);
  return { path: m ? 'plan' : pathPart, query: new URLSearchParams(qs), week: m ? Math.max(1, Math.min(curriculum.weeks.length, +m[1])) : null };
}
let cached = parse(), cachedHash = location.hash;
const subscribe = (cb: () => void) => {
  const h = () => { cachedHash = location.hash; cached = parse(); cb(); };
  window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h);
};
export const useRoute = (): Route => useSyncExternalStore(subscribe, () => { if (cachedHash !== location.hash) { cachedHash = location.hash; cached = parse(); } return cached; });
export const go = (hash: string) => { location.hash = hash.replace(/^#/, ''); };
