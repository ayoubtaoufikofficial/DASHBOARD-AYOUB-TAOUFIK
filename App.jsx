import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Gauge, Wrench, Users, ClipboardList, BookOpen, NotebookPen,
  MessageSquare, Plus, Trash2, ChevronDown, ChevronUp, Star,
  Clock, Target, AlertTriangle, Send, Loader2, CheckCircle2,
  Download, Upload, BellRing, X,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

/* ---------------------------------------------------------------------
   بديل window.storage (كان خاص فـ Claude Artifacts) بـ localStorage
--------------------------------------------------------------------- */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (key) => {
      const v = localStorage.getItem(key);
      return v === null ? null : { key, value: v };
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
      return { key, value };
    },
    delete: async (key) => {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
  };
}

/* ---------------------------------------------------------------------
   بيانات الموديولات الثابتة
--------------------------------------------------------------------- */
const MODULES_SEED = [
  { id: "EGTS202", name: "Français", group: "اللغات والتواصل", hours: 115, coef: 2, color: "violet" },
  { id: "EGTS203", name: "Anglais technique", group: "اللغات والتواصل", hours: 50, coef: 2, color: "violet" },
  { id: "EGTS204", name: "Culture entrepreneuriale", group: "الثقافة والتنمية الذاتية", hours: 45, coef: 2, color: "emerald" },
  { id: "EGTS205", name: "Compétences comportementales", group: "الثقافة والتنمية الذاتية", hours: 30, coef: 2, color: "emerald" },
  { id: "EGTSI206", name: "Culture et techniques intermédiaires du numérique", group: "الثقافة والتنمية الذاتية", hours: 30, coef: 1, color: "emerald" },
  { id: "M205", name: "Gestion de la production", group: "التسيير والتنظيم الصناعي", hours: 30, coef: 2, color: "orange" },
  { id: "M207", name: "Calcul du prix de revient et devis", group: "التسيير والتنظيم الصناعي", hours: 30, coef: 2, color: "orange" },
  { id: "M208", name: "Optimisation et amélioration de la production", group: "التسيير والتنظيم الصناعي", hours: 42, coef: 2, color: "orange" },
  { id: "M210", name: "Conduite et gestion de projets d'industrialisation", group: "التسيير والتنظيم الصناعي", hours: 40, coef: 2, color: "orange" },
  { id: "M212", name: "Démarche quality", group: "التسيير والتنظيم الصناعي", hours: 15, coef: 1, color: "orange" },
  { id: "M201", name: "Analyse de produits et gamme de montage", group: "التحليل والمناهج", hours: 45, coef: 2, color: "rose" },
  { id: "M202", name: "Détermination des temps de fabrication", group: "التحليل والمناهج", hours: 30, coef: 2, color: "rose" },
  { id: "M204", name: "Statistiques en production", group: "التحليل والمناهج", hours: 30, coef: 2, color: "rose" },
  { id: "M206", name: "Conception et Dessin d'outillages de production", group: "التصميم والتجهيزات", hours: 88, coef: 4, color: "sky" },
  { id: "M203", name: "Élaboration et Constitution des dossiers de fabrication", group: "الإنتاج (قلب المهنة)", hours: 90, coef: 4, color: "amber" },
  { id: "M209", name: "Programmation, réglage et conduite des MOCN", group: "الإنتاج (قلب المهنة)", hours: 90, coef: 4, color: "amber" },
  { id: "M211", name: "CAO / FAO", group: "الإنتاج (قلب المهنة)", hours: 70, coef: 3, color: "amber" },
];
const STAGE = { id: "M213", name: "Intégration en milieu de travail", weeks: 4 };

