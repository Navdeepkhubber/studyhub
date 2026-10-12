/**
 * Auto-save a backup file to disk with the File System Access API (Chromium desktop browsers).
 * Saving into a folder synced by Google Drive / OneDrive / Dropbox gives you a private,
 * always-current copy without any server or token. The file handle is kept in IndexedDB.
 */
import { getState, subscribe } from '../state/store';

interface WritableHandle { createWritable(): Promise<{ write(d: string): Promise<void>; close(): Promise<void> }>; name: string;
  queryPermission(o: { mode: 'readwrite' }): Promise<PermissionState>; requestPermission(o: { mode: 'readwrite' }): Promise<PermissionState> }
type Picker = (o: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<WritableHandle>;

export const fileSyncSupported = () => typeof window !== 'undefined' && 'showSaveFilePicker' in window;

const DB = 'studyhub', STORE = 'handles', KEY = 'autosave';
function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => rej(open.error);
    open.onsuccess = () => { const tx = open.result.transaction(STORE, mode); const r = fn(tx.objectStore(STORE)); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); };
  });
}

export type SyncStatus = { kind: 'off' } | { kind: 'needs-permission'; name: string } | { kind: 'on'; name: string; lastSaved: number | null } | { kind: 'error'; name: string; message: string };
let handle: WritableHandle | null = null;
let status: SyncStatus = { kind: 'off' };
let lastSaved: number | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let pendingWrite: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();
const set = (s: SyncStatus) => { status = s; listeners.forEach((l) => l()); };
export const getSyncStatus = () => status;
export const onSyncStatus = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

function write(): Promise<void> {
  const target = handle;
  if (!target) return Promise.resolve();
  // One writable stream at a time: a slow older save must never finish after a newer one.
  pendingWrite = pendingWrite.then(async () => {
    if (handle !== target) return;
    try {
      const w = await target.createWritable();
      await w.write(JSON.stringify({ ...getState(), savedAt: new Date().toISOString() }, null, 2));
      await w.close();
      if (handle === target) { lastSaved = Date.now(); set({ kind: 'on', name: target.name, lastSaved }); }
    } catch (e) {
      if (handle === target) set({ kind: 'error', name: target.name, message: e instanceof Error ? e.message : 'Write failed' });
    }
  });
  return pendingWrite;
}
let unsub: (() => void) | null = null;
function startWatching() {
  unsub?.();
  unsub = subscribe(() => { clearTimeout(timer); timer = setTimeout(() => void write(), 3000); });
}

/** Call once at startup: reconnects silently if permission is still granted. */
export async function initFileSync() {
  if (!fileSyncSupported()) return;
  try {
    handle = (await idb<WritableHandle | undefined>('readonly', (s) => s.get(KEY))) ?? null;
    if (!handle) return;
    const p = await handle.queryPermission({ mode: 'readwrite' });
    if (p === 'granted') { set({ kind: 'on', name: handle.name, lastSaved }); startWatching(); }
    else set({ kind: 'needs-permission', name: handle.name });
  } catch { set({ kind: 'off' }); }
}
/** Must be called from a click. */
export async function chooseSyncFile() {
  const picker = (window as unknown as { showSaveFilePicker: Picker }).showSaveFilePicker;
  handle = await picker({ suggestedName: 'study-hub-autosave.json', types: [{ description: 'Study Hub backup', accept: { 'application/json': ['.json'] } }] });
  await idb('readwrite', (s) => s.put(handle, KEY));
  startWatching(); await write();
}
/** Must be called from a click (browsers re-ask for permission after a restart). */
export async function reconnectSyncFile() {
  if (!handle) return;
  if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') { startWatching(); await write(); }
}
export async function stopFileSync() {
  unsub?.(); unsub = null; clearTimeout(timer); timer = undefined; handle = null;
  await pendingWrite; await idb('readwrite', (s) => s.delete(KEY)); set({ kind: 'off' });
}
