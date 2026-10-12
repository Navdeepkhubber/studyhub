import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Bridge } from '../data/types';
import { downloadBackup } from '../lib/backup';
import { chooseSyncFile, fileSyncSupported, getSyncStatus, onSyncStatus, reconnectSyncFile, stopFileSync } from '../lib/fileSync';
import { calcStreak, longestStreak } from '../lib/progress';
import { isActive, parseBackup, summarize, type AppState } from '../state/model';
import { saveSettings, setDsaGoal } from '../state/actions';
import { getSnapshot, replaceState, requestPersistence, undoReplace, useAppState } from '../state/store';
import { notify } from '../state/toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field, Panel } from '../components/ui';

const when = (ts: number) => new Date(ts).toLocaleString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export function Settings() {
  const s = useAppState();
  const [start, setStart] = useState(s.start);
  const [hours, setHours] = useState(String(s.hours));
  const [bridge, setBridge] = useState<Bridge>(s.bridge);
  const [pending, setPending] = useState<AppState | null>(null);
  const [persist, setPersist] = useState<string>('checking');
  const sync = useSyncExternalStore(onSyncStatus, getSyncStatus, getSyncStatus);
  const snap = getSnapshot();
  const totalMin = Object.values(s.activity).reduce((a, d) => a + d.minutes, 0);

  useEffect(() => {
    if (!('storage' in navigator) || typeof navigator.storage.persisted !== 'function') { setPersist('unsupported'); return; }
    void navigator.storage.persisted().then((p) => setPersist(p ? 'persisted' : 'not-persisted'));
  }, []);
  const pick = async (file: File | undefined) => {
    if (!file) return;
    try { setPending(parseBackup(await file.text())); } catch { notify('That file is not a valid Study Hub or Study Compass backup. Nothing was changed.'); }
  };
  const cur = summarize(s), inc = pending ? summarize(pending) : null;

  return <>
    <div className="settings-grid">
      <Panel><h3>Plan settings</h3>
        <Field label="Week 1 start date"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label="Hours per week"><input type="number" min={2} max={40} value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
        <Field label="Confirmed degree"><input value="Master of Data Science · taught 240 points" disabled /></Field>
        <Field label="Bridging courses listed in your offer"><select value={bridge} onChange={(e) => setBridge(e.target.value as Bridge)}>
          <option value="unknown">Not recorded yet</option><option value="stats">STATS 707 + STATS 765</option><option value="cs">COMPSCI 717 + COMPSCI 751</option><option value="other">Other combination · follow my offer</option></select></Field>
        <Field label="Daily DSA goal (problems)"><input type="number" min={1} max={20} value={s.dsaGoal} onChange={(e) => setDsaGoal(Number(e.target.value))} /></Field>
        <p className="tiny muted">The dates and study-day schedule recalculate from your available hours. Your checkmarks and notes stay attached to the same checkpoints.</p>
        <button className="btn" onClick={() => { const h = Number(hours); if (start && h >= 2 && h <= 40) { saveSettings({ start, hours: h, bridge }); notify('Settings saved.'); } else notify('Enter hours between 2 and 40.'); }}>Save settings</button>
      </Panel>
      <Panel><h3>Your activity</h3>
        <div className="stats-grid three"><div className="stat"><span>Streak</span><strong>{calcStreak(s)}</strong><small>Best: {longestStreak(s)}</small></div>
          <div className="stat"><span>Total hours</span><strong>{Math.round(totalMin / 60)}h</strong><small>{totalMin} minutes</small></div>
          <div className="stat"><span>Active days</span><strong>{Object.values(s.activity).filter(isActive).length}</strong><small>Since you started</small></div></div>
        <h3>Keep your progress safe</h3>
        <p className="muted">Everything is stored in this browser only. Clearing site data, or a browser cleaning up storage, would erase it.</p>
        <dl className="status-list">
          <div><dt>Last backup</dt><dd>{s.lastBackupAt ? when(s.lastBackupAt) : <span className="warn-text">Never</span>}</dd></div>
          <div><dt>Browser storage</dt><dd>{persist === 'persisted' ? 'Protected from automatic cleanup' : persist === 'unsupported' ? 'This browser cannot protect storage' : <>May be cleared by the browser <button className="link" onClick={async () => { const r = await requestPersistence(); setPersist(r); notify(r === 'persisted' ? 'Storage is now protected.' : 'The browser declined. Installing the app or bookmarking it usually helps.'); }}>Protect it</button></>}</dd></div>
          <div><dt>Auto-save file</dt><dd>{!fileSyncSupported() ? 'Needs Chrome or Edge on a computer' : sync.kind === 'on' ? <>Saving to <b>{sync.name}</b>{sync.lastSaved ? ` · last saved ${when(sync.lastSaved)}` : ''}</> : sync.kind === 'needs-permission' ? <>Paused: allow access to <b>{sync.name}</b> again</> : sync.kind === 'error' ? <span className="warn-text">Couldn’t write {sync.name}: {sync.message}</span> : 'Off'}</dd></div>
        </dl>
        <div className="row">
          <button className="btn" onClick={() => { downloadBackup(); notify('Backup downloaded.'); }}>Download backup</button>
          {fileSyncSupported() && sync.kind === 'off' && <button className="btn ghost" onClick={() => chooseSyncFile().then(() => notify('Auto-save is on.')).catch(() => {})}>Auto-save to a file…</button>}
          {sync.kind === 'needs-permission' && <button className="btn ghost" onClick={() => void reconnectSyncFile()}>Resume auto-save</button>}
          {(sync.kind === 'on' || sync.kind === 'error') && <button className="link" onClick={() => void stopFileSync()}>Stop auto-save</button>}
        </div>
        <p className="tiny muted">Tip: put the auto-save file in a Google Drive, OneDrive or Dropbox folder on your computer for a private, always-current copy you can restore on another device.</p>
        <Field label="Restore from a backup file"><input type="file" accept="application/json,.json" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} /></Field>
        {snap && <p className="tiny">Before the last {snap.reason === 'undo' ? 'undo' : 'restore'} ({when(snap.at)}) your progress was saved. <button className="link" onClick={() => { if (undoReplace()) notify('Previous progress is back.'); }}>Switch back to it</button></p>}
      </Panel>
    </div>
    <Panel className="mt"><h3>Study method</h3><p>For each week: learn the essential idea, solve a practice problem, build a small artefact, then write a short reflection in your weekly notes. If a week overruns, move the remaining topics into notes and continue, or shift the plan from the Today page.</p>
      <p className="tiny muted">The full curriculum extends beyond the original pre-master window. Your offer and the University’s course schedule determine your actual enrolment sequence; check the 2027 regulations before enrolling.</p></Panel>
    <ConfirmDialog open={!!pending} title="Replace your current progress?" confirmLabel="Replace with backup" danger onCancel={() => setPending(null)}
      onConfirm={() => { if (pending) { replaceState(pending, 'restore'); notify('Backup restored.', { label: 'Undo', run: () => { undoReplace(); notify('Previous progress is back.'); } }); } setPending(null); }}>
      {inc && <table className="compare"><thead><tr><th></th><th>Now</th><th>Backup</th></tr></thead><tbody>
        <tr><td>Plan tasks ticked</td><td>{cur.tasks}</td><td>{inc.tasks}</td></tr><tr><td>Roadmap topics covered</td><td>{cur.roadmapTopics}</td><td>{inc.roadmapTopics}</td></tr><tr><td>DSA problems solved</td><td>{cur.problems}</td><td>{inc.problems}</td></tr>
        <tr><td>Notes</td><td>{cur.notes}</td><td>{inc.notes}</td></tr><tr><td>Active days</td><td>{cur.activeDays}</td><td>{inc.activeDays}</td></tr></tbody></table>}
      <p className="tiny muted">Your current progress is saved first, so you can switch back afterwards.</p>
    </ConfirmDialog>
  </>;
}
