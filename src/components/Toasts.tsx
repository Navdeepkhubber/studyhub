import { dismiss, useToasts } from '../state/toast';
export function Toasts() {
  const toasts = useToasts();
  return <div className="toasts" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className="toast"><span>{t.text}</span>
    {t.action && <button className="toast-action" onClick={() => { t.action!.run(); dismiss(t.id); }}>{t.action.label}</button>}
  </div>)}</div>;
}
