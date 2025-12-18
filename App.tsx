
import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import PharmacistPortal from './components/PharmacistPortal';
import AdminDashboard from './components/AdminDashboard';
import { Building2, ShieldCheck, Lock, X, UserCircle, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { ADMIN_ACCESS_CODE, LD_TEAM_TITLE } from './constants';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('PHARMACIST');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_auth') === 'true';
    if (isAuth) setIsAdminAuthenticated(true);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleAdminAccessRequest = () => {
    if (isAdminAuthenticated) {
      setViewMode('ADMIN');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === ADMIN_ACCESS_CODE) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setShowLoginModal(false);
      setViewMode('ADMIN');
      setLoginError(false);
    } else {
      setLoginError(true);
      setAccessCode('');
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-500 font-['Tajawal'] overflow-hidden ${isDarkMode ? 'bg-[#001030] text-white' : 'bg-[#F8FAFC] text-gray-900'}`} dir="rtl">
      {/* Full Width Header */}
      <header className={`shrink-0 z-50 shadow-sm h-20 w-full transition-all border-b ${isDarkMode ? 'bg-[#001a4d]/80 backdrop-blur-xl border-white/5' : 'bg-white/80 backdrop-blur-xl border-gray-100'}`}>
        <div className="w-full px-6 md:px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl shadow-lg bg-gradient-to-br from-[#00A99D] via-[#3FA9F5] to-[#F7941D]">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl md:text-2xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-[#002060]'}`}>صيدليات المتحدة</h1>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 opacity-70 ${isDarkMode ? 'text-[#3FA9F5]' : 'text-emerald-600'}`}>بوابة الدعم التقني | United Support</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <nav className={`hidden md:flex gap-2 p-1 rounded-2xl border transition-all ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
              <button 
                onClick={() => setViewMode('PHARMACIST')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${viewMode === 'PHARMACIST' ? (isDarkMode ? 'bg-[#3FA9F5] text-white' : 'bg-white text-[#002060] shadow-md border border-gray-100') : 'text-gray-400 hover:text-gray-300'}`}
              >
                بوابة الصيادلة
              </button>
              <button 
                onClick={handleAdminAccessRequest}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${viewMode === 'ADMIN' ? (isDarkMode ? 'bg-[#3FA9F5] text-white' : 'bg-white text-[#002060] shadow-md border border-gray-100') : 'text-gray-400 hover:text-gray-300'}`}
              >
                {isAdminAuthenticated ? <LayoutDashboard size={16} /> : <Lock size={16} />}
                لوحة الإدارة
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative overflow-hidden">
        {viewMode === 'PHARMACIST' && (
          <div className="h-full w-full overflow-y-auto">
             <PharmacistPortal isDarkMode={isDarkMode} />
          </div>
        )}
        {viewMode === 'ADMIN' && (
          <div className="h-full w-full">
             <AdminDashboard isDarkMode={isDarkMode} />
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLoginModal(false)}></div>
          <div className={`relative w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300 border transition-all ${isDarkMode ? 'bg-[#001a4d] border-white/10 text-white' : 'bg-white border-gray-100'}`}>
            <button onClick={() => setShowLoginModal(false)} className="absolute left-8 top-8 text-gray-300 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="text-center mb-10">
              <div className="bg-gradient-to-br from-[#00A99D] to-[#3FA9F5] text-white w-20 h-20 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#3FA9F5]/20">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2">دخول الإدارة</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">فريق {LD_TEAM_TITLE}</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className={`space-y-2 ${loginError ? 'animate-shake' : ''}`}>
                <label className="text-[11px] font-black opacity-60 pr-3 uppercase tracking-widest">رمز الأمان</label>
                <input 
                  autoFocus
                  type="password" 
                  placeholder="••••••" 
                  className={`w-full border rounded-2xl px-6 py-5 text-center font-mono text-2xl tracking-[0.5em] outline-none transition-all shadow-inner ${isDarkMode ? 'bg-black/20 border-white/10 text-white focus:border-[#3FA9F5]' : 'bg-gray-50 border-gray-100 focus:border-[#002060] focus:bg-white focus:ring-4 focus:ring-[#002060]/5'}`}
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setLoginError(false);
                  }}
                />
                {loginError && <p className="text-red-500 text-[10px] text-center font-black mt-2">عذراً، الرمز غير صحيح</p>}
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-[#00A99D] to-[#3FA9F5] hover:from-[#3FA9F5] hover:to-[#00A99D] text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-lg">
                فتح النظام
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Bar */}
      <div className={`md:hidden px-8 py-4 flex justify-around items-center shrink-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] border-t transition-all ${isDarkMode ? 'bg-[#001a4d] border-white/5' : 'bg-white border-gray-100'}`}>
        <button 
          onClick={() => setViewMode('PHARMACIST')}
          className={`flex flex-col items-center gap-1.5 transition-all ${viewMode === 'PHARMACIST' ? (isDarkMode ? 'text-[#3FA9F5] scale-110' : 'text-[#002060] scale-110') : 'text-gray-400'}`}
        >
          <UserCircle size={26} />
          <span className="text-[10px] font-black uppercase tracking-wider">البلاغات</span>
        </button>
        <button 
          onClick={handleAdminAccessRequest}
          className={`flex flex-col items-center gap-1.5 transition-all ${viewMode === 'ADMIN' ? (isDarkMode ? 'text-[#3FA9F5] scale-110' : 'text-[#002060] scale-110') : 'text-gray-400'}`}
        >
          {isAdminAuthenticated ? <LayoutDashboard size={26} /> : <Lock size={26} />}
          <span className="text-[10px] font-black uppercase tracking-wider">الإدارة</span>
        </button>
      </div>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.15s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default App;
