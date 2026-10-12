import { useSyncExternalStore } from 'react';
import { STORAGE_KEY, defaultState, sanitize, type AppState } from './model';
import { mergeStates } from './merge';

function load(): AppState {
  try { return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); } catch { return defaultState(); }
}
let state: AppState = load();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
let dirty = false;
let dirtyBase: AppState | null = null;

/** Write only when there are unsaved changes, so an idle tab never overwrites another tab's work. */
function writeNow() {
  if (!dirty) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const remote = stored === null ? defaultState() : sanitize(JSON.parse(stored));
    state = mergeStates(dirtyBase ?? state, state, remote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    dirty = false; dirtyBase = null;
    listeners.forEach((l) => l());
  } catch { /* storage blocked or full */ }
}
function flush() {
  clearTimeout(timer); timer = undefined;
  if (!dirty) return;
  // The read-merge-write sequence must be atomic across tabs.
  if (navigator.locks?.request) {
    void navigator.locks.request(`${STORAGE_KEY}:write`, () => { writeNow(); }).catch(writeNow);
  } else writeNow();
}
if (typeof window !== 'undefined') {
  // Unload cannot wait for an asynchronous lock; save synchronously as a best effort.
  window.addEventListener('pagehide', writeNow);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') writeNow(); });
  // Another tab saved: adopt its state so both tabs stay in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY || e.newValue === null || dirty) return;
    try { state = sanitize(JSON.parse(e.newValue)); listeners.forEach((l) => l()); } catch { /* ignore malformed */ }
  });
}

export const getState = () => state;
export function update(fn: (s: AppState) => AppState) {
  if (!dirty) dirtyBase = state;
  state = fn(state);
  dirty = true;
  clearTimeout(timer); timer = setTimeout(flush, 250); // debounced: notes save per keystroke otherwise
  listeners.forEach((l) => l());
}
const SNAPSHOT_KEY = `${STORAGE_KEY}:snapshot`;
export interface Snapshot { at: number; reason: string; state: AppState }
/** Replace everything (restore/import). The current state is saved first so it can be undone. */
export function replaceState(next: AppState, reason = 'restore') {
  try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ at: Date.now(), reason, state } satisfies Snapshot)); } catch { /* best effort */ }
  update(() => next);
  // Restoring a backup intentionally replaces the complete state.
  clearTimeout(timer); timer = undefined;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); dirty = false; dirtyBase = null; } catch { /* storage blocked or full */ }
}
export function getSnapshot(): Snapshot | null {
  try { const v = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || 'null'); return v && v.state ? { ...v, state: sanitize(v.state) } : null; } catch { return null; }
}
/** Swap back to the snapshot; the state being replaced becomes the new snapshot (so undo is reversible). */
export function undoReplace(): boolean {
  const snap = getSnapshot(); if (!snap) return false;
  replaceState(snap.state, 'undo'); return true;
}
export const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/** Ask the browser not to evict our storage. Returns the resulting status. */
export async function requestPersistence(): Promise<'persisted' | 'not-persisted' | 'unsupported'> {
  if (!navigator.storage?.persist) return 'unsupported';
  if (await navigator.storage.persisted()) return 'persisted';
  return (await navigator.storage.persist()) ? 'persisted' : 'not-persisted';
}
export function useAppState(): AppState {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, getState, getState);
}
