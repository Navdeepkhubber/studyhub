import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Binary, Briefcase, CalendarDays, CircleDot, GraduationCap, Layers, Map as MapIcon, Menu, Moon, PencilLine, Search, Settings as SettingsIcon, Sun, X } from 'lucide-react';
import { CommandPalette } from './components/CommandPalette';
import { Progress } from './components/ui';
import { Toasts } from './components/Toasts';
import { Welcome } from './components/Welcome';
import { fmtDay } from './lib/dates';
import { initFileSync } from './lib/fileSync';
import { coreProgress } from './lib/progress';
import { go, useRoute } from './lib/router';
import { hasMeaningfulProgress } from './state/model';
import { getState, requestPersistence, subscribe, useAppState } from './state/store';
import { Atlas } from './pages/Atlas';
import { Career } from './pages/Career';
import { Degree } from './pages/Degree';
import { Dsa } from './pages/Dsa';
import { Plan } from './pages/Plan';
import { Practice } from './pages/Practice';
import { Settings } from './pages/Settings';
import { Skills } from './pages/Skills';
import { Today } from './pages/Today';
import { WeekDetail } from './pages/WeekDetail';

interface NavItem { id: string; label: string; short: string; icon: ReactNode; more?: boolean; tab?: boolean }
const nav: NavItem[] = [
  { id: 'today', label: 'Today', short: 'Today', icon: <CircleDot size={18} aria-hidden />, tab: true },
  { id: 'plan', label: 'Weekly plan', short: 'Plan', icon: <CalendarDays size={18} aria-hidden />, tab: true },
  { id: 'dsa', label: 'DSA tracker', short: 'DSA', icon: <Binary size={18} aria-hidden />, tab: true },
  { id: 'practice', label: 'Practice', short: 'Practice', icon: <PencilLine size={18} aria-hidden />, tab: true },
  { id: 'skills', label: 'Skill map', short: 'Skills', icon: <Layers size={18} aria-hidden /> },
  { id: 'career', label: 'Career & portfolio', short: 'Career', icon: <Briefcase size={18} aria-hidden />, more: true },
  { id: 'atlas', label: 'Topic atlas', short: 'Atlas', icon: <MapIcon size={18} aria-hidden />, more: true },
  { id: 'degree', label: 'Degree alignment', short: 'Degree', icon: <GraduationCap size={18} aria-hidden />, more: true },
  { id: 'settings', label: 'Settings & backup', short: 'Settings', icon: <SettingsIcon size={18} aria-hidden /> },
];
const pageTitle: Record<string, string> = Object.fromEntries(nav.map((n) => [n.id, n.label]));
const pages: Record<string, () => ReactNode> = { today: Today, plan: Plan, practice: Practice, dsa: Dsa, skills: Skills, career: Career, atlas: Atlas, degree: Degree, settings: Settings };

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0c1d22' : '#f6f8f6');
    try { localStorage.setItem('studyhub-theme', next); } catch { /* storage blocked */ }
    setTheme(next);
  };
  return [theme, toggle] as const;
}

export function App() {
  const route = useRoute();
  const s = useAppState();
  const [theme, toggleTheme] = useTheme();
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { setMenu(false); if (!route.query.get('focus')) window.scrollTo(0, 0); }, [route]);
  useEffect(() => { if (route.path === 'overview') go('today'); }, [route.path]); // Overview was merged into Today
  useEffect(() => {
    void initFileSync();
    // Ask once for durable storage as soon as there is something worth keeping.
    let asked = false;
    const ask = () => { if (!asked && hasMeaningfulProgress(getState())) { asked = true; void requestPersistence(); } };
    ask(); return subscribe(ask);
  }, []);

  const path = route.week !== null ? 'plan' : pages[route.path] ? route.path : 'today';
  const title = route.week !== null ? `Week ${route.week}` : pageTitle[path];
  const progress = coreProgress(s);
  const Page = pages[path];
  const link = (n: NavItem) => <a key={n.id} href={`#${n.id}`} aria-current={path === n.id ? 'page' : undefined}>{n.icon}<span>{n.label}</span></a>;

  return <div className="app">
    <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
    <aside className={`sidebar ${menu ? 'open' : ''}`} aria-label="Sidebar">
      <a className="brand" href="#today"><span className="brand-mark" aria-hidden><img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" /></span><span>STUDY<br /><strong>HUB</strong></span></a>
      <p className="eyebrow side-label">Your workspace</p>
      <nav aria-label="Main navigation">
        {nav.filter((n) => !n.more && n.id !== 'settings').map(link)}
        <details className="nav-more" open={nav.some((n) => n.more && n.id === path)}><summary><span>More views</span></summary>{nav.filter((n) => n.more).map(link)}</details>
        {link(nav.find((n) => n.id === 'settings')!)}
      </nav>
      <div className="side-bottom">
        <div className="side-stat"><span>Full curriculum progress</span><strong>{progress}%</strong><Progress value={progress} label="Full curriculum progress" /></div>
        <a className="back" href="https://navdeep.dev"><ArrowLeft size={13} aria-hidden /> navdeep.dev</a>
      </div>
    </aside>
    {menu && <div className="scrim" onClick={() => setMenu(false)} aria-hidden />}
    <div className="main-wrap">
      <header className="topbar">
        <div><span className="eyebrow">Personal learning platform</span><h1>{title}</h1></div>
        <div className="top-right">
          <span className="date-pill">{fmtDay(new Date(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <button className="icon-btn search-btn" onClick={() => setPalette(true)} aria-label="Search (Ctrl+K)"><Search size={18} aria-hidden /><kbd>Ctrl K</kbd></button>
          <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={theme === 'dark'}>{theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}</button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>{route.week !== null ? <WeekDetail key={route.week} n={route.week} /> : <Page key={path} />}</main>
      <footer>Personal study guide · Progress stays in this browser · Ctrl+K to search</footer>
    </div>
    <nav className="tabbar" aria-label="Quick navigation">
      {nav.filter((n) => n.tab).map((n) => <a key={n.id} href={`#${n.id}`} aria-current={path === n.id ? 'page' : undefined}>{n.icon}<span>{n.short}</span></a>)}
      <button onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={menu ? 'Close menu' : 'More pages'}>{menu ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}<span>More</span></button>
    </nav>
    <CommandPalette open={palette} onClose={() => setPalette(false)} />
    <Welcome />
    <Toasts />
  </div>;
}
