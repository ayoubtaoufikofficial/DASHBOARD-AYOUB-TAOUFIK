import React, { useState } from 'react';
// استيراد صورتك الشخصية المرفوعة في المشروع
import profileImg from './FB_IMG_1750515617631.jpg';

function App() {
  // هنا نقوم بتخزين الموديولات ونقاطها (يمكنك إضافة موديولات أخرى هنا بنفس الطريقة)
  const [modules, setModules] = useState([
    { id: 'M206', name: "Conception et Dessin d'outillages de production", coef: 4, mark: '' },
    { id: 'M203', name: "Élaboration et Constitution des dossiers de fabrication", coef: 4, mark: '' },
    { id: 'M209', name: "Programmation, réglage et conduite des MOCN", coef: 4, mark: '' },
  ]);

  // دالة لتحديث نقطة الموديول عند الكتابة
  const handleMarkChange = (id, value) => {
    setModules(modules.map(mod => 
      mod.id === id ? { ...mod, mark: value } : mod
    ));
  };

  // دالة حساب المعدل العام تلقائياً
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCoefs = 0;
    modules.forEach(mod => {
      const markValue = parseFloat(mod.mark);
      if (!isNaN(markValue)) {
        totalPoints += (markValue * mod.coef);
        totalCoefs += mod.coef;
      }
    });
    return totalCoefs === 0 ? "0.00" : (totalPoints / totalCoefs).toFixed(2);
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto font-sans antialiased text-white">
      
      {/* 1. شريط الـ Header (الاسم، التاج، والصورة الشخصية) */}
      <div className="flex items-center justify-between p-4 liquid-glass mb-6 mt-4 relative">
        {/* أزرار جانبية */}
        <div className="flex gap-2">
          <button className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition text-sm">📥</button>
          <button className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition text-sm">📤</button>
        </div>

        {/* الاسم والتاج في المنتصف */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">TSMFM • السنة الثانية</span>
          
          <div className="relative mt-3 mb-1">
            {/* التاج الذهبي فوق الاسم مباشرة */}
            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">👑</span>
            <h1 className="text-xl md:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500">
              AYOUB TAOUFIK
            </h1>
          </div>
          
          <p className="text-[11px] text-cyan-400 font-medium">لوحة قيادة الدراسة – بوصلة التميز</p>
        </div>

        {/* الصورة الشخصية بإطار ذهبي فخم بدل العداد القديم */}
        <div className="relative">
          <img 
            src={profileImg} 
            alt="Ayoub Taoufik" 
            className="w-14 h-14 rounded-full border-2 border-yellow-500/80 object-cover shadow-[0_0_15px_rgba(234,179,8,0.35)]"
          />
        </div>
      </div>

      {/* 2. قسم العداد الدائري والمعدل العام بتصميم زجاجي كلي */}
      <div className="liquid-glass p-6 mb-6 flex justify-between items-center text-center relative overflow-hidden">
        <div>
          <p className="text-gray-400 text-xs mb-1">التمكن العام</p>
          <p className="text-lg font-black text-yellow-400">0%</p>
        </div>

        {/* حلقة المعدل المضيئة */}
        <div className="relative w-28 h-28 flex flex-col items-center justify-center rounded-full border-2 border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {calculateGPA()}
          </h2>
          <span className="text-[10px] text-gray-400 font-bold mt-0.5">المعدل / 20</span>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">موديولات مقيمة</p>
          <p className="text-lg font-black text-cyan-400">0/18</p>
        </div>
      </div>

      {/* 3. قائمة الموديولات بستايل الزجاج السائل Liquid Glass */}
      <div className="space-y-4">
        <h3 className="text-right text-sm font-bold text-gray-400 tracking-wide flex items-center justify-end gap-1.5 mb-2">
          <span>راجع هادو أولاً</span> 🎯
        </h3>
        
        {modules.map((mod, index) => (
          <div key={mod.id} className="liquid-glass p-5 flex flex-col relative overflow-hidden group">
            {/* خط توهج جانبي جمالي لكل بطاقة موديول */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 group-hover:w-1.5 transition-all"></div>
            
            {/* معلومات الموديول العلوية */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-bold text-xs">#{index + 1}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">{mod.id}</span>
                <span className="text-[11px] font-extrabold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">Coef {mod.coef}</span>
              </div>
            </div>
            
            {/* اسم الموديول الدراسي */}
            <h4 className="text-base font-bold text-gray-100 mb-4 text-right leading-snug">
              {mod.name}
            </h4>
            
            {/* شريط إدخال النقط والتمكن */}
            <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/5">
              <input 
                type="number" 
                max="20" min="0" step="0.25"
                placeholder="أدخل النقطة هنا"
                value={mod.mark}
                onChange={(e) => handleMarkChange(mod.id, e.target.value)}
                className="bg-transparent border-b border-gray-700 text-white focus:border-yellow-400 focus:outline-none w-28 text-center font-bold text-base placeholder:text-xs placeholder:text-gray-500"
              />
              <span className="text-xs font-semibold text-gray-400">التمكن 0%</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
