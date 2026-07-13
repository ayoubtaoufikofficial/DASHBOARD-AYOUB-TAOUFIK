import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Home, Boxes, ClipboardCheck, FileCheck2, Wrench, Award, Flag,
  CalendarCheck2, UserSquare2, Users, CalendarDays, ListTodo, Target,
  FileText, StickyNote, BarChart3, FileBarChart2, Bell, Settings as SettingsIcon,
  Bot, Sun, Moon, Menu, X, Plus, Trash2, Flame, Clock, TrendingUp,
  CheckCircle2, Circle, Sparkles, GraduationCap, ChevronRight, Search,
  Pencil, Check, SlidersHorizontal, Palette, ImageIcon, Crown, Info,
} from 'lucide-react';

/* ============================================================
   PROFILE PHOTO
   Place FB_IMG_1750515617631.jpg in the same folder as this file
   (src/). Vite bundles it automatically through this import — if
   you move the image, just update the path below.
   ============================================================ */
import avatarPhoto from './FB_IMG_1750515617631.jpg';
const AVATAR_SRC = avatarPhoto;

/* ============================================================
   STATIC DATA — sourced from the TSMFM 2nd-year module tree
   ============================================================ */
const CATEGORIES = [
  { id: 'langues', label: 'Langues & Communication', color: 'var(--cat-langues)' },
  { id: 'culture', label: 'Culture & Développement Personnel', color: 'var(--cat-culture)' },
  { id: 'gestion', label: 'Gestion & Organisation Industrielle', color: 'var(--cat-gestion)' },
  { id: 'analyse', label: 'Analyse & Méthodes', color: 'var(--cat-analyse)' },
  { id: 'conception', label: 'Conception & Outillages', color: 'var(--cat-conception)' },
  { id: 'fabrication', label: 'Fabrication & Production', color: 'var(--cat-fabrication)' },
];
const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

const RAW_MODULES = [
  { id: 'EGTS202', name: 'Français', hours: 115, coef: 2, cat: 'langues' },
  { id: 'EGTS203', name: 'Anglais technique', hours: 50, coef: 2, cat: 'langues' },
  { id: 'EGTS204', name: 'Culture entrepreneuriale', hours: 45, coef: 2, cat: 'culture' },
  { id: 'EGTS205', name: 'Compétences comportementales', hours: 30, coef: 2, cat: 'culture' },
  { id: 'EGTSI206', name: 'Culture et techniques intermédiaires du numérique', hours: 30, coef: 1, cat: 'culture' },
  { id: 'M205', name: 'Gestion de la production', hours: 30, coef: 2, cat: 'gestion' },
  { id: 'M207', name: 'Calcul du prix de revient industriel et devis', hours: 30, coef: 2, cat: 'gestion' },
  { id: 'M208', name: 'Optimisation et amélioration de la production', hours: 42, coef: 2, cat: 'gestion' },
  { id: 'M210', name: "Conduite et gestion de projets d'industrialisation", hours: 40, coef: 2, cat: 'gestion' },
  { id: 'M212', name: 'Démarche qualité', hours: 15, coef: 1, cat: 'gestion' },
  { id: 'M201', name: 'Analyse de produits et gamme de montage', hours: 45, coef: 2, cat: 'analyse' },
  { id: 'M202', name: 'Détermination des temps de fabrication', hours: 30, coef: 2, cat: 'analyse' },
  { id: 'M204', name: 'Statistiques en production', hours: 30, coef: 2, cat: 'analyse' },
  { id: 'M206', name: "Conception et dessin d'outillages de production", hours: 88, coef: 4, cat: 'conception' },
  { id: 'M203', name: 'Élaboration et constitution des dossiers de fabrication', hours: 90, coef: 4, cat: 'fabrication' },
  { id: 'M209', name: 'Programmation, réglage et conduite des MOCN', hours: 90, coef: 4, cat: 'fabrication' },
  { id: 'M211', name: 'CAO / FAO', hours: 70, coef: 3, cat: 'fabrication' },
].map((m) => ({ ...m, grades: { controle: '', tp: '', efm: '', regional: '' } }));

const STAGE = { id: 'M213', name: 'Intégration en milieu de travail', weeks: 4 };

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'modules', label: 'Modules', icon: Boxes },
  { id: 'grades', label: 'Grades', icon: ClipboardCheck },
  { id: 'controle', label: 'Contrôle', icon: FileCheck2 },
  { id: 'tp', label: 'TP', icon: Wrench },
  { id: 'efm', label: 'EFM', icon: Award },
  { id: 'regional', label: 'Régional', icon: Flag },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
  { id: 'professors', label: 'Professors', icon: UserSquare2 },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: FileBarChart2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const GTYPES = [
  { key: 'controle', label: 'Contrôle' },
  { key: 'tp', label: 'TP' },
  { key: 'efm', label: 'EFM' },
  { key: 'regional', label: 'Régional' },
];

/* Selectable interface accents — the "purple liquid glass" choice lives here,
   but the picker in Settings lets you swap the whole OS to any of these. */
const ACCENT_THEMES = [
  { id: 'violet', label: 'Violet', accent: '#b794f6', accent2: '#e9d5ff', glow: '#8b5cf6' },
  { id: 'indigo', label: 'Indigo', accent: '#818cf8', accent2: '#c7d2fe', glow: '#6366f1' },
  { id: 'fuchsia', label: 'Fuchsia', accent: '#e879f9', accent2: '#f5d0fe', glow: '#c026d3' },
  { id: 'cyan', label: 'Cyan', accent: '#67e8f9', accent2: '#a5f3fc', glow: '#06b6d4' },
  { id: 'emerald', label: 'Émeraude', accent: '#34d399', accent2: '#a7f3d0', glow: '#059669' },
  { id: 'rose', label: 'Rose', accent: '#fb7185', accent2: '#fecdd3', glow: '#e11d48' },
];

const FRAME_STYLES = [
  { id: 'aura', label: 'Aura lumineuse' },
  { id: 'ring', label: 'Anneau' },
  { id: 'plain', label: 'Simple' },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const round1 = (n) => Math.round(n * 10) / 10;

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
function GlassCard({ className = '', children, style, ...rest }) {
  return (
    <div className={`relative rounded-3xl glass glass-hover ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/* Ripple-enabled button — gives every important action a tactile
   "selection" pulse instead of a flat click. */
function RippleButton({ children, onClick, className = '', style, as = 'button', ...rest }) {
  const [ripples, setRipples] = useState([]);
  const Tag = as;
  const handle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = uid();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((r2) => r2.id !== id)), 650);
    onClick && onClick(e);
  };
  return (
    <Tag onClick={handle} className={`ripple-host press-scale ${className}`} style={style} {...rest}>
      {children}
      {ripples.map((r) => (
        <span key={r.id} className="ripple-dot" style={{ left: r.x, top: r.y }} />
      ))}
    </Tag>
  );
}

function Chip({ active, onClick, children, color }) {
  return (
    <RippleButton
      onClick={onClick}
      className={`chip ${active ? 'active' : ''}`}
      style={active && color ? { background: color, color: '#1c1230' } : undefined}
    >
      {children}
    </RippleButton>
  );
}

function CheckBox({ checked, onClick }) {
  return (
    <span
      role="button"
      onClick={onClick}
      className={`check-box ${checked ? 'checked' : ''}`}
    >
      {checked && <Check size={12} color="#1c1230" strokeWidth={3} />}
    </span>
  );
}

function Avatar({ size = 96, frame = 'aura', rounded = 'rounded-3xl' }) {
  return (
    <div
      className={`avatar-wrap ${frame === 'aura' ? 'avatar-aura' : ''} ${frame === 'ring' ? 'avatar-ring' : ''}`}
      style={{ width: size, height: size }}
    >
      <img
        src={AVATAR_SRC}
        alt="Ayoub Taoufik"
        className={`avatar-img ${rounded}`}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--ink-2)' }}>{eyebrow}</div>}
        <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--ink-0)' }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ProgressBar({ value, color = 'var(--accent)', track }) {
  return (
    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: track || 'var(--line)' }}>
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${clamp(value, 0, 100)}%`, background: color }} />
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = 'var(--accent)', delay = 0 }) {
  return (
    <GlassCard className="p-4 anim-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>{label}</span>
        {Icon && (
          <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}>
            <Icon size={14} />
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-bold" style={{ color: 'var(--ink-0)' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>{sub}</div>}
    </GlassCard>
  );
}

function Donut({ value, max = 20, color = 'var(--accent)', size = 116, label, sub }) {
  const pct = value == null ? 0 : clamp((value / max) * 100, 0, 100);
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)' }} />
        <text x="50%" y="47%" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink-0)" className="font-display">
          {value == null ? '—' : round1(value)}
        </text>
        <text x="50%" y="63%" textAnchor="middle" fontSize="9" fill="var(--ink-2)">/ {max}</text>
      </svg>
      {label && <div className="text-sm font-medium mt-1" style={{ color: 'var(--ink-0)' }}>{label}</div>}
      {sub && <div className="text-xs" style={{ color: 'var(--ink-2)' }}>{sub}</div>}
    </div>
  );
}

