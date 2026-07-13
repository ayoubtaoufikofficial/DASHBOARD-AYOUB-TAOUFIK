import { useState, useMemo } from 'react';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, ClipboardList,
  FileCheck2, CalendarCheck2, Timer, ListChecks, CalendarDays,
  FolderClosed, NotebookPen, Target, BarChart3, Sparkles, Bell,
  Settings, Menu, Search, Clock, Layers,
} from 'lucide-react';

// ============================================================================
// بيانات الوحدات الدراسية — مطابقة لشجرة TSMFM السنة الثانية (18 وحدة + تدريب)
// ============================================================================
const CATEGORIES = [
  { id: 'lang', label: 'اللغات والتواصل', color: '#c084fc' },
  { id: 'culture', label: 'الثقافة والتنمية الذاتية', color: '#34d399' },
  { id: 'gestion', label: 'التدبير والتنظيم الصناعي', color: '#fb923c' },
  { id: 'analyse', label: 'التحليل والمناهج', color: '#f472b6' },
  { id: 'conception', label: 'التصميم والتجهيزات', color: '#38bdf8' },
  { id: 'fabrication', label: 'الصنع والإنتاج (جوهر المهنة)', color: '#facc15' },
];

const SUBJECTS = [
  { code: 'EGTS202', name: 'Français', hours: 115, coef: 2, cat: 'lang' },
  { code: 'EGTS203', name: 'Anglais technique', hours: 50, coef: 2, cat: 'lang' },

  { code: 'EGTS204', name: 'Culture entrepreneuriale', hours: 45, coef: 2, cat: 'culture' },
  { code: 'EGTS205', name: 'Compétences comportementales', hours: 30, coef: 2, cat: 'culture' },
  { code: 'EGTSI206', name: 'Culture et techniques intermédiaires du numérique', hours: 30, coef: 1, cat: 'culture' },

  { code: 'M205', name: 'Gestion de la production', hours: 30, coef: 2, cat: 'gestion' },
  { code: 'M207', name: 'Calcul du prix de revient industriel et établissement du devis', hours: 30, coef: 2, cat: 'gestion' },
  { code: 'M208', name: 'Optimisation et amélioration de la production', hours: 42, coef: 2, cat: 'gestion' },
  { code: 'M210', name: "Conduite et gestion de projets d'industrialisation", hours: 40, coef: 2, cat: 'gestion' },
  { code: 'M212', name: 'Démarche qualité', hours: 15, coef: 1, cat: 'gestion' },

  { code: 'M201', name: 'Analyse de produits et gamme de montage', hours: 45, coef: 2, cat: 'analyse' },
  { code: 'M202', name: 'Détermination des temps de fabrication', hours: 30, coef: 2, cat: 'analyse' },
  { code: 'M204', name: 'Statistiques en production', hours: 30, coef: 2, cat: 'analyse' },

  { code: 'M206', name: "Conception et Dessin d'outillages de production", hours: 88, coef: 4, cat: 'conception' },

  { code: 'M203', name: 'Élaboration et Constitution des dossiers de fabrication', hours: 90, coef: 4, cat: 'fabrication' },
  { code: 'M209', name: 'Programmation, réglage et conduite des MOCN', hours: 90, coef: 4, cat: 'fabrication' },
  { code: 'M211', name: 'CAO / FAO', hours: 70, coef: 3, cat: 'fabrication' },
];

const STAGE = { code: 'M213', name: 'Intégration en milieu de travail', duration: '4 أسابيع' };

// سجل التنقل — إضافة وحدة جديدة لاحقاً = سطر واحد هنا
const NAV_GROUPS = [
  { label: 'عام', items: [{ id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard }] },
  {
    label: 'الجانب الأكاديمي',
    items: [
      { id: 'modules', label: 'الوحدات الدراسية', icon: BookOpen },
      { id: 'professors', label: 'الأساتذة', icon: Users },
      { id: 'students', label: 'الزملاء', icon: GraduationCap },
      { id: 'grades', label: 'النقط', icon: ClipboardList },
      { id: 'exams', label: 'الامتحانات', icon: FileCheck2 },
      { id: 'attendance', label: 'الحضور', icon: CalendarCheck2 },
    ],
  },
  {
    label: 'الإنتاجية',
    items: [
      { id: 'sessions', label: 'جلسات المراجعة', icon: Timer },
      { id: 'tasks', label: 'المهام', icon: ListChecks },
      { id: 'calendar', label: 'التقويم', icon: CalendarDays },
      { id: 'goals', label: 'الأهداف', icon: Target },
    ],
  },
  {
    label: 'المعرفة والتحليلات',
    items: [
      { id: 'documents', label: 'الوثائق', icon: FolderClosed },
      { id: 'notes', label: 'الملاحظات', icon: NotebookPen },
      { id: 'statistics', label: 'الإحصائيات', icon: BarChart3 },
      { id: 'ai', label: 'المساعد الذكي', icon: Sparkles },
    ],
  },
  {
    label: 'النظام',
    items: [
      { id: 'notifications', label: 'الإشعارات', icon: Bell },
      { id: 'settings', label: 'الإعدادات', icon: Settings },
    ],
  },
];

