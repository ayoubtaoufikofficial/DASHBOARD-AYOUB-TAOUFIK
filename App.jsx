import React, { useState, useEffect } from 'react';
import profileImg from './FB_IMG_1750515617631.jpg';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // ميزة إنتاجية: مؤقت التركيز (Pomodoro) للمراجعة
  const [gpa, setGpa] = useState("0.00");
  const [pomodoro, setPomodoro] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // قاعدة بيانات الموديولات الكاملة لتخصص TSMFM السنة 2
  const [modules, setModules] = useState([
    { id: 'M206', name: "Conception et Dessin d'outillages de production", coef: 4, mark: '' },
    { id: 'M203', name: "Élaboration et Constitution des dossiers de fabrication", coef: 4, mark: '' },
    { id: 'M209', name: "Programmation, réglage et conduite des MOCN", coef: 4, mark: '' },
    { id: 'M201', name: "Analyse de fabrication et Laboratoire méthodes", coef: 3, mark: '' },
    { id: 'M202', name: "Gestion de النظم والإنتاج الجودة", coef: 2, mark: '' },
  ]);

  // تحديث نقاط الموديولات
  const handleMarkChange = (id, value) => {
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 20)) {
      setModules(modules.map(mod => mod.id === id ? { ...mod, mark: value } : mod));
    }
  };

  // حساب الإحصائيات الحية
  const evaluatedCount = modules.filter(mod => mod.mark !== '').length;
  
  const calculateStats = () => {
    let totalPoints = 0;
    let totalCoefs = 0;
    modules.forEach(mod => {
      const markValue = parseFloat(mod.mark);
      if (!isNaN(markValue)) {
        totalPoints += (markValue * mod.coef);
        totalCoefs += mod.coef;
      }
    });
    const finalGpa = totalCoefs === 0 ? 0 : totalPoints / totalCoefs;
    const generalMastery = finalGpa ? ((finalGpa / 20) * 100).toFixed(0) : 0;
    return { gpa: finalGpa.toFixed(2), mastery: generalMastery };
  };

  const stats = calculateStats();

  // تشغيل مؤقت بومودورو للتركيز
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoro > 0) {
      interval = setInterval(() => setPomodoro(prev => prev - 1), 1000);
    } else if (pomodoro === 0) {
      setIsTimerRunning(false);
      alert("انتهت جلسة التركيز! خذ قسطاً من الراحة.");
      setPomodoro(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoro]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto font-sans antialiased text-white pb-24" style={{ direction: 'rtl' }}>
      
      {/* شريط علوي إنتاجي: عداد تنازلي للامتحان الجهوي EFM */}
      <div className="w-full bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-center text-xs font-bold text-cyan-400 mb-4 backdrop-blur-md">
        ⏳ الاستعداد للامتحان الجهوي المستمر: متبقي موديولات حاسمة للتقييم النهائي!
      </div>

      {/* 1. شريط الـ Header الكامل */}
      <div className="flex items-center justify-between p-4 liquid-glass mb-6 relative">
        <div className="flex gap-2">
          <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition text-sm">📥</button>
          <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition text-sm">📤</button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold tracking-widest">TSMFM • السنة الثانية</span>
          <div className="relative mt-2 mb-1">
            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">👑</span>
            <h1 className="text-xl md:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500">
              AYOUB TAOUFIK
            </h1>
          </div>
          <p className="text-[11px] text-cyan-400 font-medium">لوحة قيادة الدراسة – بوصلة التميز</p>
        </div>

        <div className="relative">
          <img 
            src={profileImg} 
            alt="Ayoub Taoufik" 
            className="w-14 h-14 rounded-full border-2 border-yellow-500 object-cover shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          />
        </div>
      </div>

      {/* 2. الإحصائيات الشاملة والمعدل والتدريب المهني */}
      <div className="liquid-glass p-6 mb-6 flex justify-between items-center text-center relative">
        <div className="flex flex-col justify-between h-20">
          <div>
            <p className="text-gray-400 text-[11px] mb-0.5">التمكن العام</p>
            <p className="text-lg font-black text-yellow-400">{stats.mastery}%</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px]">التدريب</p>
            <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">لم ينجز بعد</span>
          </div>
        </div>

        <div className="relative w-28 h-28 flex flex-col items-center justify-center rounded-full border-2 border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <h2 className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
            {stats.gpa}
          </h2>
          <span className="text-[10px] text-gray-400 font-bold mt-0.5">المعدل / 20</span>
        </div>

        <div>
          <p className="text-gray-400 text-[11px] mb-0.5">موديولات مقيمة</p>
          <p className="text-lg font-black text-cyan-400">{evaluatedCount}/18</p>
        </div>
      </div>

      {/* 3. شريط الخيارات والتنقل المحسن بالكامل */}
      <div className="liquid-glass p-1.5 mb-6 flex justify-between items-center gap-1 text-xs">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-gray-400'}`}
        >
          ⏱️ <span>القيادة</span>
        </button>
        <button 
          onClick={() => setActiveTab('modules')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'modules' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-gray-400'}`}
        >
          🔧 <span>الموديولات</span>
        </button>
        <button 
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'teachers' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-gray-400'}`}
        >
          📋 <span>الأساتذة</span>
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`py-2 px-4 rounded-xl font-bold transition-all ${activeTab === 'students' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-gray-400'}`}
        >
          👥
        </button>
      </div>

      {/* 4. محتويات الأقسام التفاعلية المحسنة */}
      
      {/* قسم القيادة الرئيسي */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          
          {/* ميزة مضافة: مؤقت التركيز الزجاجي (بومودورو) */}
          <div className="liquid-glass p-4 flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-transparent border-purple-500/20">
            <div className="text-right">
              <h4 className="text-xs font-bold text-purple-400">🧠 جلسة تركيز ذكية للمراجعة</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">راجع لمدة 25 دقيقة بدون تشتت لضمان الفهم العالي.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-white bg-black/40 px-3 py-1 rounded-lg border border-white/10">{formatTime(pomodoro)}</span>
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${isTimerRunning ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}
              >
                {isTimerRunning ? 'إيقاف' : 'ابدأ'}
              </button>
            </div>
          </div>

          <h3 className="text-right text-xs font-bold text-gray-400 flex items-center gap-1.5 pt-2">
            🎯 <span>أولويات اليوم — راجع هادو أولاً</span>
          </h3>
          
          {modules.slice(0, 3).map((mod, index) => {
            const masteryPercent = mod.mark !== '' ? ((parseFloat(mod.mark) / 20) * 100).toFixed(0) : 0;
            return (
              <div key={mod.id} className="liquid-glass p-5 flex flex-col relative overflow-hidden group">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 group-hover:w-1.5 transition-all"></div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-bold text-xs">#{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">{mod.id}</span>
                    <span className="text-[11px] font-extrabold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">Coef {mod.coef}</span>
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-gray-100 mb-3 text-right leading-snug">{mod.name}</h4>
                
                {/* شريط التقدم التلقائي التفاعلي الجديد */}
                <div className="w-full bg-white/5 h-1.5 rounded-full mb-4 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-l from-cyan-400 to-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${masteryPercent}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <input 
                    type="number" 
                    max="20" min="0" step="0.25"
                    placeholder="أدخل النقطة /20"
                    value={mod.mark}
                    onChange={(e) => handleMarkChange(mod.id, e.target.value)}
                    className="bg-transparent border-b border-gray-700 text-white focus:border-cyan-400 focus:outline-none w-28 text-center font-bold text-sm placeholder:text-xs placeholder:text-gray-500"
                  />
                  <span className="text-xs font-bold text-gray-400">التمكن {masteryPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* قسم الموديولات الكامل (تم تفعيله وعرض باقي المواد فيه بجمالية زجاجية) */}
      {activeTab === 'modules' && (
        <div className="space-y-3">
          <h3 className="text-right text-xs font-bold text-gray-400 mb-2">📚 شجرة المواد الشاملة (TSMFM)</h3>
          {modules.map((mod) => (
            <div key={mod.id} className="liquid-glass p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">Coef {mod.coef}</span>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10">{mod.id}</span>
              </div>
              <p className="text-xs font-bold text-gray-200 text-right max-w-[60%]">{mod.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* قسم الأساتذة الكامل */}
      {activeTab === 'teachers' && (
        <div className="space-y-3">
          <h3 className="text-right text-xs font-bold text-gray-400 mb-2">📋 الطاقم التربوي والتوجيهات</h3>
          <div className="liquid-glass p-4 flex justify-between items-center">
            <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-lg">M206 + M203</span>
            <div className="text-right">
              <h4 className="text-xs font-bold text-white">أستاذ ورشة التصميم والـ Bureau d'études</h4>
              <p className="text-[10px] text-gray-400 mt-1">يتابع رسومات الهندسة الميكانيكية والملفات التقنية للقطع.</p>
            </div>
          </div>
          <div className="liquid-glass p-4 flex justify-between items-center">
            <span className="text-xs text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded-lg">M209</span>
            <div className="text-right">
              <h4 className="text-xs font-bold text-white">أستاذ هندسة التصنيع وتصنيع الآلات CNC</h4>
              <p className="text-[10px] text-gray-400 mt-1">يتابع أكواد البرمجة الآلية والتحضير للإنتاج الفعلي.</p>
            </div>
          </div>
        </div>
      )}

      {/* قسم الزملاء / المجموعات الكامل */}
      {activeTab === 'students' && (
        <div className="liquid-glass p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto text-cyan-400 text-xl border border-cyan-500/20">👥</div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">مجموعات المراجعة والتحضير لـ EFM</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">يمكنك مستقبلاً ربط هذا القسم بزملاء تخصصك لمشاركة تصاميم الأوتيلات (Outillages) أو أكواد الـ CNC لرفع مستوى التنافس والتعلم الجماعي.</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
