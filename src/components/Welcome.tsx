import { useEffect, useRef, useState } from 'react';
import { completeOnboarding } from '../state/actions';
import { parseBackup } from '../state/model';
import { replaceState, useAppState } from '../state/store';
import { notify } from '../state/toast';
import { dateKey } from '../lib/dates';

/** First-run setup: study dates and weekly hours are personal, so ask instead of assuming. */
export function Welcome() {
  const s = useAppState();
  const ref = useRef<HTMLDialogElement>(null);
  const nextMonday = (() => { const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); return dateKey(d); })();
  const today = dateKey(new Date());
  const [start, setStart] = useState(today);
  const [hours, setHours] = useState('12');
  const show = !s.onboarded;
  useEffect(() => { const d = ref.current; if (!d) return; if (show && !d.open) d.showModal(); if (!show && d.open) d.close(); }, [show]);
  if (!show) return null;
  const submit = () => {
    const h = Number(hours);
    if (!start || !(h >= 2 && h <= 40)) { notify('Choose a start date and 2 to 40 hours a week.'); return; }
    completeOnboarding({ start, hours: h, bridge: 'unknown' }); notify('Your plan is set. Week 1 starts ' + new Date(`${start}T12:00:00`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long' }) + '.');
  };
  return <dialog ref={ref} className="modal welcome" aria-labelledby="welcome-title" onCancel={(e) => e.preventDefault()}>
    <span className="eyebrow">Welcome to Study Hub</span>
    <h2 id="welcome-title">Set up your plan</h2>
    <p className="muted">Choose a start date and weekly study time. You can change both later.</p>
    <label className="form-row"><span>When does week 1 start?</span><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
    <div className="start-options" role="group" aria-label="Quick start date">
      <button type="button" className={`chip ${start === today ? 'active' : ''}`} aria-pressed={start === today} onClick={() => setStart(today)}>Start today</button>
      <button type="button" className={`chip ${start === nextMonday ? 'active' : ''}`} aria-pressed={start === nextMonday} onClick={() => setStart(nextMonday)}>Next Monday</button>
    </div>
    <label className="form-row"><span>Hours you can study each week</span><input type="number" min={2} max={40} value={hours} onChange={(e) => setHours(e.target.value)} /></label>
    <div className="modal-actions"><label className="link file-link">Restore a backup instead<input type="file" accept="application/json,.json" hidden onChange={async (e) => {
      const f = e.target.files?.[0]; if (!f) return;
      try { const next = parseBackup(await f.text()); replaceState({ ...next, onboarded: true }, 'welcome-restore'); notify('Progress restored.'); } catch { notify('That file is not a valid Study Hub backup.'); }
    }} /></label><button className="btn" onClick={submit}>Start my plan</button></div>
  </dialog>;
}