function MiniBars({ data, max = 20 }) {
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--ink-1)' }}>{d.label}</span>
            <span className="font-mono" style={{ color: 'var(--ink-0)' }}>{d.value == null ? '—' : round1(d.value)}</span>
          </div>
          <ProgressBar value={d.value == null ? 0 : (d.value / max) * 100} color={d.color} />
        </div>
      ))}
    </div>
  );
}

function Radar({ data, max = 20, size = 260 }) {
  const n = data.length;
  const cx = size / 2, cy = size / 2, r = size / 2 - 34;
  const pt = (i, val) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rad = (clamp(val, 0, max) / max) * r;
    return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)];
  };
  const ringPts = (frac) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * frac * Math.cos(angle)},${cy + r * frac * Math.sin(angle)}`;
    }).join(' ');
  const dataPts = data.map((d, i) => pt(i, d.value || 0)).map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={ringPts(f)} fill="none" stroke="var(--line)" strokeWidth="1" />)}
      {data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const [lx, ly] = [cx + (r + 22) * Math.cos(angle), cy + (r + 22) * Math.sin(angle)];
        return <text key={d.label} x={lx} y={ly} fontSize="9.5" fill="var(--ink-2)" textAnchor="middle" dominantBaseline="middle">{d.short || d.label}</text>;
      })}
      <polygon points={dataPts} fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="2" style={{ transition: 'all 0.8s cubic-bezier(.2,.8,.2,1)' }} />
      {data.map((d, i) => { const [x, y] = pt(i, d.value || 0); return <circle key={d.label} cx={x} cy={y} r="3.5" fill={d.color || 'var(--accent)'} />; })}
    </svg>
  );
}

function Sparkline({ points, width = 560, height = 160, color = 'var(--accent)' }) {
  if (points.length < 2) {
    return <div className="flex items-center justify-center h-[160px] text-sm" style={{ color: 'var(--ink-2)' }}>أضف بعض النقاط لعرض تطور المعدل هنا</div>;
  }
  const max = 20, min = 0;
  const step = width / (points.length - 1);
  const y = (v) => height - ((v - min) / (max - min)) * (height - 20) - 10;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${y(p)}`).join(' ');
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => <circle key={i} cx={i * step} cy={y(p)} r="2.5" fill={color} />)}
    </svg>
  );
}

function NumField({ value, onChange, placeholder = '—' }) {
  return (
    <input type="number" min="0" max="20" step="0.25" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-16 text-center rounded-lg py-1.5 text-sm font-mono bg-transparent focus-ring"
      style={{ border: '1px solid var(--glass-border)', color: 'var(--ink-0)' }} />
  );
}