const catInfo = (id) => CATEGORIES.find((c) => c.id === id);

// ============================================================================
// عناصر واجهة زجاجية قابلة لإعادة الاستخدام
// ============================================================================
function GlassPanel({ children, className = '' }) {
  return (
    <div
      className={
        'relative rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-2xl ' +
        'shadow-[0_8px_32px_rgba(0,0,0,0.35)] before:absolute before:inset-x-0 before:top-0 ' +
        'before:h-px before:rounded-t-3xl before:bg-gradient-to-r before:from-transparent ' +
        'before:via-white/60 before:to-transparent ' +
        className
      }
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon, accent }) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/60">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: `${accent}22`, color: accent }}>
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-medium" style={{ color: accent }}>{value}</span>
        {unit && <span className="text-xs text-white/40">{unit}</span>}
      </div>
    </GlassPanel>
  );
}

function CategoryBadge({ catId }) {
  const c = catInfo(catId);
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-medium"
      style={{ background: `${c.color}1f`, color: c.color, border: `1px solid ${c.color}40` }}
    >
      {c.label}
    </span>
  );
}

function ComingSoon({ icon: Icon, title }) {
  return (
    <GlassPanel className="flex flex-col items-center gap-3 p-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-dashed border-fuchsia-300/40 text-fuchsia-300">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <p className="text-sm text-white/70">قريباً — {title}</p>
      <p className="max-w-xs text-xs text-white/40">
        هذه الوحدة جاهزة في نظام التنقل وستُبنى بنفس تصميم الزجاج السائل.
      </p>
    </GlassPanel>
  );
}

