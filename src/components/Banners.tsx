import { useState, useSyncExternalStore } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import { downloadBackup } from '../lib/backup';
import { getSyncStatus, onSyncStatus } from '../lib/fileSync';
import { behindTasks } from '../lib/progress';
import { hasMeaningfulProgress } from '../state/model';
import { shiftPlan, snoozeBackup } from '../state/actions';
import { useAppState } from '../state/store';
import { notify } from '../state/toast';

const DAY = 86_400_000;
export function BackupBanner() {
  const s = useAppState();
  const sync = useSyncExternalStore(onSyncStatus, getSyncStatus, getSyncStatus);
  const now = Date.now();
  const overdue = s.lastBackupAt === null || now - s.lastBackupAt > 14 * DAY;
  if (!hasMeaningfulProgress(s) || !overdue || sync.kind === 'on' || (s.backupSnoozeUntil && now < s.backupSnoozeUntil)) return null;
  const days = s.lastBackupAt ? Math.floor((now - s.lastBackupAt) / DAY) : null;
  return <div className="banner warn" role="region" aria-label="Backup reminder">
    <ShieldAlert size={20} aria-hidden />
    <p>{days === null ? 'Your progress has never been backed up.' : `Last backup was ${days} days ago.`} It only lives in this browser, so clearing site data would erase it.</p>
    <div className="banner-actions"><button className="btn small" onClick={() => { downloadBackup(); notify('Backup downloaded.'); }}>Download backup</button>
      <a className="btn small ghost" href="/settings">Set up auto-save</a>
      <button className="link" onClick={() => snoozeBackup(3)}>Remind me in 3 days</button></div>
  </div>;
}

export function BehindBanner() {
  const s = useAppState();
  const [open, setOpen] = useState(false);
  const tasks = behindTasks(s);
  if (!tasks.length) return null;
  const weeks = [...new Set(tasks.map((t) => Number(t.id.match(/^w(\d+)-/)![1])))];
  return <div className="banner info" role="region" aria-label="Catch-up">
    <Clock size={20} aria-hidden />
    <p><b>{tasks.length} unfinished {tasks.length === 1 ? 'task' : 'tasks'} from earlier weeks</b> ({weeks.map((w) => `week ${w}`).join(', ')}). Catch up, or move the whole plan a week later so the dates match where you are.</p>
    <div className="banner-actions">
      <button className="btn small ghost" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide list' : 'Show them'}</button>
      <button className="btn small" onClick={() => { shiftPlan(1); notify('Plan moved one week later.', { label: 'Undo', run: () => shiftPlan(-1) }); }}>Shift plan by 1 week</button>
    </div>
    {open && <ul className="behind-list">{tasks.slice(0, 12).map((t) => <li key={t.id}><a href={`/week-${t.id.match(/^w(\d+)-/)![1]}`}>Week {t.id.match(/^w(\d+)-/)![1]}</a> · {t.text.length > 90 ? `${t.text.slice(0, 90)}…` : t.text}</li>)}{tasks.length > 12 && <li className="muted">and {tasks.length - 12} more</li>}</ul>}
  </div>;
}