function Modal({ onClose, children, title }) {
  return (
    <div className="modal-backdrop flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-panel glass-strong rounded-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="press-scale"><X size={18} style={{ color: 'var(--ink-2)' }} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ToastStack({ toasts }) {
  const colorFor = (kind) => (kind === 'good' ? 'var(--good)' : kind === 'bad' ? 'var(--bad)' : 'var(--accent)');
  const IconFor = (kind) => (kind === 'good' ? CheckCircle2 : kind === 'bad' ? Trash2 : Info);
  return (
    <div className="toast-stack">
      {toasts.map((t) => {
        const Icon = IconFor(t.kind);
        return (
          <div key={t.id} className="toast-item glass-strong rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm">
            <Icon size={16} style={{ color: colorFor(t.kind) }} className="shrink-0" />
            <span style={{ color: 'var(--ink-0)' }}>{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [accentTheme, setAccentTheme] = useState('violet');
  const [avatarFrame, setAvatarFrame] = useState('aura');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

const [modules, setModules] = useState(() => {
  const saved = localStorage.getItem('ayoub-dashboard-data');
  return saved ? JSON.parse(saved) : RAW_MODULES;
});

useEffect(() => {
  localStorage.setItem('ayoub-dashboard-data', JSON.stringify(modules));
}, [modules]);
  const [weights, setWeights] = useState({ controle: 25, tp: 25, efm: 25, regional: 25 });

  const [studyHours, setStudyHours] = useState(18);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(20);
  const [sessions, setSessions] = useState({ total: 24, attended: 21 });

  const [tasks, setTasks] = useState([
    { id: uid(), title: 'Réviser M206 — dessin d’outillages', done: false },
    { id: uid(), title: 'Finir compte-rendu TP CAO/FAO', done: true },
    { id: uid(), title: 'Préparer le contrôle EGTS203', done: false },
  ]);
  const [taskInput, setTaskInput] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  const [goals, setGoals] = useState({
    weekly: [
      { id: uid(), label: '20h d’étude cette semaine', done: false },
      { id: uid(), label: 'Terminer 3 modules Fabrication', done: false },
    ],
    monthly: [{ id: uid(), label: 'Moyenne générale ≥ 14/20', done: false }],
  });

  const [professors, setProfessors] = useState([
    { id: uid(), name: 'M. El Amrani', subject: 'CAO / FAO' },
    { id: uid(), name: 'Mme Bennis', subject: 'Anglais technique' },
  ]);
  const [students, setStudents] = useState([{ id: uid(), name: 'Ayoub Taoufik', group: 'TSMFM-2A' }]);
  const [documents, setDocuments] = useState([{ id: uid(), name: 'Cours_M209_MOCN.pdf', tag: 'Fabrication' }]);
  const [notes, setNotes] = useState([{ id: uid(), title: 'Formule prix de revient', body: 'Coût direct + coût indirect + marge…' }]);
  const [examDate, setExamDate] = useState('2026-06-15');
  const [activity, setActivity] = useState([{ id: uid(), text: 'Système initialisé — bienvenue Ayoub 👋', time: Date.now() }]);
  const [history, setHistory] = useState([]);
  const [toasts, setToasts] = useState([]);
  const lastOverall = useRef(null);

  // Modules selection / filters / CRUD modal
  const [moduleFilterCat, setModuleFilterCat] = useState('all');
  const [moduleFilterStatus, setModuleFilterStatus] = useState('all');
  const [moduleSearch, setModuleSearch] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moduleModalMode, setModuleModalMode] = useState(null); // 'edit' | 'create' | null
  const [moduleDraft, setModuleDraft] = useState(null);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  useEffect(() => {
    const t = ACCENT_THEMES.find((a) => a.id === accentTheme) || ACCENT_THEMES[0];
    const root = document.documentElement.style;
    root.setProperty('--accent', t.accent);
    root.setProperty('--accent-2', t.accent2);
    root.setProperty('--accent-glow', t.glow);
  }, [accentTheme]);

  const logActivity = (text) => setActivity((a) => [{ id: uid(), text, time: Date.now() }, ...a].slice(0, 30));

  const addToast = (text, kind = 'info') => {
    const id = uid();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
// الحسابات الديناميكية لنسبة التقدم
  const totalModules = modules.length; 
  const gradedModules = modules.filter(m => m.note && m.note !== '-').length;
  const progressPercentage = totalModules > 0 ? Math.round((gradedModules / totalModules) * 100) : 0;
  /* ---------- reactive grading engine ---------- */
  const moduleFinal = (m) => {
    const entries = GTYPES.map((g) => [g.key, m.grades[g.key]]).filter(([, v]) => v !== '' && v != null);
    if (entries.length === 0) return null;
    const totalW = entries.reduce((s, [k]) => s + weights[k], 0) || 1;
    const sum = entries.reduce((s, [k, v]) => s + Number(v) * weights[k], 0);
    return sum / totalW;
  };

  const enriched = useMemo(() => modules.map((m) => ({ ...m, final: moduleFinal(m) })), [modules, weights]);

  const overall = useMemo(() => {
    const withFinal = enriched.filter((m) => m.final != null);
    if (!withFinal.length) return null;
    const totalCoef = withFinal.reduce((s, m) => s + m.coef, 0);
    return withFinal.reduce((s, m) => s + m.final * m.coef, 0) / totalCoef;
  }, [enriched]);

  const typeAvg = (key) => {
    const vals = modules.map((m) => m.grades[key]).filter((v) => v !== '' && v != null).map(Number);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const controleAvg = useMemo(() => typeAvg('controle'), [modules]);
  const tpAvg = useMemo(() => typeAvg('tp'), [modules]);
  const efmAvg = useMemo(() => typeAvg('efm'), [modules]);
  const regionalAvg = useMemo(() => typeAvg('regional'), [modules]);

  const categoryStats = useMemo(() => CATEGORIES.map((c) => {
    const mods = enriched.filter((m) => m.cat === c.id && m.final != null);
    const totalCoef = mods.reduce((s, m) => s + m.coef, 0);
    const value = totalCoef ? mods.reduce((s, m) => s + m.final * m.coef, 0) / totalCoef : 0;
    return { ...c, value, short: c.label.split(' ')[0], hasData: mods.length > 0 };
  }), [enriched]);

  const finishedCount = enriched.filter((m) => m.final != null).length;
  const remainingCount = enriched.length - finishedCount;
  const successRate = finishedCount ? (enriched.filter((m) => m.final >= 10).length / finishedCount) * 100 : null;
  const completion = useMemo(() => {
    const total = modules.length * GTYPES.length || 1;
    const filled = modules.reduce((s, m) => s + GTYPES.filter((g) => m.grades[g.key] !== '').length, 0);
    return (filled / total) * 100;
  }, [modules]);

  const attendanceRate = sessions.total ? (sessions.attended / sessions.total) * 100 : 0;
 // حساب عدد المواد المنقوطة ديناميكياً
const gradedModulesCount = modules.filter(m => m.note && m.note !== '-').length;
const xp = gradedModulesCount;
const level = 1;
const xpInLevel = modules.length > 0 ? Math.round((gradedModulesCount / modules.length) * 100) : 0;
 
  const overallPct = overall != null ? (overall / 20) * 100 : 0;
  const performanceScore = Math.round(overallPct * 0.5 + attendanceRate * 0.3 + completion * 0.2);
  const studyRatio = clamp((studyHours / (weeklyGoalHours || 1)) * 100, 0, 100);
  const tasksDoneRatio = tasks.length ? (tasks.filter((t) => t.done).length / tasks.length) * 100 : 0;
  const productivityScore = Math.round(tasksDoneRatio * 0.5 + studyRatio * 0.5);
  const studyScore = Math.round(completion * 0.5 + studyRatio * 0.5);

  const daysToExam = useMemo(() => {
    const diff = new Date(examDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [examDate]);

  useEffect(() => {
    if (overall != null && overall !== lastOverall.current) {
      lastOverall.current = overall;
      setHistory((h) => [...h, overall].slice(-16));
    }
  }, [overall]);

  /* ---------- mutators ---------- */
  const updateGrade = (id, key, value) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, grades: { ...m.grades, [key]: value } } : m)));
    if (value !== '') logActivity(`${id} — note ${GTYPES.find((g) => g.key === key).label} mise à jour → ${value}/20`);
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks((t) => [{ id: uid(), title: taskInput.trim(), done: false }, ...t]);
    logActivity(`Nouvelle tâche : ${taskInput.trim()}`);
    addToast('Tâche ajoutée', 'good');
    setTaskInput('');
  };
  const toggleTask = (id) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const removeTask = (id) => setTasks((t) => t.filter((x) => x.id !== id));
  const toggleTaskSelect = (id) => setSelectedTaskIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkDoneTasks = () => { setTasks((t) => t.map((x) => (selectedTaskIds.has(x.id) ? { ...x, done: true } : x))); logActivity(`${selectedTaskIds.size} tâche(s) marquée(s) terminée(s)`); addToast(`${selectedTaskIds.size} tâche(s) terminée(s)`, 'good'); setSelectedTaskIds(new Set()); };
  const bulkDeleteTasks = () => { setTasks((t) => t.filter((x) => !selectedTaskIds.has(x.id))); logActivity(`${selectedTaskIds.size} tâche(s) supprimée(s)`); addToast(`${selectedTaskIds.size} tâche(s) supprimée(s)`, 'bad'); setSelectedTaskIds(new Set()); };

  const toggleGoal = (scope, id) => {
    setGoals((g) => {
      const item = g[scope].find((x) => x.id === id);
      if (item && !item.done) addToast(`Objectif atteint : ${item.label}`, 'good');
      return { ...g, [scope]: g[scope].map((x) => (x.id === id ? { ...x, done: !x.done } : x)) };
    });
  };
  const addSimple = (setter, item, label) => { setter((list) => [{ id: uid(), ...item }, ...list]); logActivity(label); };
  const removeFrom = (setter, id) => setter((list) => list.filter((x) => x.id !== id));

  /* module CRUD */
  const openCreateModule = () => { setModuleDraft({ id: '', name: '', hours: 30, coef: 2, cat: 'langues' }); setModuleModalMode('create'); };
  const openEditModule = (m) => { setModuleDraft({ id: m.id, name: m.name, hours: m.hours, coef: m.coef, cat: m.cat }); setModuleModalMode('edit'); };
  const saveModuleDraft = () => {
    if (!moduleDraft.name.trim()) return;
    if (moduleModalMode === 'create') {
      const newId = moduleDraft.id.trim() || `MOD-${uid().toUpperCase()}`;
      setModules((prev) => [...prev, { ...moduleDraft, id: newId, grades: { controle: '', tp: '', efm: '', regional: '' } }]);
      logActivity(`Module ajouté : ${moduleDraft.name}`);
      addToast(`Module « ${moduleDraft.name} » créé`, 'good');
    } else {
      setModules((prev) => prev.map((m) => (m.id === moduleDraft.id ? { ...m, ...moduleDraft } : m)));
      logActivity(`Module modifié : ${moduleDraft.name}`);
      addToast(`Module « ${moduleDraft.name} » mis à jour`, 'good');
    }
    setModuleModalMode(null); setModuleDraft(null);
  };
  const deleteModule = (id) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    logActivity(`Module supprimé : ${id}`);
    addToast(`Module ${id} supprimé`, 'bad');
    setModuleModalMode(null); setSelectedModuleId(null);
  };

  const filteredModules = useMemo(() => enriched.filter((m) => {
    if (moduleFilterCat !== 'all' && m.cat !== moduleFilterCat) return false;
    if (moduleFilterStatus === 'done' && !(m.final != null)) return false;
    if (moduleFilterStatus === 'pending' && m.final != null) return false;
    if (moduleSearch.trim() && !(`${m.name} ${m.id}`.toLowerCase().includes(moduleSearch.toLowerCase()))) return false;
    return true;
  }), [enriched, moduleFilterCat, moduleFilterStatus, moduleSearch]);

  /* ============================================================
     RENDER
     ============================================================ */
  return (
  <div className="min-h-screen relative" style={{ background: 'var(--bg-0)', color: 'var(--ink-0)' }} dir="rtl">
      <div className="ambient-bg">
        <div className="ambient-blob blob-a" />
        <div className="ambient-blob blob-b" />
        <div className="ambient-blob blob-c" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className={`fixed lg:static top-0 right-0 z-50 h-screen lg:h-auto w-72 shrink-0 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <GlassCard className="glass-strong p-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-2 pb-4">
                <Avatar size={36} frame="plain" rounded="rounded-xl" />
                <div>
                  <div className="font-display font-bold text-sm leading-none">Study OS</div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--ink-2)' }}>TSMFM · 2ème année</div>
                </div>
                <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)} style={{ color: 'var(--ink-2)' }}><X size={18} /></button>
              </div>

              <nav className="flex-1 overflow-y-auto pr-1 space-y-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <RippleButton key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
                      style={{
                        background: active ? 'var(--glass-fill-strong)' : 'transparent',
                        color: active ? 'var(--ink-0)' : 'var(--ink-2)',
                        border: active ? '1px solid var(--glass-border)' : '1px solid transparent',
                        fontWeight: active ? 600 : 500,
                      }}>
                      <Icon size={16} />
                      <span className="truncate">{item.label}</span>
                      {active && <ChevronRight size={14} className="ml-auto" />}
                    </RippleButton>
                  );
                })}
              </nav>

              <div className="pt-3 branch-rule mt-2" />
              <RippleButton onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                className="mt-3 w-full flex items-center gap-2 justify-center py-2.5 rounded-xl text-sm font-medium glass">
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </RippleButton>
            </GlassCard>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* MAIN */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden glass rounded-xl p-2" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-2)' }} />
              <input placeholder="Rechercher un module, une note…" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-transparent glass focus-ring" style={{ color: 'var(--ink-0)' }} />
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'var(--ink-2)' }}>
              <Clock size={14} /> Examen dans <span className="font-mono font-semibold" style={{ color: 'var(--ink-0)' }}>{daysToExam}j</span>
            </div>
            <button onClick={() => setActiveTab('settings')} className="press-scale">
              <Avatar size={34} frame={avatarFrame} rounded="rounded-xl" />
            </button>
          </div>

          {/* PROFILE CARD */}
          <GlassCard className="glass-strong p-6 anim-in">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="shrink-0 mx-auto md:mx-0">
                <Avatar size={96} frame={avatarFrame} rounded="rounded-3xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-center md:justify-start mb-1">
                  <Crown size={22} className="crown-icon" style={{ color: '#facc15' }} />
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="font-display text-2xl font-bold">Ayoub Taoufik</h1>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--glass-fill-strong)', color: 'var(--accent)' }}>
                    TSMFM · 2ème année · Niveau {level}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--ink-2)' }}>
                  {xp} XP · {finishedCount}/{enriched.length} modules avec note
                </p>
                <div className="mt-3 max-w-md">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--ink-2)' }}><span>Progression du niveau</span><span>{Math.round(xpInLevel)}%</span></div>
                  <ProgressBar value={xpInLevel} color="var(--accent)" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 shrink-0">
                {[['Moyenne', overall != null ? round1(overall) : '—'], ['Réussite', successRate != null ? `${Math.round(successRate)}%` : '—'], ['Dernière activité', activity[0] ? 'à l’instant' : '—']].map(([label, val]) => (
                  <div key={label} className="text-center px-3 py-2 rounded-2xl glass">
                    <div className="font-display font-bold text-lg">{val}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--ink-2)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {activeTab === 'dashboard' && (
            <DashboardView {...{ overall, controleAvg, tpAvg, efmAvg, regionalAvg, successRate, finishedCount,
              remainingCount, studyHours, setStudyHours, performanceScore, productivityScore, studyScore,
              categoryStats, history, goals, toggleGoal, activity, daysToExam }} />
          )}

          {activeTab === 'modules' && (
            <ModulesView
              modules={filteredModules} allCount={enriched.length}
              filterCat={moduleFilterCat} setFilterCat={setModuleFilterCat}
              filterStatus={moduleFilterStatus} setFilterStatus={setModuleFilterStatus}
              search={moduleSearch} setSearch={setModuleSearch}
              selectedId={selectedModuleId} setSelectedId={setSelectedModuleId}
              onEdit={openEditModule} onCreate={openCreateModule}
            />
          )}

          {(activeTab === 'grades' || GTYPES.some((g) => g.key === activeTab)) && (
            <GradesView modules={enriched} weights={weights} setWeights={setWeights} updateGrade={updateGrade}
              only={GTYPES.some((g) => g.key === activeTab) ? activeTab : null} />
          )}

          {activeTab === 'attendance' && <AttendanceView sessions={sessions} setSessions={setSessions} attendanceRate={attendanceRate} logActivity={logActivity} />}

          {activeTab === 'professors' && (
            <ListManager title="Professors" icon={UserSquare2} items={professors} fieldB="subject"
              placeholderA="Nom du professeur" placeholderB="Matière"
              onAdd={(a, b) => addSimple(setProfessors, { name: a, subject: b }, `Professeur ajouté : ${a}`)}
              onRemove={(id) => removeFrom(setProfessors, id)} />
          )}
          {activeTab === 'students' && (
            <ListManager title="Students" icon={Users} items={students} fieldB="group"
              placeholderA="Nom de l’étudiant" placeholderB="Groupe"
              onAdd={(a, b) => addSimple(setStudents, { name: a, group: b }, `Étudiant ajouté : ${a}`)}
              onRemove={(id) => removeFrom(setStudents, id)} />
          )}

          {activeTab === 'calendar' && <CalendarView examDate={examDate} setExamDate={setExamDate} goals={goals} daysToExam={daysToExam} />}

          {activeTab === 'tasks' && (
            <TasksView tasks={tasks} taskInput={taskInput} setTaskInput={setTaskInput} addTask={addTask}
              toggleTask={toggleTask} removeTask={removeTask}
              selectedIds={selectedTaskIds} toggleSelect={toggleTaskSelect}
              bulkDone={bulkDoneTasks} bulkDelete={bulkDeleteTasks} clearSelection={() => setSelectedTaskIds(new Set())} />
          )}

          {activeTab === 'goals' && <GoalsView goals={goals} toggleGoal={toggleGoal} />}

          {activeTab === 'documents' && (
            <ListManager title="Documents" icon={FileText} items={documents} fieldB="tag"
              placeholderA="Nom du fichier" placeholderB="Catégorie"
              onAdd={(a, b) => addSimple(setDocuments, { name: a, tag: b }, `Document ajouté : ${a}`)}
              onRemove={(id) => removeFrom(setDocuments, id)} />
          )}
          {activeTab === 'notes' && <NotesView notes={notes} setNotes={setNotes} logActivity={logActivity} />}

          {activeTab === 'statistics' && <StatisticsView categoryStats={categoryStats} history={history} enriched={enriched} />}

          {activeTab === 'reports' && <ReportsView {...{ overall, controleAvg, tpAvg, efmAvg, regionalAvg, successRate, completion, attendanceRate, performanceScore }} />}

          {activeTab === 'notifications' && <NotificationsView enriched={enriched} attendanceRate={attendanceRate} activity={activity} />}

          {activeTab === 'ai' && <AiCoachView {...{ overall, categoryStats, attendanceRate, completion, studyHours, weeklyGoalHours }} />}

          {activeTab === 'settings' && (
            <SettingsView weights={weights} setWeights={setWeights} weeklyGoalHours={weeklyGoalHours} setWeeklyGoalHours={setWeeklyGoalHours}
              theme={theme} setTheme={setTheme} accentTheme={accentTheme} setAccentTheme={setAccentTheme}
              avatarFrame={avatarFrame} setAvatarFrame={setAvatarFrame}
              onReset={() => { setModules(RAW_MODULES); logActivity('Notes réinitialisées'); addToast('Toutes les notes ont été réinitialisées', 'bad'); }} />
          )}
        </main>
      </div>

      <ToastStack toasts={toasts} />

      {moduleModalMode && moduleDraft && (
        <Modal title={moduleModalMode === 'create' ? 'Ajouter un module' : 'Modifier le module'} onClose={() => { setModuleModalMode(null); setModuleDraft(null); }}>
          <div className="space-y-3">
            {moduleModalMode === 'create' && (
              <div>
                <label className="text-xs" style={{ color: 'var(--ink-2)' }}>Code (optionnel)</label>
                <input value={moduleDraft.id} onChange={(e) => setModuleDraft((d) => ({ ...d, id: e.target.value }))} placeholder="ex: M214" className="w-full mt-1 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" />
              </div>
            )}
            <div>
              <label className="text-xs" style={{ color: 'var(--ink-2)' }}>Nom du module</label>
              <input value={moduleDraft.name} onChange={(e) => setModuleDraft((d) => ({ ...d, name: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs" style={{ color: 'var(--ink-2)' }}>Heures</label>
                <input type="number" value={moduleDraft.hours} onChange={(e) => setModuleDraft((d) => ({ ...d, hours: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" />
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--ink-2)' }}>Coefficient</label>
                <input type="number" value={moduleDraft.coef} onChange={(e) => setModuleDraft((d) => ({ ...d, coef: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" />
              </div>
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--ink-2)' }}>Catégorie</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CATEGORIES.map((c) => (
                  <Chip key={c.id} active={moduleDraft.cat === c.id} color={c.color} onClick={() => setModuleDraft((d) => ({ ...d, cat: c.id }))}>
                    {c.label.split(' ')[0]}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <RippleButton onClick={saveModuleDraft} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: '#1c1230' }}>
                {moduleModalMode === 'create' ? 'Créer le module' : 'Enregistrer'}
              </RippleButton>
              {moduleModalMode === 'edit' && (
                <RippleButton onClick={() => deleteModule(moduleDraft.id)} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, var(--bad) 18%, transparent)', color: 'var(--bad)' }}>
                  <Trash2 size={15} />
                </RippleButton>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function DashboardView(props) {
  const { overall, controleAvg, tpAvg, efmAvg, regionalAvg, successRate, finishedCount, remainingCount,
    studyHours, setStudyHours, performanceScore, productivityScore, studyScore, categoryStats, history,
    goals, toggleGoal, activity, daysToExam } = props;

  return (
    <div className="space-y-6 anim-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Moyenne générale" value={overall != null ? round1(overall) : '—'} sub="/ 20 · pondérée par coef" icon={TrendingUp} color="var(--accent)" />
        <StatCard label="Taux de réussite" value={successRate != null ? `${Math.round(successRate)}%` : '—'} sub={`${finishedCount} module(s) noté(s)`} icon={CheckCircle2} color="var(--good)" />
        <StatCard label="Modules restants" value={remainingCount} sub="sans note complète" icon={Boxes} color="var(--cat-fabrication)" />
        <StatCard label="Examen final" value={`${daysToExam}j`} sub="jours restants" icon={Flame} color="var(--bad)" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex flex-col items-center"><Donut value={controleAvg} color="var(--cat-langues)" label="Contrôle" /></GlassCard>
        <GlassCard className="p-4 flex flex-col items-center"><Donut value={tpAvg} color="var(--cat-gestion)" label="TP" /></GlassCard>
        <GlassCard className="p-4 flex flex-col items-center"><Donut value={efmAvg} color="var(--cat-analyse)" label="EFM" /></GlassCard>
        <GlassCard className="p-4 flex flex-col items-center"><Donut value={regionalAvg} color="var(--cat-fabrication)" label="Régional" /></GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle eyebrow="Évolution" title="Tendance de la moyenne générale" />
          <Sparkline points={history} />
        </GlassCard>
        <GlassCard className="p-5">
          <SectionTitle title="Scores composites" />
          <div className="space-y-4">
            {[['Performance', performanceScore, 'var(--accent)'], ['Productivité', productivityScore, 'var(--cat-culture)'], ['Étude', studyScore, 'var(--cat-conception)']].map(([l, v, c]) => (
              <div key={l}>
                <div className="flex justify-between text-xs mb-1"><span style={{ color: 'var(--ink-1)' }}>{l}</span><span className="font-mono" style={{ color: 'var(--ink-0)' }}>{v}%</span></div>
                <ProgressBar value={v} color={c} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex flex-col items-center lg:col-span-1">
          <SectionTitle title="Radar par catégorie" />
          <Radar data={categoryStats} />
        </GlassCard>
        <GlassCard className="p-5 lg:col-span-1">
          <SectionTitle title="Heures d’étude" />
          <div className="flex items-center gap-3 mb-2">
            <RippleButton className="glass rounded-lg px-3 py-1.5" onClick={() => setStudyHours((h) => Math.max(0, h - 1))}>−</RippleButton>
            <div className="font-display text-3xl font-bold flex-1 text-center">{studyHours}h</div>
            <RippleButton className="glass rounded-lg px-3 py-1.5" onClick={() => setStudyHours((h) => h + 1)}>+</RippleButton>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--ink-2)' }}>Chaque heure ajoutée augmente l’XP et le niveau instantanément.</p>
        </GlassCard>
        <GlassCard className="p-5 lg:col-span-1">
          <SectionTitle title="Objectifs de la semaine" />
          <div className="space-y-2">
            {goals.weekly.map((g) => (
              <RippleButton key={g.id} onClick={() => toggleGoal('weekly', g.id)} className="w-full flex items-center gap-2 text-sm text-left">
                {g.done ? <CheckCircle2 size={16} color="var(--good)" /> : <Circle size={16} style={{ color: 'var(--ink-2)' }} />}
                <span style={{ color: g.done ? 'var(--ink-2)' : 'var(--ink-0)', textDecoration: g.done ? 'line-through' : 'none' }}>{g.label}</span>
              </RippleButton>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionTitle eyebrow="Journal" title="Dernières activités" />
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {activity.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-center gap-3 text-sm py-1.5" style={{ borderBottom: '1px solid var(--line)' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot shrink-0" style={{ background: 'var(--accent)' }} />
              <span style={{ color: 'var(--ink-1)' }}>{a.text}</span>
              <span className="ml-auto text-xs shrink-0" style={{ color: 'var(--ink-2)' }}>{new Date(a.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ============================================================
   MODULES — now with filters, search, selection & full CRUD
   ============================================================ */
function ModulesView({ modules, allCount, filterCat, setFilterCat, filterStatus, setFilterStatus, search, setSearch, selectedId, setSelectedId, onEdit, onCreate }) {
  return (
    <div className="space-y-5 anim-in">
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-2)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Chercher un module par nom ou code…"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-transparent glass focus-ring" />
          </div>
          <RippleButton onClick={onCreate} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: '#1c1230' }}>
            <Plus size={15} /> Ajouter un module
          </RippleButton>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Chip active={filterCat === 'all'} onClick={() => setFilterCat('all')}>Toutes ({allCount})</Chip>
          {CATEGORIES.map((c) => <Chip key={c.id} active={filterCat === c.id} color={c.color} onClick={() => setFilterCat(c.id)}>{c.label.split(' ')[0]}</Chip>)}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Chip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>Statut : tous</Chip>
          <Chip active={filterStatus === 'done'} onClick={() => setFilterStatus('done')}>Notés</Chip>
          <Chip active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')}>Sans note</Chip>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 stagger">
        {modules.map((m) => {
          const cat = catOf(m.cat);
          const selected = selectedId === m.id;
          return (
            <div key={m.id}
              onClick={() => setSelectedId(selected ? null : m.id)}
              className={`relative rounded-2xl p-4 glass glass-hover cursor-pointer ${selected ? 'selected-card' : ''}`}
              style={{ border: '1px solid var(--glass-border)' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: 'var(--glass-fill-strong)', color: 'var(--ink-2)' }}>{m.id}</span>
                <span className="text-xs font-semibold" style={{ color: cat.color }}>Coef {m.coef}</span>
              </div>
              <div className="text-sm font-medium mb-2 leading-snug">{m.name}</div>
              <div className="flex justify-between items-center text-xs" style={{ color: 'var(--ink-2)' }}>
                <span>{m.hours}h</span>
                <span className="font-mono font-semibold" style={{ color: m.final != null ? 'var(--ink-0)' : 'var(--ink-2)' }}>{m.final != null ? `${round1(m.final)}/20` : 'sans note'}</span>
              </div>
              <div className="mt-2"><ProgressBar value={m.final != null ? (m.final / 20) * 100 : 0} color={cat.color} /></div>

              {selected && (
                <div className="mt-3 pt-3 anim-slide-down flex gap-2" style={{ borderTop: '1px solid var(--line)' }} onClick={(e) => e.stopPropagation()}>
                  <RippleButton onClick={() => onEdit(m)} className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 justify-center glass">
                    <Pencil size={12} /> Modifier
                  </RippleButton>
                </div>
              )}
            </div>
          );
        })}
        {!modules.length && <div className="col-span-full text-center py-10 text-sm" style={{ color: 'var(--ink-2)' }}>Aucun module ne correspond à ce filtre.</div>}
      </div>
    </div>
  );
}

/* ============================================================
   GRADES (shared by Grades / Contrôle / TP / EFM / Régional)
   ============================================================ */
function GradesView({ modules, weights, setWeights, updateGrade, only }) {
  const cols = only ? GTYPES.filter((g) => g.key === only) : GTYPES;
  return (
    <div className="space-y-6 anim-in">
      {!only && (
        <GlassCard className="p-5">
          <SectionTitle eyebrow="Formule" title="Pondération des notes (%)" action={<SlidersHorizontal size={16} style={{ color: 'var(--ink-2)' }} />} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GTYPES.map((g) => (
              <div key={g.key}>
                <div className="flex justify-between text-xs mb-1"><span style={{ color: 'var(--ink-1)' }}>{g.label}</span><span className="font-mono">{weights[g.key]}%</span></div>
                <input type="range" min="0" max="100" value={weights[g.key]} onChange={(e) => setWeights((w) => ({ ...w, [g.key]: Number(e.target.value) }))} className="w-full accent-[var(--accent)]" />
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--ink-2)' }}>La moyenne de chaque module se recalcule automatiquement selon ces poids, en ne comptant que les notes déjà saisies.</p>
        </GlassCard>
      )}

      <GlassCard className="p-5 overflow-x-auto">
        <SectionTitle title={only ? `Notes — ${cols[0].label}` : 'Tableau des notes'} />
        <table className="w-full text-sm">
          <thead><tr className="text-left" style={{ color: 'var(--ink-2)' }}><th className="pb-2 font-medium">Module</th>{cols.map((c) => <th key={c.key} className="pb-2 font-medium text-center">{c.label}</th>)}<th className="pb-2 font-medium text-center">Moyenne</th></tr></thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td className="py-2.5 pr-3"><div className="font-medium">{m.name}</div><div className="text-xs font-mono" style={{ color: 'var(--ink-2)' }}>{m.id}</div></td>
                {cols.map((c) => <td key={c.key} className="py-2.5 text-center"><NumField value={m.grades[c.key]} onChange={(v) => updateGrade(m.id, c.key, v)} /></td>)}
                <td className="py-2.5 text-center font-mono font-semibold" style={{ color: catOf(m.cat).color }}>{m.final != null ? round1(m.final) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

/* ============================================================
   ATTENDANCE
   ============================================================ */
function AttendanceView({ sessions, setSessions, attendanceRate, logActivity }) {
  return (
    <div className="space-y-6 anim-in grid md:grid-cols-3 gap-4">
      <GlassCard className="p-5 md:col-span-1 flex flex-col items-center justify-center"><Donut value={attendanceRate} max={100} color="var(--good)" label="Assiduité" sub={`${sessions.attended}/${sessions.total} séances`} /></GlassCard>
      <GlassCard className="p-5 md:col-span-2">
        <SectionTitle title="Mettre à jour l’assiduité" />
        <div className="flex flex-wrap gap-3">
          <RippleButton className="glass rounded-xl px-4 py-2" onClick={() => { setSessions((s) => ({ ...s, total: s.total + 1, attended: s.attended + 1 })); logActivity('Séance présente ajoutée'); }}>+ Séance présente</RippleButton>
          <RippleButton className="glass rounded-xl px-4 py-2" onClick={() => { setSessions((s) => ({ ...s, total: s.total + 1 })); logActivity('Séance absente ajoutée'); }}>+ Séance absente</RippleButton>
          <RippleButton className="glass rounded-xl px-4 py-2" onClick={() => setSessions({ total: 0, attended: 0 })}>Réinitialiser</RippleButton>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--ink-2)' }}>Le taux d’assiduité alimente directement le score de Performance sur le Dashboard.</p>
      </GlassCard>
    </div>
  );
}

/* ============================================================
   GENERIC LIST MANAGER (Professors / Students / Documents)
   ============================================================ */
function ListManager({ title, icon: Icon, items, fieldB, placeholderA, placeholderB, onAdd, onRemove }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  return (
    <GlassCard className="p-5 anim-in">
      <SectionTitle title={title} action={<Icon size={18} style={{ color: 'var(--ink-2)' }} />} />
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input value={a} onChange={(e) => setA(e.target.value)} placeholder={placeholderA} className="flex-1 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" />
        <input value={b} onChange={(e) => setB(e.target.value)} placeholder={placeholderB} className="flex-1 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" />
        <RippleButton className="glass rounded-xl px-4 py-2 flex items-center gap-1 justify-center" onClick={() => { if (a.trim()) { onAdd(a.trim(), b.trim()); setA(''); setB(''); } }}><Plus size={15} /> Ajouter</RippleButton>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass">
            <span className="font-medium text-sm">{it.name}</span>
            <span className="text-xs ml-2" style={{ color: 'var(--ink-2)' }}>{it[fieldB]}</span>
            <button className="ml-auto press-scale" onClick={() => onRemove(it.id)}><Trash2 size={14} style={{ color: 'var(--bad)' }} /></button>
          </div>
        ))}
        {!items.length && <div className="text-sm text-center py-6" style={{ color: 'var(--ink-2)' }}>Rien pour l’instant.</div>}
      </div>
    </GlassCard>
  );
}

/* ============================================================
   CALENDAR
   ============================================================ */
function CalendarView({ examDate, setExamDate, goals, daysToExam }) {
  return (
    <div className="space-y-6 anim-in grid md:grid-cols-2 gap-4">
      <GlassCard className="p-5">
        <SectionTitle title="Examen final" />
        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring mb-3" />
        <div className="font-display text-3xl font-bold">{daysToExam} <span className="text-base font-normal" style={{ color: 'var(--ink-2)' }}>jours restants</span></div>
      </GlassCard>
      <GlassCard className="p-5">
        <SectionTitle title="Échéances (objectifs)" />
        <div className="space-y-2">
          {[...goals.weekly, ...goals.monthly].map((g) => (
            <div key={g.id} className="flex items-center gap-2 text-sm py-1.5" style={{ borderBottom: '1px solid var(--line)' }}>
              {g.done ? <CheckCircle2 size={15} color="var(--good)" /> : <Circle size={15} style={{ color: 'var(--ink-2)' }} />}
              <span>{g.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ============================================================
   TASKS — with multi-select & bulk actions
   ============================================================ */
function TasksView({ tasks, taskInput, setTaskInput, addTask, toggleTask, removeTask, selectedIds, toggleSelect, bulkDone, bulkDelete, clearSelection }) {
  return (
    <GlassCard className="p-5 anim-in">
      <SectionTitle title="Tâches" action={selectedIds.size > 0 && <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{selectedIds.size} sélectionnée(s)</span>} />

      {selectedIds.size > 0 && (
        <div className="bulk-bar glass-strong anim-slide-down">
          <RippleButton onClick={bulkDone} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: 'color-mix(in srgb, var(--good) 18%, transparent)', color: 'var(--good)' }}><CheckCircle2 size={13} /> Terminer</RippleButton>
          <RippleButton onClick={bulkDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: 'color-mix(in srgb, var(--bad) 18%, transparent)', color: 'var(--bad)' }}><Trash2 size={13} /> Supprimer</RippleButton>
          <button onClick={clearSelection} className="ml-auto text-xs press-scale" style={{ color: 'var(--ink-2)' }}>Annuler</button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="Nouvelle tâche…" className="flex-1 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" />
        <RippleButton onClick={addTask} className="glass rounded-xl px-4 py-2 flex items-center gap-1"><Plus size={15} /> Ajouter</RippleButton>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass">
            <CheckBox checked={selectedIds.has(t.id)} onClick={() => toggleSelect(t.id)} />
            <button onClick={() => toggleTask(t.id)} className="press-scale">{t.done ? <CheckCircle2 size={17} color="var(--good)" /> : <Circle size={17} style={{ color: 'var(--ink-2)' }} />}</button>
            <span className="text-sm" style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--ink-2)' : 'var(--ink-0)' }}>{t.title}</span>
            <button className="ml-auto press-scale" onClick={() => removeTask(t.id)}><Trash2 size={14} style={{ color: 'var(--bad)' }} /></button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ============================================================
   GOALS
   ============================================================ */
function GoalsView({ goals, toggleGoal }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 anim-in">
      {['weekly', 'monthly'].map((scope) => (
        <GlassCard key={scope} className="p-5">
          <SectionTitle title={scope === 'weekly' ? 'Objectifs de la semaine' : 'Objectifs du mois'} />
          <div className="space-y-2">
            {goals[scope].map((g) => (
              <RippleButton key={g.id} onClick={() => toggleGoal(scope, g.id)} className="w-full flex items-center gap-2 text-sm text-left px-3 py-2.5 rounded-xl glass">
                {g.done ? <CheckCircle2 size={16} color="var(--good)" /> : <Circle size={16} style={{ color: 'var(--ink-2)' }} />}
                <span style={{ textDecoration: g.done ? 'line-through' : 'none', color: g.done ? 'var(--ink-2)' : 'var(--ink-0)' }}>{g.label}</span>
              </RippleButton>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ============================================================
   NOTES
   ============================================================ */
function NotesView({ notes, setNotes, logActivity }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return (
    <div className="space-y-4 anim-in">
      <GlassCard className="p-5">
        <SectionTitle title="Nouvelle note" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="w-full px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring mb-2" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Contenu…" rows={3} className="w-full px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring mb-2" />
        <RippleButton className="glass rounded-xl px-4 py-2 flex items-center gap-1" onClick={() => { if (!title.trim()) return; setNotes((n) => [{ id: uid(), title, body }, ...n]); logActivity(`Note ajoutée : ${title}`); setTitle(''); setBody(''); }}><Plus size={15} /> Enregistrer</RippleButton>
      </GlassCard>
      <div className="grid md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <GlassCard key={n.id} className="p-4">
            <div className="flex justify-between items-start mb-1"><div className="font-semibold text-sm">{n.title}</div><button onClick={() => setNotes((list) => list.filter((x) => x.id !== n.id))}><Trash2 size={13} style={{ color: 'var(--bad)' }} /></button></div>
            <p className="text-sm" style={{ color: 'var(--ink-1)' }}>{n.body}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   STATISTICS
   ============================================================ */
function StatisticsView({ categoryStats, history, enriched }) {
  return (
    <div className="space-y-6 anim-in">
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5"><SectionTitle title="Moyenne par catégorie" /><MiniBars data={categoryStats.map((c) => ({ label: c.label, value: c.hasData ? c.value : null, color: c.color }))} /></GlassCard>
        <GlassCard className="p-5 flex flex-col items-center"><SectionTitle title="Vue radar" /><Radar data={categoryStats} /></GlassCard>
      </div>
      <GlassCard className="p-5"><SectionTitle title="Historique de la moyenne générale" /><Sparkline points={history} /></GlassCard>
      <GlassCard className="p-5">
        <SectionTitle title="Répartition par coefficient" />
        <MiniBars max={enriched.length} data={[2, 3, 4, 1].map((coef) => ({ label: `Coef ${coef}`, value: enriched.filter((m) => m.coef === coef).length, color: 'var(--accent)' }))} />
      </GlassCard>
    </div>
  );
}

/* ============================================================
   REPORTS
   ============================================================ */
function ReportsView(props) {
  const { overall, controleAvg, tpAvg, efmAvg, regionalAvg, successRate, completion, attendanceRate, performanceScore } = props;
  const rows = [
    ['Moyenne générale', overall != null ? `${round1(overall)}/20` : '—'],
    ['Moyenne Contrôle', controleAvg != null ? `${round1(controleAvg)}/20` : '—'],
    ['Moyenne TP', tpAvg != null ? `${round1(tpAvg)}/20` : '—'],
    ['Moyenne EFM', efmAvg != null ? `${round1(efmAvg)}/20` : '—'],
    ['Moyenne Régional', regionalAvg != null ? `${round1(regionalAvg)}/20` : '—'],
    ['Taux de réussite', successRate != null ? `${Math.round(successRate)}%` : '—'],
    ['Progression de saisie', `${Math.round(completion)}%`],
    ['Assiduité', `${Math.round(attendanceRate)}%`],
    ['Score de performance', `${performanceScore}%`],
  ];
  return (
    <GlassCard className="p-6 anim-in max-w-2xl">
      <SectionTitle eyebrow={new Date().toLocaleDateString('fr-FR')} title="Rapport de synthèse — Ayoub Taoufik" />
      <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
        {rows.map(([l, v]) => <div key={l} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: '1px solid var(--line)' }}><span style={{ color: 'var(--ink-2)' }}>{l}</span><span className="font-mono font-semibold">{v}</span></div>)}
      </div>
      <p className="text-xs mt-4" style={{ color: 'var(--ink-2)' }}>Généré automatiquement à partir des données actuelles du système — se met à jour à chaque modification.</p>
    </GlassCard>
  );
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function NotificationsView({ enriched, attendanceRate, activity }) {
  const alerts = [];
  enriched.forEach((m) => { if (m.final != null && m.final < 10) alerts.push({ id: m.id, text: `⚠️ ${m.name} est sous la moyenne (${round1(m.final)}/20)`, kind: 'bad' }); });
  if (attendanceRate < 75) alerts.push({ id: 'att', text: `⚠️ Assiduité faible (${Math.round(attendanceRate)}%)`, kind: 'bad' });
  enriched.forEach((m) => { if (m.final != null && m.final >= 16) alerts.push({ id: m.id + '-good', text: `✅ Excellente moyenne en ${m.name} (${round1(m.final)}/20)`, kind: 'good' }); });
  return (
    <div className="space-y-4 anim-in">
      <GlassCard className="p-5">
        <SectionTitle title="Alertes basées sur vos données" />
        <div className="space-y-2">
          {alerts.length ? alerts.map((a) => <div key={a.id} className="text-sm px-3 py-2.5 rounded-xl glass" style={{ color: a.kind === 'bad' ? 'var(--bad)' : 'var(--good)' }}>{a.text}</div>) : <div className="text-sm text-center py-6" style={{ color: 'var(--ink-2)' }}>Aucune alerte — tout va bien 👌</div>}
        </div>
      </GlassCard>
      <GlassCard className="p-5">
        <SectionTitle title="Journal complet" />
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {activity.map((a) => <div key={a.id} className="flex justify-between text-sm py-1.5" style={{ borderBottom: '1px solid var(--line)' }}><span style={{ color: 'var(--ink-1)' }}>{a.text}</span><span className="text-xs shrink-0 ml-3" style={{ color: 'var(--ink-2)' }}>{new Date(a.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>)}
        </div>
      </GlassCard>
    </div>
  );
}

/* ============================================================
   AI COACH (local, rule-based — no external key required)
   ============================================================ */
function AiCoachView({ overall, categoryStats, attendanceRate, completion, studyHours, weeklyGoalHours }) {
  const withData = categoryStats.filter((c) => c.hasData);
  const weakest = withData.length ? withData.reduce((a, b) => (a.value < b.value ? a : b)) : null;
  const strongest = withData.length ? withData.reduce((a, b) => (a.value > b.value ? a : b)) : null;
  const tips = [];
  if (weakest) tips.push(`Concentre tes prochaines heures d’étude sur « ${weakest.label} » — c’est ta catégorie la plus faible (${round1(weakest.value)}/20).`);
  if (attendanceRate < 80) tips.push(`Ton assiduité est à ${Math.round(attendanceRate)}% — vise 90%+ pour sécuriser tes points de contrôle continu.`);
  if (completion < 50) tips.push(`Seulement ${Math.round(completion)}% des notes sont saisies — complète le tableau des notes pour une vue fiable de ta moyenne.`);
  if (studyHours < weeklyGoalHours) tips.push(`Il te manque ${weeklyGoalHours - studyHours}h pour atteindre ton objectif hebdomadaire d’étude.`);
  if (!tips.length) tips.push('Tout est sur les rails — continue sur cette lancée 🚀');
  return (
    <div className="space-y-4 anim-in">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4"><Bot size={20} style={{ color: 'var(--accent)' }} /><h2 className="font-display text-xl font-semibold">Coach d’étude</h2></div>
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-4 glass"><div className="text-xs" style={{ color: 'var(--ink-2)' }}>Point fort</div><div className="font-semibold mt-1">{strongest ? strongest.label : '—'}</div></div>
          <div className="rounded-2xl p-4 glass"><div className="text-xs" style={{ color: 'var(--ink-2)' }}>À renforcer</div><div className="font-semibold mt-1">{weakest ? weakest.label : '—'}</div></div>
        </div>
        <div className="space-y-2">{tips.map((t, i) => <div key={i} className="flex items-start gap-2 text-sm px-3 py-2.5 rounded-xl glass"><Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} /><span>{t}</span></div>)}</div>
        <p className="text-xs mt-4" style={{ color: 'var(--ink-2)' }}>Ce coach analyse localement tes données (aucune clé API requise). Il peut être branché plus tard sur l’API Claude pour des conseils encore plus fins.</p>
      </GlassCard>
    </div>
  );
}

/* ============================================================
   SETTINGS — theme picker, avatar frame, weekly goal, danger zone
   ============================================================ */
function SettingsView({ weeklyGoalHours, setWeeklyGoalHours, theme, setTheme, accentTheme, setAccentTheme, avatarFrame, setAvatarFrame, onReset }) {
  return (
    <div className="space-y-4 anim-in max-w-xl">
      <GlassCard className="p-5">
        <SectionTitle title="Apparence" action={<Sun size={16} style={{ color: 'var(--ink-2)' }} />} />
        <div className="flex gap-2">
          {['dark', 'light'].map((t) => (
            <RippleButton key={t} onClick={() => setTheme(t)} className="flex-1 py-2.5 rounded-xl text-sm glass" style={{ border: theme === t ? '1px solid var(--accent)' : '1px solid var(--glass-border)', color: theme === t ? 'var(--accent)' : 'var(--ink-1)' }}>
              {t === 'dark' ? 'Sombre' : 'Clair'}
            </RippleButton>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionTitle title="Couleur d’accentuation" action={<Palette size={16} style={{ color: 'var(--ink-2)' }} />} />
        <div className="flex flex-wrap gap-3">
          {ACCENT_THEMES.map((t) => (
            <button key={t.id} onClick={() => setAccentTheme(t.id)} title={t.label}
              className={`swatch ${accentTheme === t.id ? 'active' : ''}`}
              style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }} />
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--ink-2)' }}>Choisis la teinte liquid-glass de tout le système — appliquée instantanément partout.</p>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionTitle title="Cadre de la photo de profil" action={<ImageIcon size={16} style={{ color: 'var(--ink-2)' }} />} />
        <div className="flex items-center gap-4">
          <Avatar size={64} frame={avatarFrame} rounded="rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            {FRAME_STYLES.map((f) => <Chip key={f.id} active={avatarFrame === f.id} onClick={() => setAvatarFrame(f.id)}>{f.label}</Chip>)}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionTitle title="Objectif hebdomadaire d’étude" />
        <input type="number" min="1" value={weeklyGoalHours} onChange={(e) => setWeeklyGoalHours(Number(e.target.value) || 1)} className="w-24 px-3 py-2 rounded-xl bg-transparent glass text-sm focus-ring" /> <span className="text-sm ml-2" style={{ color: 'var(--ink-2)' }}>heures / semaine</span>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionTitle title="Zone dangereuse" />
        <RippleButton onClick={onReset} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, var(--bad) 15%, transparent)', color: 'var(--bad)' }}>Réinitialiser toutes les notes</RippleButton>
      </GlassCard>
    </div>
  );
}
