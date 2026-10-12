import { useEffect, useMemo, useRef, useState } from 'react';
import { a2zItems, a2zLocation } from '../lib/dsa';
import { neetcode, roadmap, skillLanes, weekTitles } from '../data';
import { curriculumTopicForKey } from '../lib/curriculum-progress';
import { roadmapViews } from '../data/roadmaps';
import { go } from '../lib/router';
import { fuzzyFilter } from '../lib/fuzzy';

const RECENT_KEY = 'studyhub-recent';
const loadRecent = (): Item[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
const saveRecent = (it: Item) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify([it, ...loadRecent().filter((r) => r.href !== it.href)].slice(0, 8))); } catch { /* ignore */ } };

interface Item { type: string; label: string; href: string }
const pages = [['Today', 'today'], ['Weekly plan', 'plan'], ['Practice Hub', 'practice'], ['DSA sheet', 'dsa'], ['Skill map', 'skills'], ['Career & portfolio', 'career'], ['Topic atlas', 'atlas'], ['Degree alignment', 'degree'], ['Settings', 'settings']];

function buildIndex(): Item[] {
  const idx: Item[] = [];
  roadmap.weeks.forEach((w) => idx.push({ type: 'Week', label: `Week ${w.n} · ${weekTitles[w.n - 1]}`, href: `/week-${w.n}` }));
  roadmapViews.forEach((r) => idx.push({ type: 'Roadmap', label: r.name, href: `/atlas?roadmap=${r.id}` }));
  skillLanes.forEach((l) => l.skills.forEach((s) => idx.push({ type: 'Skill', label: s.name, href: `/skills?focus=${s.id}` })));
  a2zItems.forEach((it) => idx.push({ type: 'A2Z problem', label: `${it.title} (Step ${a2zLocation.get(it.id)?.step.step})`, href: `/dsa?tab=a2z&q=${encodeURIComponent(it.title)}` }));
  neetcode.problems.filter((p) => p.nc150).forEach((p) => idx.push({ type: 'NeetCode 150', label: `${p.title} · ${p.pattern}`, href: `/dsa?tab=nc150&q=${encodeURIComponent(p.title)}` }));
  curriculumTopicForKey.forEach((t) => idx.push({ type: 'Roadmap topic', label: `${t.group} · ${t.text}`, href: `/week-${t.week}?focus=lesson-${t.key}` }));
  pages.forEach(([label, h]) => idx.push({ type: 'Page', label, href: `/${h}` }));
  return idx;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const index = useMemo(buildIndex, []);
  const [recent, setRecent] = useState<Item[]>([]);
  const results = useMemo(() => {
    if (!q.trim()) return recent.length ? recent.map((r) => ({ ...r, type: `Recent · ${r.type}` })) : index.filter((x) => x.type === 'Page');
    return fuzzyFilter(index, q, (x) => `${x.label} ${x.type}`);
  }, [index, q, recent]);

  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) { setQ(''); setActive(0); setRecent(loadRecent()); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);

  const choose = (it: Item) => {
    saveRecent({ ...it, type: it.type.replace(/^Recent · /, '') });
    onClose();
    if (it.href.startsWith('http')) window.open(it.href, '_blank', 'noopener'); else go(it.href);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); choose(results[active]); }
  };
  useEffect(() => { document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: 'nearest' }); }, [active]);

  return <dialog ref={ref} className="cmd" aria-label="Command palette" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
    <div className="cmd-box" onKeyDown={onKey}>
      <input autoFocus role="combobox" aria-expanded aria-controls="cmd-list" aria-activedescendant={`cmd-${active}`} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} placeholder="Search weeks, topics, problems, skills, resources…" autoComplete="off" />
      <div className="cmd-hint"><span>{q ? '↑ ↓ to move · Enter to open · Esc to close' : recent.length ? 'Recent' : 'Type to search; partial words work, e.g. “lnkd lst”'}</span><span><kbd>Ctrl</kbd> + <kbd>K</kbd></span></div>
      <ul id="cmd-list" role="listbox">
        {results.map((r, i) => <li key={i} id={`cmd-${i}`} role="option" aria-selected={i === active} className={i === active ? 'cmd-item active' : 'cmd-item'} onMouseMove={() => setActive(i)} onClick={() => choose(r)}><span className="cmd-type">{r.type}</span><span>{r.label}</span></li>)}
        {!results.length && <li className="cmd-empty">No results. Try fewer letters, or a topic, week or problem name.</li>}
      </ul>
    </div>
  </dialog>;
}
