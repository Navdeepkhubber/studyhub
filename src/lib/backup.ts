import { getState } from '../state/store';
import { markBackedUp } from '../state/actions';
import { todayKey } from './dates';

/** Download the full state as JSON and record when it happened. */
export function downloadBackup() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' }));
  a.download = `study-hub-backup-${todayKey()}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  markBackedUp();
}