// ============================================================================
// صفحة: لوحة القيادة
// ============================================================================
function Dashboard() {
  const totalHours = useMemo(() => SUBJECTS.reduce((s, m) => s + m.hours, 0), []);
  const coefCounts = useMemo(() => {
    const acc = { 4: 0, 3: 0, 2: 0, 1: 0 };
    SUBJECTS.forEach((m) => (acc[m.coef] += 1));
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        code="DSH · 01"
        title="لوحة القيادة"
        desc="نظرة عامة على السنة الثانية TSMFM — 18 وحدة موزعة على 6 محاور + التدريب."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="إجمالي الوحدات" value="18" unit="+ تدريب" icon={Layers} accent="#c084fc" />
        <StatCard label="إجمالي الساعات" value={totalHours} unit="سا" icon={Clock} accent="#38bdf8" />
        <StatCard label="وحدات معامل 4" value={coefCounts[4]} unit="وحدات إستراتيجية" icon={FileCheck2} accent="#facc15" />
        <StatCard label="التدريب" value={STAGE.duration} icon={Target} accent="#34d399" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassPanel className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/90">توزيع الوحدات حسب المحور</h3>
          <ul className="space-y-3">
            {CATEGORIES.map((c) => {
              const count = SUBJECTS.filter((m) => m.cat === c.id).length;
              const pct = Math.round((count / SUBJECTS.length) * 100);
              return (
                <li key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-white/70">{c.label}</span>
                    <span className="font-mono text-white/50">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/90">توزيع المعامِلات (Coefficients)</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(coefCounts).reverse().map(([coef, count]) => (
              <div key={coef} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="font-mono text-xl text-white">{count}</p>
                <p className="text-[11px] text-white/50">وحدات بمعامل {coef}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

// ============================================================================
// صفحة: الوحدات الدراسية
// ============================================================================
function ModulesPage() {
  return (
    <div className="space-y-6">
      <PageHeader code="MOD · 02" title="الوحدات الدراسية" desc="شجرة الوحدات الكاملة لبرنامج TSMFM السنة الثانية." />

      {CATEGORIES.map((cat) => {
        const items = SUBJECTS.filter((m) => m.cat === cat.id);
        return (
          <div key={cat.id}>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
              <h3 className="text-sm font-semibold text-white/85">{cat.label}</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((m) => (
                <GlassPanel key={m.code} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[11px]" style={{ color: cat.color }}>{m.code}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                      Coef {m.coef}
                    </span>
                  </div>
                  <p className="text-[13px] leading-snug text-white/85">{m.name}</p>
                  <p className="mt-2 text-[11px] text-white/40">{m.hours} ساعة</p>
                </GlassPanel>
              ))}
            </div>
          </div>
        );
      })}

      <GlassPanel className="flex items-center justify-between p-4">
        <div>
          <span className="font-mono text-[11px] text-emerald-300">{STAGE.code}</span>
          <p className="text-[13px] text-white/85">{STAGE.name}</p>
        </div>
        <CategoryBadge catId="fabrication" />
        <span className="text-[11px] text-white/50">{STAGE.duration}</span>
      </GlassPanel>
    </div>
  );
}

function PageHeader({ code, title, desc }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-[11px] text-fuchsia-300">{code}</span>
        <span className="h-px w-8 bg-fuchsia-300/40" />
      </div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {desc && <p className="mt-1 max-w-xl text-[13px] text-white/50">{desc}</p>}
    </div>
  );
}

// ============================================================================
// التخطيط العام — Sidebar + Topbar + محتوى الصفحة النشطة
// ============================================================================
function Sidebar({ active, onSelect, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={onClose} />}
      <aside
        className={
          'fixed z-30 h-screen w-64 shrink-0 overflow-y-auto border-e border-white/10 bg-white/[0.04] ' +
          'p-4 backdrop-blur-2xl transition-transform md:sticky md:top-0 md:translate-x-0 ' +
          (open ? 'translate-x-0' : 'translate-x-full md:translate-x-0')
        }
        style={{ insetInlineEnd: 0 }}
      >
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-cyan-400 font-mono text-[11px] font-semibold text-black">
            STOS
          </span>
          <div>
            <p className="text-sm font-semibold text-white">بوصلة الدراسة</p>
            <p className="font-mono text-[10px] text-white/40">Study OS · TSMFM</p>
          </div>
        </div>

        <nav className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-2 font-mono text-[10px] uppercase tracking-wide text-white/35">{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item.id); onClose?.(); }}
                    className={
                      'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition ' +
                      (isActive
                        ? 'border-e-2 border-fuchsia-400 bg-fuchsia-400/15 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white/90')
                    }
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function Topbar({ activeLabel, onMenu }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-white/10 bg-black/20 px-5 backdrop-blur-xl">
      <button onClick={onMenu} className="text-white/70 md:hidden">
        <Menu size={19} />
      </button>
      <h2 className="text-[15px] font-semibold text-white">{activeLabel}</h2>
      <div className="ms-auto hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
        <Search size={14} className="text-white/40" />
        <input placeholder="بحث سريع..." className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/30" />
      </div>
      <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70">
        <Bell size={16} />
      </button>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-cyan-400 text-sm font-semibold text-black">
        A
      </span>
    </header>
  );
}

// ============================================================================
// الجذر
// ============================================================================
const PAGE_LABELS = Object.fromEntries(NAV_GROUPS.flatMap((g) => g.items).map((i) => [i.id, i.label]));

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stubIcon = (id) => NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === id)?.icon ?? Sparkles;

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden bg-[#0a0714] text-white">
      {/* خلفية الزجاج السائل: توهجات لونية عائمة خلف كل شيء */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-fuchsia-600/30 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 h-[380px] w-[380px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-violet-700/25 blur-[110px]" />
      </div>

      <div className="flex">
        <Sidebar active={active} onSelect={setActive} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar activeLabel={PAGE_LABELS[active]} onMenu={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-7">
            {active === 'dashboard' && <Dashboard />}
            {active === 'modules' && <ModulesPage />}
            {active !== 'dashboard' && active !== 'modules' && (
              <div className="space-y-6">
                <PageHeader code="—" title={PAGE_LABELS[active]} />
                <ComingSoon icon={stubIcon(active)} title={PAGE_LABELS[active]} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
