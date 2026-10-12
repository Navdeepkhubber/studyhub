import { useSyncExternalStore } from 'react';
import { logMinutes } from './actions';
import { notify } from './toast';

/**
 * Focus timer. Timestamp-based (accurate in throttled background tabs) and persisted, so a reload
 * keeps it running. A session that finished while the tab was closed is logged on the next visit.
 */
interface Snap { running: boolean; remaining: number; preset: number }
interface Saved { preset: number; running: boolean; endsAt: number; remainingMs: number }
const KEY = 'studyhub-timer';
const BASE_TITLE = typeof document !== 'undefined' ? document.title : '';

let preset = 25, endsAt = 0, remainingMs = preset * 60_000, running = false;
let snap: Snap = { running, remaining: preset * 60, preset };
let tick: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function save() { try { localStorage.setItem(KEY, JSON.stringify({ preset, running, endsAt, remainingMs } satisfies Saved)); } catch { /* ignore */ } }
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
function publish() {
  const ms = running ? Math.max(0, endsAt - Date.now()) : remainingMs;
  snap = { running, remaining: Math.ceil(ms / 1000), preset };
  if (typeof document !== 'undefined') document.title = running ? `${fmt(snap.remaining)} · Focus · ${BASE_TITLE}` : BASE_TITLE;
  listeners.forEach((l) => l());
}
function stop() { clearInterval(tick); tick = undefined; running = false; }

/** Short two-tone chime with Web Audio; no asset files. */
function chime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [660, 880].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.25;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.start(t); o.stop(t + 0.25);
    });
  } catch { /* audio unavailable */ }
}
function complete(away = false) {
  const mins = preset;
  stop(); remainingMs = preset * 60_000; save();
  logMinutes(mins);
  const msg = away ? `Your ${mins}-minute session finished while you were away. It has been logged.` : `Session complete: ${mins} minutes logged.`;
  notify(msg);
  if (!away) {
    chime();
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      try { new Notification('Focus session complete', { body: `${mins} minutes logged in Study Hub.`, icon: `${import.meta.env.BASE_URL}icons/icon-192.png` }); } catch { /* ignore */ }
    }
  }
}
function onTick() { if (endsAt - Date.now() <= 0) complete(); publish(); }
function start() { running = true; endsAt = Date.now() + remainingMs; clearInterval(tick); tick = setInterval(onTick, 500); }

// Restore on load.
try {
  const v = JSON.parse(localStorage.getItem(KEY) || 'null') as Saved | null;
  if (v && [25, 50].includes(v.preset)) {
    preset = v.preset; remainingMs = v.remainingMs > 0 ? v.remainingMs : preset * 60_000;
    if (v.running) {
      if (v.endsAt <= Date.now()) queueMicrotask(() => { complete(true); publish(); });
      else { remainingMs = v.endsAt - Date.now(); start(); }
    }
  }
} catch { /* ignore */ }
publish();

export const timer = {
  toggle() {
    if (running) { remainingMs = Math.max(0, endsAt - Date.now()); stop(); } else start();
    save(); publish();
  },
  reset() { stop(); remainingMs = preset * 60_000; save(); publish(); },
  setPreset(m: number) { preset = m; timer.reset(); },
};
export async function enableNotifications(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission === 'default' ? Notification.requestPermission() : Notification.permission;
}
export const useTimer = (): Snap => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => snap, () => snap);
