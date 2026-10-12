import { useEffect, useRef, type ReactNode } from 'react';

export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel, danger }: {
  open: boolean; title: string; children: ReactNode; confirmLabel: string; cancelLabel?: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return <dialog ref={ref} className="modal" aria-labelledby="confirm-title" onClose={onCancel}>
    <h2 id="confirm-title">{title}</h2>
    <div className="modal-body">{children}</div>
    <div className="modal-actions"><button className="btn ghost" onClick={onCancel}>{cancelLabel}</button><button className={`btn ${danger ? 'danger' : ''}`} onClick={onConfirm} autoFocus>{confirmLabel}</button></div>
  </dialog>;
}
