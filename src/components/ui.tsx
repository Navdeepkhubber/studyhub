import type { ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { skillNames } from '../lib/impact';

export const Ext = ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={12} aria-hidden className="ext-icon" /></a>
);
export const Label = ({ children }: { children: ReactNode }) => <p className="eyebrow">{children}</p>;
export const Progress = ({ value, label }: { value: number; label?: string }) => (
  <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}><i style={{ width: `${value}%` }} /></div>
);
export const SectionHead = ({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) => (
  <div className="section-head"><div><h2>{title}</h2>{children && <p>{children}</p>}</div>{action}</div>
);
export const Callout = ({ children }: { children: ReactNode }) => <div className="callout">{children}</div>;
export const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => <section className={`panel ${className}`}>{children}</section>;
export const Btn = ({ href, children, variant = 'primary', small }: { href: string; children: ReactNode; variant?: 'primary' | 'ghost'; small?: boolean }) => (
  <a className={`btn ${variant === 'ghost' ? 'ghost' : ''} ${small ? 'small' : ''}`} href={href}>{children}<ArrowRight size={15} aria-hidden /></a>
);
export function Check({ checked, onChange, label, children, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; children?: ReactNode; disabled?: boolean }) {
  return <label className={`check ${disabled ? 'disabled' : ''}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />{children ?? <span>{label}</span>}</label>;
}
export function ImpactTags({ skills, goal, goalHref = '#degree' }: { skills: string[]; goal: string; goalHref?: string }) {
  return <div className="impact-tags">
    {skills.map((id) => <a key={id} className="tag tag-skill" href={`#skills?focus=${id}`} title="Open this skill in the skill map">Skill: {skillNames[id]}</a>)}
    <a className="tag tag-goal" href={goalHref} title="See how this supports your plan">Goal: {goal}</a>
  </div>;
}
export const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="form-row"><span>{label}</span>{children}</label>;