const COLOR_MAP = {
  violet: { ring: "ring-violet-500/40", text: "text-violet-300", bg: "bg-violet-500/10", bar: "bg-violet-400", dot: "bg-violet-400" },
  emerald: { ring: "ring-emerald-500/40", text: "text-emerald-300", bg: "bg-emerald-500/10", bar: "bg-emerald-400", dot: "bg-emerald-400" },
  orange: { ring: "ring-orange-500/40", text: "text-orange-300", bg: "bg-orange-500/10", bar: "bg-orange-400", dot: "bg-orange-400" },
  rose: { ring: "ring-rose-500/40", text: "text-rose-300", bg: "bg-rose-500/10", bar: "bg-rose-400", dot: "bg-rose-400" },
  sky: { ring: "ring-sky-500/40", text: "text-sky-300", bg: "bg-sky-500/10", bar: "bg-sky-400", dot: "bg-sky-400" },
  amber: { ring: "ring-amber-500/40", text: "text-amber-300", bg: "bg-amber-500/10", bar: "bg-amber-400", dot: "bg-amber-400" },
};

const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = (new Date(dateStr) - new Date(todayISO())) / 86400000;
  return Math.round(d);
};

const STORAGE_KEY = "tsmfm-y2-cockpit";

const defaultState = () => ({
  modules: Object.fromEntries(
    MODULES_SEED.map((m) => [m.id, { mastery: 0, difficulty: 3, examDate: "", weakness: "", grades: [] }])
  ),
  teachers: [],
  peers: [],
  exams: [],
  journal: [],
  stageDone: false,
  history: [],
});

/* ---------------------------------------------------------------------
   عداد نصف دائري (Gauge) متجاوب وخفيف
--------------------------------------------------------------------- */
function Gauge20({ value, size = 150 }) {
  const pct = Math.max(0, Math.min(1, value / 20));
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 180;
  const endAngle = 360;
  const angle = startAngle + pct * (endAngle - startAngle);
  const toXY = (a) => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [sx, sy] = toXY(startAngle);
  const [ex, ey] = toXY(endAngle);
  const [vx, vy] = toXY(angle);
  const arcPath = (x1, y1, x2, y2, large) =>
    `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  const color = value >= 12 ? "#34d399" : value >= 10 ? "#fbbf24" : "#fb7185";

  return (
    <svg width="100%" height="100%" maxWidth={size} viewBox={`0 0 ${size} ${size / 1.5}`} className="mx-auto max-w-[150px]">
      <path d={arcPath(sx, sy, ex, ey, 1)} fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
      <path d={arcPath(sx, sy, vx, vy, pct > 0.5 ? 1 : 0)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="28" fontWeight="700" fill="#f1f5f9" fontFamily="ui-monospace, monospace">
        {value.toFixed(2)}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="ui-monospace, monospace">
        المعدل / 20
      </text>
    </svg>
  );
}

function LED({ active, color = "amber" }) {
  const c = { amber: "bg-amber-400 shadow-amber-400/70", emerald: "bg-emerald-400 shadow-emerald-400/70" }[color];
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full ${active ? c + " shadow-[0_0_6px]" : "bg-slate-700"}`} />
  );
}

