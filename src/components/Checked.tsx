import { sourcesChecked, STALE_DAYS, type SourceId } from '../data/sources';

export function Checked({ source }: { source: SourceId }) {
  const iso = sourcesChecked[source];
  const d = new Date(`${iso}T12:00:00`);
  const stale = (Date.now() - d.getTime()) / 86_400_000 > STALE_DAYS;
  const label = d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  return <span className={`checked ${stale ? 'stale' : ''}`} title={stale ? 'This was checked a while ago. Links or details may have changed.' : undefined}>
    {stale ? `Last checked ${label} · may be out of date` : `Checked ${label}`}
  </span>;
}
