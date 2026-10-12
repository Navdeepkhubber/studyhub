import { curriculum } from '../data/curriculum';
import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

/**
 * Path routing on the History API: /plan, /week-3?focus=review-panel.
 * (Used to be #plan hash routing, so old bookmarks and links are still understood.)
 */
export interface Route { path: string; query: URLSearchParams; week: number | null }

const KNOWN = 'today|overview|plan|practice|dsa|skills|career|atlas|degree|settings|week-\\d+';
const LEGACY_HASH = new RegExp(`^#(${KNOWN})(\\?.*)?$`);

/** Old bookmarks like /#week-3?focus=x become /week-3?focus=x before the first render. */
if (LEGACY_HASH.test(location.hash)) history.replaceState(null, '', `/${location.hash.slice(1)}`);

const key = () => location.pathname + location.search;
function parse(): Route {
  const raw = location.pathname.replace(/^\/+|\/+$/g, '') || 'today';
  const m = raw.match(/^week-(\d+)$/);
  return { path: m ? 'plan' : raw, query: new URLSearchParams(location.search), week: m ? Math.max(1, Math.min(curriculum.weeks.length, +m[1])) : null };
}
let cached = parse(), cachedKey = key();
const listeners = new Set<() => void>();
const getSnapshot = (): Route => { if (cachedKey !== key()) { cachedKey = key(); cached = parse(); } return cached; };
const subscribe = (cb: () => void) => {
  listeners.add(cb); window.addEventListener('popstate', cb);
  return () => { listeners.delete(cb); window.removeEventListener('popstate', cb); };
};
export const useRoute = (): Route => useSyncExternalStore(subscribe, getSnapshot);

type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => unknown };
/** Cross-fade the page content where the browser supports it; plain instant swap everywhere else. */
function swap(update: () => void) {
  const doc = document as ViewTransitionDoc;
  if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) doc.startViewTransition(() => { flushSync(update); });
  else update();
}

/** Navigate to a route such as 'plan', '/week-3' or '#dsa?tab=revise' (a leading # or / is optional). */
export function go(to: string, opts: { replace?: boolean } = {}) {
  const url = `/${to.replace(/^[#/]+/, '')}`;
  if (url === key()) return;
  const update = () => { history[opts.replace ? 'replaceState' : 'pushState'](null, '', url); listeners.forEach((l) => l()); };
  if (opts.replace) update(); else swap(update);
}

/** Turn clicks on in-app links into client-side navigation (no reload, no # in the address bar). */
export function installLinkNavigation() {
  // An old #route typed or pasted into a tab that is already running the app only changes the hash.
  window.addEventListener('hashchange', () => { if (LEGACY_HASH.test(location.hash)) go(location.hash, { replace: true }); });
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const href = a.getAttribute('href') ?? '';
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (href.startsWith('#')) { if (LEGACY_HASH.test(href)) { e.preventDefault(); go(href); } return; } // other #anchors stay in-page
    e.preventDefault(); go(url.pathname + url.search);
  });
}