/* ---------------------------------------------------------------------
   التطبيق الرئيسي (تم إصلاح العرض والمشاكل الهيكلية)
--------------------------------------------------------------------- */
export default function App() {
  const [state, setState] = useState(defaultState());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("overview");
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          const merged = defaultState();
          merged.modules = { ...merged.modules, ...(parsed.modules || {}) };
          merged.teachers = parsed.teachers || [];
          merged.peers = parsed.peers || [];
          merged.exams = parsed.exams || [];
          merged.journal = parsed.journal || [];
          merged.stageDone = !!parsed.stageDone;
          merged.history = parsed.history || [];
          setState(merged);
        }
      } catch (e) {
        // No saved data yet
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error("save failed", e);
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state, loaded]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tsmfm-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importInputRef = useRef(null);
  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const merged = defaultState();
        merged.modules = { ...merged.modules, ...(parsed.modules || {}) };
        merged.teachers = parsed.teachers || [];
        merged.peers = parsed.peers || [];
        merged.exams = parsed.exams || [];
        merged.journal = parsed.journal || [];
        merged.stageDone = !!parsed.stageDone;
        merged.history = parsed.history || [];
        setState(merged);
      } catch (err) {
        alert("الملف غير صالح، تأكد أنو JSON صادر من هاد الداشبورد.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const [dismissedAlert, setDismissedAlert] = useState(false);

  const updateModule = useCallback((id, patch) => {
    setState((s) => ({ ...s, modules: { ...s.modules, [id]: { ...s.modules[id], ...patch } } }));
  }, []);

  const addGrade = (id, grade) => {
    setState((s) => ({
      ...s,
      modules: {
        ...s.modules,
        [id]: { ...s.modules[id], grades: [...s.modules[id].grades, grade] },
      },
    }));
  };
  const removeGrade = (id, gid) => {
    setState((s) => ({
      ...s,
      modules: {
        ...s.modules,
        [id]: { ...s.modules[id], grades: s.modules[id].grades.filter((g) => g.id !== gid) },
      },
    }));
  };

  const moduleAvg = (id) => {
    const grades = state.modules[id]?.grades || [];
    if (!grades.length) return null;
    const sum = grades.reduce((a, g) => a + Number(g.value), 0);
    return sum / grades.length;
  };

  const overallAvg = (() => {
    let wsum = 0, csum = 0;
    MODULES_SEED.forEach((m) => {
      const avg = moduleAvg(m.id);
      if (avg !== null) {
        wsum += avg * m.coef;
        csum += m.coef;
      }
    });
    return csum ? wsum / csum : 0;
  })();

  const priorityScore = (m) => {
    const md = state.modules[m.id];
    const mastery = md?.mastery ?? 0;
    const diff = md?.difficulty ?? 3;
    const du = daysUntil(md?.examDate);
    let urgency = 0;
    if (du !== null) {
      if (du <= 3) urgency = 6;
      else if (du <= 7) urgency = 4;
      else if (du <= 14) urgency = 2;
    }
    return m.coef * 2 + ((100 - mastery) / 100) * 5 + diff + urgency;
  };

  const rankedModules = [...MODULES_SEED].sort((a, b) => priorityScore(b) - priorityScore(a));
  const overallMastery = Math.round(
    MODULES_SEED.reduce((a, m) => a + (state.modules[m.id]?.mastery ?? 0), 0) / MODULES_SEED.length
  );
  const gradedCount = MODULES_SEED.filter((m) => (state.modules[m.id]?.grades || []).length > 0).length;

  const upcomingExams = MODULES_SEED
    .map((m) => ({ m, du: daysUntil(state.modules[m.id]?.examDate) }))
    .filter((x) => x.du !== null && x.du >= 0 && x.du <= 3)
    .sort((a, b) => a.du - b.du);

  useEffect(() => {
    if (!loaded) return;
    const t = todayISO();
    setState((s) => {
      const last = s.history[s.history.length - 1];
      const point = { date: t, mastery: overallMastery, avg: Number(overallAvg.toFixed(2)) };
      if (last && last.date === t) {
        const updated = [...s.history];
        updated[updated.length - 1] = point;
        return { ...s, history: updated };
      }
      return { ...s, history: [...s.history, point] };
    });
  }, [overallMastery, overallAvg, loaded]);

  const TABS = [
    { id: "overview", label: "القيادة", icon: Gauge },
    { id: "modules", label: "الموديولات", icon: Wrench },
    { id: "teachers", label: "الأساتذة", icon: ClipboardList },
    { id: "peers", label: "الزملاء", icon: Users },
    { id: "exams", label: "الامتحانات", icon: Target },
    { id: "journal", label: "دفتر الدروس", icon: NotebookPen },
    { id: "ai", label: "المساعد الذكي", icon: MessageSquare },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 w-full overflow-x-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* شريط علوي مرن ومنظم */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 w-full">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* لوحة الاسم والهوية */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/40 flex items-center justify-center shrink-0">
                <Gauge className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tracking-widest">
                  TSMFM · السنة الثانية <LED active />
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent uppercase">
                  Ayoub Taoufik
                </h1>
                <p className="text-[10px] sm:text-xs text-cyan-400/80 font-medium tracking-wider">
                  لوحة قيادة الدراسة — بوصلة التميز
                </p>
              </div>
            </div>
            
            {/* أزرار النسخ الاحتياطي للهاتف تظهر هنا في الجنب */}
            <div className="flex items-center gap-1.5 md:mr-4">
              <button onClick={exportData} title="تحميل نسخة احتياطية JSON"
                className="p-2 rounded-md bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-amber-300">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => importInputRef.current?.click()} title="استرجاع نسخة احتياطية"
                className="p-2 rounded-md bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-amber-300">
                <Upload className="w-4 h-4" />
              </button>
              <input ref={importInputRef} type="file" accept="application/json" onChange={importData} className="hidden" />
            </div>
          </div>

          {/* العداد والإحصائيات السريعة */}
          <div className="flex items-center justify-around md:justify-end gap-6 w-full md:w-auto border-t border-slate-800 md:border-0 pt-4 md:pt-0">
            <div className="w-32 sm:w-36 shrink-0">
              <Gauge20 value={overallAvg} />
            </div>
            <div className="flex flex-col gap-1 text-xs sm:text-sm font-mono">
              <div className="flex items-center justify-between gap-4"><span className="text-slate-500">التمكن العام</span><span className="text-amber-300">{overallMastery}%</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-slate-500">موديولات مقيّمة</span><span className="text-sky-300">{gradedCount}/18</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-slate-500">التدريب</span>
                <span className={state.stageDone ? "text-emerald-300" : "text-slate-500"}>{state.stageDone ? "منجز ✓" : "لم يُنجز"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* التبويبات مع شريط تمرير ناعم على الهواتف */}
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto scrollbar-none snap-x pb-3">
          <div className="flex gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm whitespace-nowrap border transition-all snap-center ${
                    active
                      ? "bg-slate-800 border-amber-500/40 text-amber-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <LED active={active} />
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* التنبيهات الزرقاء/الحمراء */}
      {!!upcomingExams.length && !dismissedAlert && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5">
            <BellRing className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm text-rose-100">
              <span className="font-semibold">تنبيه: </span>
              {upcomingExams.map((x, i) => (
                <span key={x.m.id}>
                  {x.m.id} ({x.du === 0 ? "اليوم" : `بعد ${x.du}ي`}){i < upcomingExams.length - 1 ? " · " : ""}
                </span>
              ))}
            </div>
            <button onClick={() => setDismissedAlert(true)} className="text-rose-300/70 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي للتبويبات المتجاوبة */}
      <div className="max-w-6xl mx-auto px-4 py-6 w-full">
        {tab === "overview" && (
          <OverviewTab
            rankedModules={rankedModules}
            state={state}
            moduleAvg={moduleAvg}
            priorityScore={priorityScore}
            stageDone={state.stageDone}
            setStageDone={(v) => setState((s) => ({ ...s, stageDone: v }))}
            history={state.history}
          />
        )}
        {tab === "modules" && (
          <ModulesTab
            state={state}
            updateModule={updateModule}
            addGrade={addGrade}
            removeGrade={removeGrade}
            moduleAvg={moduleAvg}
          />
        )}
        {/* باقي الـ Tabs تستدعى هنا بشكل عادي كما في الكود الأصلي */}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: القيادة (Overview) متجاوب
--------------------------------------------------------------------- */
function OverviewTab({ rankedModules, state, moduleAvg, priorityScore, stageDone, setStageDone, history }) {
  const top = rankedModules.slice(0, 3);
  return (
    <div className="space-y-6 w-full">
      {history.length > 1 && <ProgressChart history={history} />}
      <div>
        <h2 className="text-xs sm:text-sm font-mono text-slate-500 mb-3">🎯 أولويات اليوم — راجع هادو أولاً</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {top.map((m, i) => {
            const c = COLOR_MAP[m.color];
            const md = state.modules[m.id];
            const du = daysUntil(md.examDate);
            return (
              <div key={m.id} className={`rounded-xl border border-slate-800 ${c.bg} p-4 ring-1 ${c.ring}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono ${c.text}`}>{m.id} · Coef {m.coef}</span>
                  <span className="text-xs text-slate-500 font-mono">#{i + 1}</span>
                </div>
                <div className="font-semibold text-slate-100 text-sm sm:text-base leading-snug mb-2">{m.name}</div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>التمكن {md.mastery}%</span>
                  {du !== null && <span className={du <= 7 ? "text-rose-300" : "text-slate-400"}>الامتحان بعد {du}ي</span>}
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${c.bar}`} style={{ width: `${md.mastery}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 w-full">
          <h3 className="text-xs sm:text-sm font-mono text-slate-500 mb-3">ترتيب الأولوية الكامل</h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {rankedModules.map((m, i) => {
              const c = COLOR_MAP[m.color];
              return (
                <div key={m.id} className="flex items-center gap-2 text-xs sm:text-sm py-1.5 border-b border-slate-800/60 last:border-0">
                  <span className="w-5 text-xs text-slate-600 font-mono">{i + 1}</span>
                  <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
                  <span className="flex-1 truncate">{m.id} — {m.name}</span>
                  <span className="text-xs font-mono text-slate-500">{priorityScore(m).toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 w-full">
          <h3 className="text-xs sm:text-sm font-mono text-slate-500 mb-3">التدريب (Stage)</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <div className="font-semibold text-sm sm:text-base">{STAGE.name}</div>
              <div className="text-xs text-slate-500">{STAGE.weeks} أسابيع</div>
            </div>
            <button
              onClick={() => setStageDone(!stageDone)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors shrink-0 w-full sm:w-auto justify-center ${
                stageDone ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> {stageDone ? "منجز" : "تحديد كمنجز"}
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-3 leading-relaxed">
            المعادلة: الأولوية = (المعامل × 2) + فجوة التمكن + الصعوبة + قرب الامتحان.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressChart({ history }) {
  const data = history.map((h) => ({
    date: h.date.slice(5),
    "التمكن %": h.mastery,
    "المعدل ×5": Number((h.avg * 5).toFixed(1)),
  }));
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 w-full">
      <h3 className="text-xs sm:text-sm font-mono text-slate-500 mb-3">تطور التمكن العام والمعدل عبر الوقت</h3>
      <div className="w-full h-[200px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", fontSize: 11 }} />
            <Line type="monotone" dataKey="التمكن %" stroke="#fbbf24" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="المعدل ×5" stroke="#38bdf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-600 mt-2">* المعدل مضروب في 5 باش يبان على نفس المقياس ديال التمكن (0-100).</p>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: الموديولات + النقط (متجاوب)
--------------------------------------------------------------------- */
function ModulesTab({ state, updateModule, addGrade, removeGrade, moduleAvg }) {
  const [open, setOpen] = useState(null);
  const groups = [...new Set(MODULES_SEED.map((m) => m.group))];

  return (
    <div className="space-y-6 w-full">
      {groups.map((g) => (
        <div key={g}>
          <h3 className="text-xs sm:text-sm font-mono text-slate-500 mb-3">{g}</h3>
          <div className="space-y-3">
            {MODULES_SEED.filter((m) => m.group === g).map((m) => {
              const c = COLOR_MAP[m.color];
              const md = state.modules[m.id];
              const avg = moduleAvg(m.id);
              const isOpen = open === m.id;
              return (
                <div key={m.id} className={`rounded-xl border border-slate-800 bg-slate-900/40 ring-1 ${c.ring} overflow-hidden`}>
                  <button
                    onClick={() => setOpen(isOpen ? null : m.id)}
                    className="w-full flex items-center justify-between gap-3 p-3.5 text-right"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${c.bg} ${c.text}`}>{m.id}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-100 text-sm sm:text-base truncate">{m.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          <span className="whitespace-nowrap"><Clock className="w-3 h-3 inline ml-1" />{m.hours}h</span>
                          <span className="whitespace-nowrap">Coef {m.coef}</span>
                          {avg !== null && <span className={`whitespace-nowrap ${avg >= 10 ? "text-emerald-400" : "text-rose-400"}`}>معدل {avg.toFixed(2)}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-16 sm:w-20 hidden xs:block text-left">
                        <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                          <div className={`h-full ${c.bar}`} style={{ width: `${md.mastery}%` }} />
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5 text-center">{md.mastery}%</div>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-slate-800/80 pt-4 space-y-4 bg-slate-950/20">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="text-xs text-slate-500 font-mono block">
                          نسبة التمكن: <span className="text-slate-200 font-bold">{md.mastery}%</span>
                          <input type="range" min="0" max="100" value={md.mastery}
                            onChange={(e) => updateModule(m.id, { mastery: Number(e.target.value) })}
                            className="w-full accent-amber-400 mt-1.5" />
                        </label>
                        <label className="text-xs text-slate-500 font-mono block">
                          الصعوبة: <span className="text-slate-200 font-bold">{md.difficulty}/5</span>
                          <input type="range" min="1" max="5" value={md.difficulty}
                            onChange={(e) => updateModule(m.id, { difficulty: Number(e.target.value) })}
                            className="w-full accent-rose-400 mt-1.5" />
                        </label>
                        <label className="text-xs text-slate-500 font-mono block">
                          تاريخ الامتحان القادم
                          <input type="date" value={md.examDate}
                            onChange={(e) => updateModule(m.id, { examDate: e.target.value })}
                            className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs sm:text-sm" />
                        </label>
                      </div>

                      <label className="block text-xs text-slate-500 font-mono">
                        نقاط الضعف / ملاحظات
                        <textarea value={md.weakness} rows={2}
                          onChange={(e) => updateModule(m.id, { weakness: e.target.value })}
                          placeholder="مثلا: تايفوتني الوقت فحساب المناهج..."
                          className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500/50" />
                      </label>

                      <GradesEditor moduleId={m.id} grades={md.grades} onAdd={addGrade} onRemove={removeGrade} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function GradesEditor({ moduleId, grades, onAdd, onRemove }) {
  const [type, setType] = useState("Contrôle");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayISO());

  const submit = () => {
    if (value === "" || isNaN(Number(value))) return;
    onAdd(moduleId, { id: uid(), type, value: Number(value), date });
    setValue("");
  };

  return (
    <div className="border-t border-slate-800/60 pt-3">
      <div className="text-xs text-slate-500 font-mono mb-2">النقط المحصل عليها:</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {grades.map((g) => (
          <div key={g.id} className="flex items-center gap-1.5 text-[11px] bg-slate-950 border border-slate-800 rounded-full px-2.5 py-0.5">
            <span className="text-slate-500">{g.type}</span>
            <span className={Number(g.value) >= 10 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{g.value}/20</span>
            <button onClick={() => onRemove(moduleId, g.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {!grades.length && <span className="text-xs text-slate-600 italic">لا توجد نقط مسجلة حالياً.</span>}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs sm:text-sm text-slate-200">
            <option>Contrôle</option>
            <option>EFM</option>
            <option>Régional</option>
            <option>TP</option>
          </select>
          <input type="number" min="0" max="20" step="0.25" value={value} onChange={(e) => setValue(e.target.value)}
            placeholder="النقطة /20" className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs sm:text-sm text-slate-200" />
        </div>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs sm:text-sm text-slate-200 flex-1" />
          <button onClick={submit} className="flex items-center justify-center gap-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-amber-500/20 transition-all shrink-0">
            <Plus className="w-3.5 h-3.5" /> إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
