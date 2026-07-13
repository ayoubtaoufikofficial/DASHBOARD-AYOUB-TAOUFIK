import React, { useState, useEffect } from 'react';
// استيراد صورتك الشخصية وشاشة الحماية الأصلية من ملفات مشروعك
import AuthScreen from './AuthScreen';
import profileImg from './FB_IMG_1750515617631.jpg';

function App() {
  // --- إعدادات الحالات والتحكم (State Management) ---
  const [user, setUser] = useState(true); // نظام حماية وتسجيل الدخول والخروج
  const [activeTab, setActiveTab] = useState('dashboard'); // التبويب النشط
  
  // شجرة موديولات TSMFM الكاملة للسنة الثانية مع إمكانية التعديل والحذف الكامل
  const [modules, setModules] = useState([
    { id: 'M206', name: "Conception et Dessin d'outillages de production", coef: 4, mark: '', status: 'active' },
    { id: 'M203', name: "Élaboration et Constitution des dossiers de fabrication", coef: 4, mark: '', status: 'active' },
    { id: 'M209', name: "Programmation, réglage et conduite des MOCN (CNC)", coef: 4, mark: '', status: 'active' },
    { id: 'M201', name: "Analyse de fabrication et Laboratoire méthodes", coef: 3, mark: '', status: 'pending' },
    { id: 'M202', name: "Gestion de la production et de la qualité", coef: 2, mark: '', status: 'pending' },
    { id: 'M211', name: "Stage en entreprise (التدريب المهني)", coef: 3, mark: '', status: 'pending' },
  ]);

  // إدارة دليل الأساتذة بحرية مطلقة
  const [teachers, setTeachers] = useState([
    { id: 1, name: "أستاذ ورشة التصميم (Bureau d'études)", subject: "M206 + M203", contact: "BE@tsmfm.ma", note: "يركز بشدة على دقة رسومات قوالب التشكيل وأدوات الإنتاج." },
    { id: 2, name: "أستاذ البرمجة والتصنيع الآلي", subject: "M209", contact: "cnc@tsmfm.ma", note: "تأكد من ضبط أكواد G-Code و M-Code واختبار المحاكاة للقطع الآلية." }
  ]);

  // نظام إدارة المهام اليومية (To-Do List) لزيادة الإنتاجية في المراجعة
  const [tasks, setTasks] = useState([
    { id: 1, text: "مراجعة رسم تصميم الأداة المرسل من الأستاذ لـ M206", completed: false, priority: "high" },
    { id: 2, text: "كتابة ومحاكاة كود CNC لمخرطة الموديول M209", completed: true, priority: "medium" },
    { id: 3, text: "تنظيم ملفات تصنيع الموديول M203 وتحضير المعاملات", completed: false, priority: "low" }
  ]);

  // مدخلات النماذج الجديدة (Forms)
  const [newModId, setNewModId] = useState('');
  const [newModName, setNewModName] = useState('');
  const [newModCoef, setNewModCoef] = useState('');
  
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSub, setNewTeacherSub] = useState('');
  const [newTeacherContact, setNewTeacherContact] = useState('');
  const [newTeacherNote, setNewTeacherNote] = useState('');

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // إعدادات مؤقت بومودورو للتركيز
  const [pomodoro, setPomodoro] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('Work'); // Work, Short Break, Long Break

  // --- العمليات الحسابية والتحليلية العميقة للموقع ---
  const handleMarkChange = (id, value) => {
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 20)) {
      setModules(modules.map(mod => mod.id === id ? { ...mod, mark: value } : mod));
    }
  };

  const calculateDeepStats = () => {
    let totalPoints = 0;
    let totalCoefs = 0;
    let evaluatedCount = 0;
    let highest = { id: '-', mark: -1 };
    let lowest = { id: '-', mark: 21 };

    modules.forEach(mod => {
      const markValue = parseFloat(mod.mark);
      if (!isNaN(markValue)) {
        totalPoints += (markValue * mod.coef);
        totalCoefs += mod.coef;
        evaluatedCount++;

        if (markValue > highest.mark) highest = { id: mod.id, mark: markValue };
        if (markValue < lowest.mark) lowest = { id: mod.id, mark: markValue };
      }
    });

    const finalGpa = totalCoefs === 0 ? 0 : totalPoints / totalCoefs;
    const generalMastery = finalGpa ? ((finalGpa / 20) * 100).toFixed(0) : 0;
    
    return {
      gpa: finalGpa.toFixed(2),
      mastery: generalMastery,
      evaluatedCount,
      totalCoefs,
      highest: highest.mark === -1 ? 'لا يوجد' : `${highest.id} (${highest.mark}/20)`,
      lowest: lowest.mark === 21 ? 'لا يوجد' : `${lowest.id} (${lowest.mark}/20)`
    };
  };

  const stats = calculateDeepStats();

  // --- دوال التحكم والإدارة الحرة (CRUD) ---
  const addModule = (e) => {
    e.preventDefault();
    if (!newModId || !newModName || !newModCoef) return;
    setModules([...modules, { id: newModId.toUpperCase(), name: newModName, coef: parseFloat(newModCoef), mark: '', status: 'active' }]);
    setNewModId(''); setNewModName(''); setNewModCoef('');
  };

  const deleteModule = (id) => {
    setModules(modules.filter(mod => mod.id !== id));
  };

  const addTeacher = (e) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherSub) return;
    setTeachers([...teachers, { id: Date.now(), name: newTeacherName, subject: newTeacherSub, contact: newTeacherContact, note: newTeacherNote }]);
    setNewTeacherName(''); setNewTeacherSub(''); setNewTeacherContact(''); setNewTeacherNote('');
  };

  const deleteTeacher = (id) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false, priority: newTaskPriority }]);
    setNewTaskText('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- تشغيل ومراقبة مؤقت بومودورو ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoro > 0) {
      interval = setInterval(() => setPomodoro(prev => prev - 1), 1000);
    } else if (pomodoro === 0) {
      setIsTimerRunning(false);
      if (timerMode === 'Work') {
        alert("انتهت جلسة العمل بنجاح! خذ قسطاً من الراحة الآن.");
        setTimerMode('Break');
        setPomodoro(5 * 60);
      } else {
        alert("انتهت الاستراحة! اعد شحن طاقتك للتركيز.");
        setTimerMode('Work');
        setPomodoro(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoro, timerMode]);

  const resetPomodoro = (mode) => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setPomodoro(mode === 'Work' ? 25 * 60 : mode === 'Short' ? 5 * 60 : 15 * 60);
  };

  if (!user) {
    return <AuthScreen onLogin={() => setUser(true)} />;
  }

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto font-sans antialiased text-white pb-24" style={{ direction: 'rtl' }}>
      
      {/* العداد والتحذير التنازلي التفاعلي المضيء للامتحانات */}
      <div className="w-full bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-4 py-2.5 text-center text-xs font-bold text-cyan-400 mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)] flex justify-between items-center">
        <span>📢 إشعار المراجعة المستمرة:</span>
        <span className="animate-pulse bg-cyan-500/20 px-3 py-1 rounded-full text-[11px]">الامتحان الجهوي EFM يقترب | جهز ملفاتك التقنية ورسوماتك</span>
      </div>

      {/* 1. رأس الصفحة الفاخر (Header) بالتصميم الزجاجي السائل والأيقونات والتاج */}
      <div className="flex items-center justify-between p-4 liquid-glass mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl"></div>
        <div className="flex gap-2 z-10">
          <button title="تحميل التقرير الدراسي" className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition text-sm">📥</button>
          <button title="مشاركة البيانات حياً" className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition text-sm">📤</button>
        </div>

        <div className="flex flex-col items-center z-10">
          <span className="text-[10px] text-gray-400 font-extrabold tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">TSMFM • السنة الثانية</span>
          <div className="relative mt-2.5 mb-1">
            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xl drop-shadow-[0_0_10px_rgba(234,179,8,0.7)] animate-bounce">👑</span>
            <h1 className="text-xl md:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500">
              AYOUB TAOUFIK
            </h1>
          </div>
          <p className="text-[11px] text-cyan-400 font-bold tracking-wide">لوحة قيادة الدراسة – بوصلة التميز الميكانيكي</p>
        </div>

        <div className="relative z-10">
          <img 
            src={profileImg} 
            alt="Ayoub Taoufik" 
            className="w-14 h-14 rounded-full border-2 border-yellow-500 object-cover shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105 transition-all"
          />
        </div>
      </div>

      {/* 2. قسم التحليلات العميقة والأرقام المحسوبة ديناميكياً لتتبع المستوى ومعدل الـ EFM */}
      <div className="liquid-glass p-6 mb-6 relative overflow-hidden">
        <div className="grid grid-cols-3 gap-4 text-center items-center">
          {/* العمود الأيمن: نسب التمكن والتدريب */}
          <div className="flex flex-col justify-between h-24 text-right">
            <div>
              <p className="text-gray-400 text-[11px] font-medium">التمكن العام</p>
              <p className="text-xl font-black text-yellow-400">{stats.mastery}%</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold">التدريب المهني (Stage)</p>
              <span className="text-[9px] text-red-400 font-extrabold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">لم ينجز بعد</span>
            </div>
          </div>

          {/* العمود الأوسط: العداد الدائري والمعدل العام الإجمالي */}
          <div className="relative w-28 h-28 mx-auto flex flex-col items-center justify-center rounded-full border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
              {stats.gpa}
            </h2>
            <span className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase">المعدل / 20</span>
          </div>

          {/* العمود الأيسر: عداد الموديولات وخروج الحساب */}
          <div className="flex flex-col justify-between h-24 text-left">
            <div>
              <p className="text-gray-400 text-[11px] font-medium">موديولات مقيمة</p>
              <p className="text-xl font-black text-cyan-400">{stats.evaluatedCount}/{modules.length}</p>
            </div>
            <button onClick={() => setUser(false)} className="text-[10px] text-gray-500 hover:text-red-400 font-bold transition underline text-left">
              تسجيل خروج آمن
            </button>
          </div>
        </div>

        {/* شريط الإحصائيات الميكانيكية الإضافية المخفية - يظهر التحليل العميق */}
        <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="text-right">🏆 أعلى مادة تميز: <span className="text-emerald-400 font-bold">{stats.highest}</span></div>
          <div className="text-left">📉 أدنى مادة للمراجعة: <span className="text-red-400 font-bold">{stats.lowest}</span></div>
        </div>
      </div>

      {/* 3. شريط التنقل بين الخيارات والتبويبات بلمسة زجاجية وانسيابية كاملة */}
      <div className="liquid-glass p-1.5 mb-6 flex justify-between items-center gap-1 text-xs md:text-sm">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'hover:bg-white/5 text-gray-400'}`}
        >
          ⏱️ <span>لوحة القيادة</span>
        </button>
        <button 
          onClick={() => setActiveTab('modules')}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${activeTab === 'modules' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'hover:bg-white/5 text-gray-400'}`}
        >
          🔧 <span>الموديولات</span>
        </button>
        <button 
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${activeTab === 'teachers' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'hover:bg-white/5 text-gray-400'}`}
        >
          📋 <span>الأساتذة</span>
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`py-2 px-4 rounded-xl font-black transition-all flex items-center justify-center ${activeTab === 'students' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-gray-400'}`}
        >
          👥 <span>المهام</span>
        </button>
      </div>

      {/* 4. معالجة محتويات الأقسام الضخمة والشاملة */}
      
      {/* === [ قسم لوحة القيادة والمؤقت والحاسبة الحية ] === */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          
          {/* أداة بومودورو مدمجة لزيادة الإنتاجية والتركيز في الحفظ والدراسة */}
          <div className="liquid-glass p-4 flex items-center justify-between bg-gradient-to-r from-purple-500/5 via-transparent to-transparent border-purple-500/20">
            <div className="text-right">
              <h4 className="text-xs font-black text-purple-400 flex items-center gap-1">🧠 مؤقت بومودورو للتركيز العالي ({timerMode})</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">ادرس لمدة 25 دقيقة بتركيز، ثم خذ 5 دقائق راحة لتجديد نشاطك الميكانيكي.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-white bg-black/50 px-3 py-1 rounded-xl border border-white/10 tracking-wider">
                {Math.floor(pomodoro / 60)}:{(pomodoro % 60 < 10 ? '0' : '')}{pomodoro % 60}
              </span>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-3 py-0.5 rounded-md text-[10px] font-bold transition ${isTimerRunning ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}
                >
                  {isTimerRunning ? 'إيقاف' : 'ابدأ'}
                </button>
                <button onClick={() => resetPomodoro('Work')} className="text-[9px] text-gray-500 hover:text-white transition">إعادة تعيين</button>
              </div>
            </div>
          </div>

          <h3 className="text-right text-xs font-black text-gray-400 flex items-center gap-1.5 pt-2">
            🎯 <span>أولويات المراجعة الحالية وحساب المعدل المباشر:</span>
          </h3>
          
          {modules.map((mod, index) => {
            const masteryPercent = mod.mark !== '' ? ((parseFloat(mod.mark) / 20) * 100).toFixed(0) : 0;
            return (
              <div key={mod.id} className="liquid-glass p-5 flex flex-col relative overflow-hidden group">
                {/* خط توهج ديكوري يتفاعل عند مرور مؤشر الفأرة */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 group-hover:w-1.5 transition-all"></div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-bold text-xs">#{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">{mod.id}</span>
                    <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">Coef {mod.coef}</span>
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-gray-100 mb-3 text-right leading-snug">{mod.name}</h4>
                
                {/* شريط التقدم التفاعلي المتأثر بالنقطة المدخلة */}
                <div className="w-full bg-white/5 h-1.5 rounded-full mb-4 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-l from-cyan-400 via-blue-500 to-indigo-600 h-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                    style={{ width: `${masteryPercent}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <input 
                    type="number" 
                    max="20" min="0" step="0.25"
                    placeholder="أدخل نقطة الاختبار هنا /20"
                    value={mod.mark}
                    onChange={(e) => handleMarkChange(mod.id, e.target.value)}
                    className="bg-transparent border-b border-gray-700 text-white focus:border-cyan-400 focus:outline-none w-36 text-center font-black text-sm placeholder:text-xs placeholder:text-gray-500"
                  />
                  <span className="text-xs font-bold text-gray-400">التمكن الفعلي: <span className="text-cyan-400">{masteryPercent}%</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === [ قسم الموديولات - تحكم كامل وحرية في الإضافة والحذف والتعديل ] === */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          
          {/* نموذج إضافة موديول دراسي جديد بحرية تامة لمشروعك */}
          <form onSubmit={addModule} className="liquid-glass p-5 space-y-4 bg-gradient-to-b from-white/[0.01] to-transparent">
            <h3 className="text-xs font-black text-yellow-400 text-right flex items-center gap-1">➕ إضافة موديول دراسي جديد للمنظومة</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <input 
                type="text" placeholder="رمز المادة (M206)" value={newModId} 
                onChange={e => setNewModId(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center focus:border-cyan-400 outline-none font-bold text-white placeholder:text-gray-600"
              />
              <input 
                type="number" step="1" placeholder="المعامل (Coef)" value={newModCoef} 
                onChange={e => setNewModCoef(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center focus:border-cyan-400 outline-none font-bold text-white placeholder:text-gray-600"
              />
              <input 
                type="text" placeholder="اسم الموديول بالكامل" value={newModName} 
                onChange={e => setNewModName(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-right focus:border-cyan-400 outline-none font-bold text-white placeholder:text-gray-600"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-xs font-black tracking-wide transition shadow-[0_4px_15px_rgba(6,182,212,0.1)]">
              تثبيت الموديول وإضافته للوحة التحكم الرئيسية
            </button>
          </form>

          {/* استعراض شجرة المواد الكاملة والقدرة على مسح وحذف التكرار والتنظيف الفوري */}
          <div className="space-y-2">
            <h3 className="text-right text-xs font-black text-gray-400 mb-1">📚 شجرة المواد الحالية والتحكم بالبيانات (إجمالي المعاملات: {stats.totalCoefs}):</h3>
            {modules.map((mod) => (
              <div key={mod.id} className="liquid-glass p-3.5 flex justify-between items-center bg-white/[0.01] hover:border-red-500/20 transition-all">
                <button 
                  onClick={() => deleteModule(mod.id)}
                  className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl hover:bg-red-500/30 font-bold transition"
                >
                  حذف المادة
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold text-gray-500">Coef {mod.coef}</span>
                  <span className="text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{mod.id}</span>
                </div>
                <p className="text-xs font-bold text-gray-200 text-right max-w-[45%] truncate">{mod.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === [ قسم إدارة الأساتذة والدليل الإرشادي وملاحظات الـ EFM ] === */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          
          {/* نموذج إضافة أستاذ وموجه جديد بشكل فوري وديناميكي وحر */}
          <form onSubmit={addTeacher} className="liquid-glass p-5 space-y-3 bg-gradient-to-b from-white/[0.01] to-transparent">
            <h3 className="text-xs font-black text-yellow-400 text-right">📋 إضافة بيانات أستاذ أو مرشد أكاديمي جديد</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <input 
                type="email" placeholder="البريد الإلكتروني" value={newTeacherContact} 
                onChange={e => setNewTeacherContact(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center focus:border-cyan-400 outline-none text-white font-bold"
              />
              <input 
                type="text" placeholder="المواد المسندة له" value={newTeacherSub} 
                onChange={e => setNewTeacherSub(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-right focus:border-cyan-400 outline-none text-white font-bold"
              />
              <input 
                type="text" placeholder="اسم الأستاذ الكامل" value={newTeacherName} 
                onChange={e => setNewTeacherName(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-right focus:border-cyan-400 outline-none text-white font-bold"
              />
            </div>
            <input 
              type="text" placeholder="توجيهات أو ملاحظات الأستاذ بخصوص الاختبارات والرسومات الرسمية" value={newTeacherNote} 
              onChange={e => setNewTeacherNote(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-right focus:border-cyan-400 outline-none text-white font-bold"
            />
            <button type="submit" className="w-full py-2.5 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400 rounded-xl text-xs font-black transition">
              حفظ بيانات الأستاذ وتحديث ملف الموجهين
            </button>
          </form>

          {/* استعراض دليل الأساتذة */}
          <div className="space-y-2">
            <h3 className="text-right text-xs font-black text-gray-400 mb-1">👥 أعضاء هيئة التدريس والإرشادات الفنية:</h3>
            {teachers.map((t) => (
              <div key={t.id} className="liquid-glass p-4 flex flex-col space-y-2 bg-white/[0.01]">
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => deleteTeacher(t.id)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    حذف السجل
                  </button>
                  <span className="text-[10px] text-cyan-400 font-black bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">{t.subject}</span>
                  <h4 className="text-xs font-black text-white text-right">{t.name}</h4>
                </div>
                {t.note && <p className="text-[11px] text-gray-400 text-right bg-black/20 p-2 rounded-lg border border-white/5 leading-relaxed">{t.note}</p>}
                {t.contact && <p className="text-[10px] text-gray-500 font-mono text-right">📬 الاتصال: {t.contact}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === [ قسم قائمة المهام (To-Do List) لجدولة المراجعة والرسومات الميكانيكية ] === */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          
          {/* إضافة مهمة جديدة للدراسة والمراجعة */}
          <form onSubmit={addTask} className="liquid-glass p-4 space-y-3 bg-white/[0.01]">
            <h3 className="text-xs font-black text-cyan-400 text-right">📝 جدولة المهام والرسومات الميكانيكية اليومية</h3>
            <div className="flex gap-2">
              <select 
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-2 text-xs focus:border-cyan-400 outline-none font-bold text-gray-300"
              >
                <option value="high">الأهمية: عالية 🛑</option>
                <option value="medium">الأهمية: متوسطة ⚠️</option>
                <option value="low">الأهمية: منخفضة ✅</option>
              </select>
              <input 
                type="text" 
                placeholder="أكتب عنوان المهمة (مثال: إنهاء كود CNC لمخرطة M209)..." 
                value={newTaskText} 
                onChange={e => setNewTaskText(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-right focus:border-cyan-400 outline-none text-white font-bold"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-black hover:bg-cyan-500/30 transition">
              إضافة المهمة لجدول المذاكرة اليومي
            </button>
          </form>

          {/* عرض مهام الطالب المخصصة */}
          <div className="space-y-2">
            <h3 className="text-right text-xs font-black text-gray-400 mb-1">📋 قائمة المهام النشطة:</h3>
            {tasks.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-6">تهانينا يا أيوب! لا توجد أي مهام معلقة حالياً.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`liquid-glass p-3.5 flex justify-between items-center transition-all ${task.completed ? 'opacity-40 line-through' : ''}`}>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10"
                  >
                    حذف
                  </button>
                  
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <p className="text-xs font-bold text-gray-200 text-right">{task.text}</p>
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-black/40 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  
                  {/* شارة الأهمية */}
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border mr-3 ${task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'عادية'}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}

export default App;
