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
   باش يخدم التطبيق بره Claude عادي بلا مشاكل
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
   بيانات الموديولات الثابتة (مستخرجة من شجرة السنة الثانية TSMFM)
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
  { id: "M212", name: "Démarche qualité", group: "التسيير والتنظيم الصناعي", hours: 15, coef: 1, color: "orange" },
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
   عداد نصف دائري (Gauge) بأسلوب شاشة تحكم آلة CNC
--------------------------------------------------------------------- */
function Gauge20({ value, size = 168 }) {
  const pct = Math.max(0, Math.min(1, value / 20));
  const r = size / 2 - 14;
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
    <svg width={size} height={size / 1.6} viewBox={`0 0 ${size} ${size / 1.6}`}>
      <path d={arcPath(sx, sy, ex, ey, 1)} fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
      <path d={arcPath(sx, sy, vx, vy, pct > 0.5 ? 1 : 0)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="30" fontWeight="700" fill="#f1f5f9" fontFamily="ui-monospace, monospace">
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
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${active ? c + " shadow-[0_0_6px]" : "bg-slate-700"}`}
    />
  );
}

/* ---------------------------------------------------------------------
   التطبيق الرئيسي
--------------------------------------------------------------------- */
export default function App() {
  const [state, setState] = useState(defaultState());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("overview");
  const saveTimer = useRef(null);

  // تحميل البيانات المحفوظة
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
        /* لا توجد بيانات محفوظة بعد */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // حفظ تلقائي (مع تأخير بسيط)
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

  // نسخة احتياطية: تصدير JSON
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

  // نسخة احتياطية: استرجاع JSON
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

  /* ---------- حسابات المعدل والأولويات ---------- */
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

  // تسجيل نقطة تقدم يومية فتاريخ التمكن العام والمعدل (كتتحدث لحظيا لليوم الحالي)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* شريط علوي بأسلوب لوحة تحكم آلة */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/40 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tracking-widest">
                TSMFM · السنة الثانية <LED active />
              </div>
              <div className="text-center my-6 px-4">
  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] uppercase leading-tight">
    Ayoub Taoufik
  </h1>
  <p className="text-xs sm:text-sm md:text-base text-cyan-400/80 font-medium tracking-widest mt-2 uppercase">
    لوحة قيادة الدراسة — بوصلة التميز
  </p>
</div>
  <h1 className="text-4xl md:text-6xl font-black tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] uppercase">
    Ayoub Taoufik
  </h1>
  <p className="text-sm md:text-base text-cyan-400/80 font-medium tracking-widest mt-2 uppercase">
    لوحة قيادة الدراسة — بوصلة التميز
  </p>
</div>
            </div>
            <div className="flex items-center gap-1.5 mr-2">
              <button onClick={exportData} title="تحميل نسخة احتياطية JSON"
                className="p-2 rounded-md bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => importInputRef.current?.click()} title="استرجاع نسخة احتياطية"
                className="p-2 rounded-md bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40">
                <Upload className="w-4 h-4" />
              </button>
              <input ref={importInputRef} type="file" accept="application/json" onChange={importData} className="hidden" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Gauge20 value={overallAvg} />
            <div className="hidden sm:flex flex-col gap-1 text-sm font-mono">
              <div className="flex items-center gap-2"><span className="text-slate-500">التمكن العام</span><span className="text-amber-300">{overallMastery}%</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-500">موديولات مقيّمة</span><span className="text-sky-300">{gradedCount}/18</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-500">التدريب</span>
                <span className={state.stageDone ? "text-emerald-300" : "text-slate-500"}>{state.stageDone ? "منجز ✓" : "لم يُنجز بعد"}</span>
              </div>
            </div>
          </div>
        </div>
        {/* تبويبات */}
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 pb-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm whitespace-nowrap border transition-colors ${
                    active
                      ? "bg-slate-800 border-amber-500/40 text-amber-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <LED active={active} />
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!!upcomingExams.length && !dismissedAlert && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5">
            <BellRing className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-rose-100">
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

      <div className="max-w-6xl mx-auto px-4 py-6">
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
        {tab === "teachers" && <TeachersTab state={state} setState={setState} />}
        {tab === "peers" && <PeersTab state={state} setState={setState} />}
        {tab === "exams" && <ExamsTab state={state} setState={setState} />}
        {tab === "journal" && <JournalTab state={state} setState={setState} />}
        {tab === "ai" && <AiTab state={state} moduleAvg={moduleAvg} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: القيادة (Overview)
--------------------------------------------------------------------- */
function OverviewTab({ rankedModules, state, moduleAvg, priorityScore, stageDone, setStageDone, history }) {
  const top = rankedModules.slice(0, 3);
  return (
    <div className="space-y-6">
      {history.length > 1 && <ProgressChart history={history} />}
      <div>
        <h2 className="text-sm font-mono text-slate-500 mb-3">🎯 أولويات اليوم — راجع هادو أولاً</h2>
        <div className="grid md:grid-cols-3 gap-3">
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
                <div className="font-semibold text-slate-100 leading-snug mb-2">{m.name}</div>
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-mono text-slate-500 mb-3">ترتيب الأولوية الكامل</h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {rankedModules.map((m, i) => {
              const c = COLOR_MAP[m.color];
              return (
                <div key={m.id} className="flex items-center gap-2 text-sm py-1.5 border-b border-slate-800/60 last:border-0">
                  <span className="w-5 text-xs text-slate-600 font-mono">{i + 1}</span>
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="flex-1 truncate">{m.id} — {m.name}</span>
                  <span className="text-xs font-mono text-slate-500">{priorityScore(m).toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-mono text-slate-500 mb-3">التدريب (Stage)</h3>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <div className="font-semibold">{STAGE.name}</div>
              <div className="text-xs text-slate-500">{STAGE.weeks} أسابيع</div>
            </div>
            <button
              onClick={() => setStageDone(!stageDone)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border ${
                stageDone ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> {stageDone ? "منجز" : "تحديد كمنجز"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            المعادلة: الأولوية = (المعامل × 2) + فجوة التمكن + الصعوبة + قرب الامتحان.
            هاد الترتيب كيتبدل أوتوماتيكيا كل ما بدّلتي التمكن ولا الصعوبة ولا تاريخ الامتحان فتبويب "الموديولات".
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="text-sm font-mono text-slate-500 mb-3">تطور التمكن العام والمعدل عبر الوقت</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", fontSize: 12 }} />
            <Line type="monotone" dataKey="التمكن %" stroke="#fbbf24" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="المعدل ×5" stroke="#38bdf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-600 mt-2">* المعدل مضروب في 5 باش يبان على نفس المقياس ديال التمكن (0-100).</p>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: الموديولات + النقط
--------------------------------------------------------------------- */
function ModulesTab({ state, updateModule, addGrade, removeGrade, moduleAvg }) {
  const [open, setOpen] = useState(null);
  const groups = [...new Set(MODULES_SEED.map((m) => m.group))];

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g}>
          <h3 className="text-sm font-mono text-slate-500 mb-3">{g}</h3>
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
                    className="w-full flex items-center gap-3 p-4 text-right"
                  >
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{m.id}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-100">{m.name}</div>
                      <div className="text-xs text-slate-500 font-mono flex gap-3 mt-0.5">
                        <span><Clock className="w-3 h-3 inline ml-1" />{m.hours}h</span>
                        <span>Coef {m.coef}</span>
                        {avg !== null && <span className={avg >= 10 ? "text-emerald-400" : "text-rose-400"}>معدل {avg.toFixed(2)}/20</span>}
                      </div>
                    </div>
                    <div className="w-24 hidden sm:block">
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${c.bar}`} style={{ width: `${md.mastery}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 text-center">{md.mastery}%</div>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-4 space-y-4">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <label className="text-xs text-slate-500 font-mono">
                          نسبة التمكن: <span className="text-slate-200">{md.mastery}%</span>
                          <input type="range" min="0" max="100" value={md.mastery}
                            onChange={(e) => updateModule(m.id, { mastery: Number(e.target.value) })}
                            className="w-full accent-amber-400 mt-1" />
                        </label>
                        <label className="text-xs text-slate-500 font-mono">
                          الصعوبة: <span className="text-slate-200">{md.difficulty}/5</span>
                          <input type="range" min="1" max="5" value={md.difficulty}
                            onChange={(e) => updateModule(m.id, { difficulty: Number(e.target.value) })}
                            className="w-full accent-rose-400 mt-1" />
                        </label>
                        <label className="text-xs text-slate-500 font-mono">
                          تاريخ الامتحان القادم
                          <input type="date" value={md.examDate}
                            onChange={(e) => updateModule(m.id, { examDate: e.target.value })}
                            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200" />
                        </label>
                      </div>

                      <label className="block text-xs text-slate-500 font-mono">
                        نقاط الضعف / ملاحظات
                        <textarea value={md.weakness} rows={2}
                          onChange={(e) => updateModule(m.id, { weakness: e.target.value })}
                          placeholder="مثلا: تايفوتني الوقت فحساب isostatisme..."
                          className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-sm" />
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
    <div>
      <div className="text-xs text-slate-500 font-mono mb-2">النقط</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {grades.map((g) => (
          <div key={g.id} className="flex items-center gap-2 text-xs bg-slate-950 border border-slate-700 rounded-full px-3 py-1">
            <span className="text-slate-400">{g.type}</span>
            <span className={Number(g.value) >= 10 ? "text-emerald-400" : "text-rose-400"}>{g.value}/20</span>
            <button onClick={() => onRemove(moduleId, g.id)} className="text-slate-600 hover:text-rose-400">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {!grades.length && <span className="text-xs text-slate-600">مازال ما دخلتيش نقط</span>}
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200">
          <option>Contrôle</option>
          <option>EFM</option>
          <option>Régional</option>
          <option>TP</option>
        </select>
        <input type="number" min="0" max="20" step="0.25" value={value} onChange={(e) => setValue(e.target.value)}
          placeholder="النقطة /20" className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200" />
        <button onClick={submit} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded px-3 py-1.5 text-sm">
          <Plus className="w-3.5 h-3.5" /> إضافة
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: الأساتذة
--------------------------------------------------------------------- */
function TeachersTab({ state, setState }) {
  const empty = { id: "", name: "", moduleId: MODULES_SEED[0].id, style: "", participatory: "متوسط", examDifficulty: "متوسط", notes: "" };
  const [draft, setDraft] = useState(empty);

  const add = () => {
    if (!draft.name.trim()) return;
    setState((s) => ({ ...s, teachers: [...s.teachers, { ...draft, id: uid() }] }));
    setDraft(empty);
  };
  const remove = (id) => setState((s) => ({ ...s, teachers: s.teachers.filter((t) => t.id !== id) }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-mono text-slate-500 mb-3">إضافة أستاذ</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder="اسم الأستاذ" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <select value={draft.moduleId} onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm">
            {MODULES_SEED.map((m) => <option key={m.id} value={m.id}>{m.id} — {m.name}</option>)}
          </select>
          <input placeholder="طريقة الشرح" value={draft.style} onChange={(e) => setDraft({ ...draft, style: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <select value={draft.participatory} onChange={(e) => setDraft({ ...draft, participatory: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm">
            <option>يحب المشاركة</option><option>متوسط</option><option>لا يحب المشاركة</option>
          </select>
          <select value={draft.examDifficulty} onChange={(e) => setDraft({ ...draft, examDifficulty: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm">
            <option>امتحانه سهل</option><option>متوسط</option><option>امتحانه صعب</option>
          </select>
          <input placeholder="أفضل طريقة للتعامل معه" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm sm:col-span-2" />
        </div>
        <button onClick={add} className="mt-3 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded px-3 py-1.5 text-sm">
          <Plus className="w-4 h-4" /> إضافة الأستاذ
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {state.teachers.map((t) => {
          const m = MODULES_SEED.find((mm) => mm.id === t.moduleId);
          return (
            <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 relative">
              <button onClick={() => remove(t.id)} className="absolute left-3 top-3 text-slate-600 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="font-semibold text-slate-100">{t.name}</div>
              <div className="text-xs text-amber-300 font-mono mb-2">{m?.id} — {m?.name}</div>
              <div className="text-xs text-slate-400 space-y-1">
                {t.style && <div>الشرح: {t.style}</div>}
                <div>المشاركة: {t.participatory}</div>
                <div>الامتحان: {t.examDifficulty}</div>
                {t.notes && <div className="text-slate-500 italic">💡 {t.notes}</div>}
              </div>
            </div>
          );
        })}
        {!state.teachers.length && <p className="text-sm text-slate-600">مازال ما زدتي حتى أستاذ.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: الزملاء
--------------------------------------------------------------------- */
const SKILLS = ["SolidWorks", "Français", "Math", "Programmation CNC", "CAO", "FAO", "RDM", "Métrologie"];

function PeersTab({ state, setState }) {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState([]);

  const toggleSkill = (s) => setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const add = () => {
    if (!name.trim()) return;
    setState((st) => ({ ...st, peers: [...st.peers, { id: uid(), name, skills }] }));
    setName(""); setSkills([]);
  };
  const remove = (id) => setState((st) => ({ ...st, peers: st.peers.filter((p) => p.id !== id) }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-mono text-slate-500 mb-3">إضافة زميل</h3>
        <input placeholder="اسم الزميل" value={name} onChange={(e) => setName(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm w-full mb-3" />
        <div className="flex flex-wrap gap-2 mb-3">
          {SKILLS.map((s) => (
            <button key={s} onClick={() => toggleSkill(s)}
              className={`text-xs px-3 py-1 rounded-full border ${skills.includes(s) ? "bg-sky-500/10 border-sky-500/40 text-sky-300" : "bg-slate-950 border-slate-700 text-slate-400"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={add} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded px-3 py-1.5 text-sm">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      <div>
        <h3 className="text-sm font-mono text-slate-500 mb-3">مين نقدر نسول إيلا احتجت مساعدة</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {state.peers.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 relative">
              <button onClick={() => remove(p.id)} className="absolute left-3 top-3 text-slate-600 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="font-semibold mb-2">{p.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {p.skills.map((s) => (
                  <span key={s} className="text-[11px] bg-sky-500/10 text-sky-300 border border-sky-500/30 rounded-full px-2 py-0.5">{s}</span>
                ))}
                {!p.skills.length && <span className="text-xs text-slate-600">بلا تخصص محدد</span>}
              </div>
            </div>
          ))}
          {!state.peers.length && <p className="text-sm text-slate-600">مازال ما زدتي حتى زميل.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: سجل الامتحانات
--------------------------------------------------------------------- */
const CAUSES = ["الوقت", "نسيان", "عدم فهم", "قلة تدريب"];

function ExamsTab({ state, setState }) {
  const empty = { moduleId: MODULES_SEED[0].id, date: todayISO(), duration: "", grade: "", mistakes: "", cause: CAUSES[0] };
  const [draft, setDraft] = useState(empty);

  const add = () => {
    setState((s) => ({ ...s, exams: [{ ...draft, id: uid() }, ...s.exams] }));
    setDraft(empty);
  };
  const remove = (id) => setState((s) => ({ ...s, exams: s.exams.filter((e) => e.id !== id) }));

  const causeCounts = CAUSES.map((c) => ({ c, n: state.exams.filter((e) => e.cause === c).length }));
  const maxN = Math.max(1, ...causeCounts.map((x) => x.n));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-mono text-slate-500 mb-3">تسجيل امتحان / اختبار</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <select value={draft.moduleId} onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm sm:col-span-2">
            {MODULES_SEED.map((m) => <option key={m.id} value={m.id}>{m.id} — {m.name}</option>)}
          </select>
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="المدة (د)" type="number" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="النقطة /20" type="number" value={draft.grade} onChange={(e) => setDraft({ ...draft, grade: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <select value={draft.cause} onChange={(e) => setDraft({ ...draft, cause: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm">
            {CAUSES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <textarea placeholder="وصف الأخطاء" rows={2} value={draft.mistakes} onChange={(e) => setDraft({ ...draft, mistakes: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm sm:col-span-3" />
        </div>
        <button onClick={add} className="mt-3 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded px-3 py-1.5 text-sm">
          <Plus className="w-4 h-4" /> تسجيل
        </button>
      </div>

      {!!state.exams.length && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-mono text-slate-500 mb-3">أين كنتاي تايضيع النقط؟</h3>
          <div className="space-y-2">
            {causeCounts.map(({ c, n }) => (
              <div key={c} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-slate-400">{c}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-400" style={{ width: `${(n / maxN) * 100}%` }} />
                </div>
                <span className="w-6 text-xs text-slate-500 font-mono">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {state.exams.map((e) => {
          const m = MODULES_SEED.find((mm) => mm.id === e.moduleId);
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex-1">
                <span className="text-slate-200 font-medium">{m?.id}</span>
                <span className="text-slate-500"> — {e.date} — {e.cause}</span>
                {e.mistakes && <div className="text-xs text-slate-500 mt-0.5">{e.mistakes}</div>}
              </div>
              {e.grade !== "" && <span className={Number(e.grade) >= 10 ? "text-emerald-400" : "text-rose-400"}>{e.grade}/20</span>}
              <button onClick={() => remove(e.id)} className="text-slate-600 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: دفتر الدروس المستفادة (Lessons Learned)
--------------------------------------------------------------------- */
function JournalTab({ state, setState }) {
  const empty = { date: todayISO(), worked: "", didntWork: "", why: "", change: "" };
  const [draft, setDraft] = useState(empty);

  const add = () => {
    if (!draft.worked && !draft.didntWork && !draft.change) return;
    setState((s) => ({ ...s, journal: [{ ...draft, id: uid() }, ...s.journal] }));
    setDraft(empty);
  };
  const remove = (id) => setState((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-mono text-slate-500 mb-3">تسجيل أسبوعي</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm sm:col-span-2" />
          <textarea placeholder="واش نجح هاد الأسبوع؟" rows={2} value={draft.worked} onChange={(e) => setDraft({ ...draft, worked: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <textarea placeholder="واش ما نجحش؟" rows={2} value={draft.didntWork} onChange={(e) => setDraft({ ...draft, didntWork: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <textarea placeholder="علاش؟" rows={2} value={draft.why} onChange={(e) => setDraft({ ...draft, why: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
          <textarea placeholder="غادي نبدل شنو الأسبوع الجاي؟" rows={2} value={draft.change} onChange={(e) => setDraft({ ...draft, change: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
        </div>
        <button onClick={add} className="mt-3 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded px-3 py-1.5 text-sm">
          <Plus className="w-4 h-4" /> حفظ التسجيلة
        </button>
      </div>

      <div className="space-y-3">
        {state.journal.map((j) => (
          <div key={j.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 relative">
            <button onClick={() => remove(j.id)} className="absolute left-3 top-3 text-slate-600 hover:text-rose-400">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="text-xs text-slate-500 font-mono mb-2">{j.date}</div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {j.worked && <div><span className="text-emerald-400">✓ نجح:</span> {j.worked}</div>}
              {j.didntWork && <div><span className="text-rose-400">✗ ما نجحش:</span> {j.didntWork}</div>}
              {j.why && <div className="text-slate-400">علاش: {j.why}</div>}
              {j.change && <div className="text-amber-300">تبديل: {j.change}</div>}
            </div>
          </div>
        ))}
        {!state.journal.length && <p className="text-sm text-slate-600">مازال ما كتبتي حتى تسجيلة أسبوعية.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   تبويب: المساعد الذكي (chat مخصص لكل Module عبر Claude API)
--------------------------------------------------------------------- */
function AiTab({ state, moduleAvg }) {
  const [moduleId, setModuleId] = useState(MODULES_SEED[0].id);
  const [chats, setChats] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const messages = chats[moduleId] || [];
  const m = MODULES_SEED.find((mm) => mm.id === moduleId);
  const md = state.modules[moduleId];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const nextMessages = [...messages, userMsg];
    setChats((c) => ({ ...c, [moduleId]: nextMessages }));
    setInput("");
    setLoading(true);
    try {
      const avg = moduleAvg(moduleId);
      const sys = `أنت مساعد دراسي متخصص فمودول "${m.name}" (${m.id}, Coef ${m.coef}, ${m.hours}h) فبرنامج TSMFM بالمغرب (تقني متخصص فطرق الصنع الميكانيكي). ` +
        `مستوى تمكن الطالب حاليا: ${md.mastery}%. صعوبة المودول عنده: ${md.difficulty}/5. ` +
        (avg !== null ? `معدله فهاد المودول: ${avg.toFixed(2)}/20. ` : "") +
        (md.weakness ? `نقاط ضعفه: ${md.weakness}. ` : "") +
        `جاوب بالدارجة المغربية أو الفرنسية التقنية حسب السؤال، بشكل مختصر ومباشر ومفيد للمراجعة، وركز على المحتوى التقني الحقيقي ديال المودول.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: sys,
          messages: nextMessages.map((mm) => ({ role: mm.role, content: mm.content })),
        }),
      });
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n") || "ما قدرتش نجاوب دابا، عاود المحاولة.";
      setChats((c) => ({ ...c, [moduleId]: [...nextMessages, { role: "assistant", content: text }] }));
    } catch (e) {
      setChats((c) => ({ ...c, [moduleId]: [...nextMessages, { role: "assistant", content: "وقع خطأ فالاتصال. عاود المحاولة." }] }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-4">
      <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
        {MODULES_SEED.map((mm) => {
          const c = COLOR_MAP[mm.color];
          const active = mm.id === moduleId;
          return (
            <button key={mm.id} onClick={() => setModuleId(mm.id)}
              className={`w-full text-right px-3 py-2 rounded-lg text-xs border flex items-center gap-2 ${
                active ? "bg-slate-800 border-amber-500/40" : "bg-slate-900/40 border-slate-800 text-slate-400"
              }`}>
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="truncate">{mm.id}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col h-[520px]">
        <div className="p-3 border-b border-slate-800 text-sm">
          <span className="text-amber-300 font-mono">{m.id}</span> — <span className="text-slate-300">{m.name}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!messages.length && (
            <div className="text-xs text-slate-600 text-center mt-10">
              اسول على شرح، ملخص، أسئلة تدريبية، ولا امتحان تجريبي فهاد المودول.
            </div>
          )}
          {messages.map((mm, i) => (
            <div key={i} className={`flex ${mm.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                mm.role === "user" ? "bg-amber-500/10 border border-amber-500/30 text-amber-100" : "bg-slate-800 text-slate-200"
              }`}>
                {mm.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> كيفكر...
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="p-3 border-t border-slate-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="اكتب سؤالك..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
          />
          <button onClick={send} disabled={loading} className="bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded px-3 py-2 disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
