import { useSyncExternalStore } from 'react';
export interface ToastAction { label: string; run: () => void }
interface Toast { id: number; text: string; action?: ToastAction }
let toasts: Toast[] = [], n = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export function dismiss(id: number) { toasts = toasts.filter((x) => x.id !== id); emit(); }
/** Show a message; with an action (e.g. Undo) it stays a little longer. */
export function notify(text: string, action?: ToastAction) {
  const t = { id: ++n, text, action };
  toasts = [...toasts.slice(-3), t]; emit();
  setTimeout(() => dismiss(t.id), action ? 8000 : 4000);
}
export const useToasts = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => toasts, () => toasts);
