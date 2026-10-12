import type { AppState } from './model';

type Value = unknown;
const isRecord = (v: Value): v is Record<string, Value> => !!v && typeof v === 'object' && !Array.isArray(v);
const same = (a: Value, b: Value) => JSON.stringify(a) === JSON.stringify(b);

/** Preserve edits from both tabs when they changed different fields or record keys. */
function mergeValue(base: Value, local: Value, remote: Value): Value {
  if (same(local, base)) return remote;
  if (same(remote, base)) return local;
  if (Array.isArray(local) && Array.isArray(remote) && (Array.isArray(base) || base === undefined)) {
    const original = Array.isArray(base) ? base : [];
    // Daily task and DSA logs are sets of strings; timer sessions are append-only objects.
    if ([...original, ...local, ...remote].every((v) => typeof v === 'string')) {
      const old = new Set(original);
      return [...new Set([
        ...original.filter((v) => local.includes(v) && remote.includes(v)),
        ...local.filter((v) => !old.has(v)),
        ...remote.filter((v) => !old.has(v)),
      ])];
    }
    if ([...original, ...local, ...remote].every((v) => isRecord(v) && typeof v.ts === 'number')) {
      return [...new Map([...original, ...remote, ...local].map((v) => [v.ts, v])).values()]
        .sort((a, b) => (a.ts as number) - (b.ts as number)).slice(-500);
    }
  }
  if (isRecord(local) && isRecord(remote) && (isRecord(base) || base === undefined)) {
    const original = isRecord(base) ? base : {};
    const result: Record<string, Value> = {};
    for (const key of new Set([...Object.keys(original), ...Object.keys(local), ...Object.keys(remote)])) {
      const value = mergeValue(original[key], local[key], remote[key]);
      if (value !== undefined) result[key] = value;
    }
    return result;
  }
  // A true same-key conflict cannot be combined automatically. Keep this tab's edit.
  return local;
}

export function mergeStates(base: AppState, local: AppState, remote: AppState): AppState {
  const merged = mergeValue(base, local, remote) as AppState;
  for (const day of Object.keys(merged.activity)) {
    const old = base.activity[day], left = local.activity[day], right = remote.activity[day];
    if (!left || !right) continue;
    for (const field of ['minutes', 'missions'] as const) {
      const before = old?.[field] ?? 0;
      if (left[field] !== before && right[field] !== before)
        merged.activity[day][field] = left[field] + right[field] - before;
    }
  }
  return merged;
}
