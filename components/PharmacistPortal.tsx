
import React, { useState, useEffect, useRef } from 'react';
import { ISSUE_CATEGORIES, STATUS_COLORS, PRIORITY_COLORS, SUGGESTED_SOLUTIONS, PLATFORM_LINKS, LEARNING_RESOURCES, LD_TEAM_TITLE } from '../constants';
import { Issue, Priority } from '../types';
import { fetchIssues, submitIssue } from '../api';
import { RefreshCw, User, Phone, Tag, PlusCircle, Clock, Camera, X, Mail, CheckCircle2, Send, Image as ImageIcon, Lightbulb, Check, ExternalLink, Activity, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';

interface Props {
  isDarkMode?: boolean;
}

const PharmacistPortal: React.FC<Props> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'FORM' | 'MY_ISSUES' | 'RESOURCES'>('FORM');
  const [submitted, setSubmitted] = useState(false);
  const [showQuickFix, setShowQuickFix] = useState(false);
  const [resolvedByTip, setResolvedByTip] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    pharmacistName: '',
    mobileNumber: '',
    lmsEmail: '',
    category: '',
    description: '',
    priority: 'عادي' as Priority,
    screenshot: ''
  });

  useEffect(() => {
    const savedName = localStorage.getItem('pref_name') || '';
    const savedMobile = localStorage.getItem('pref_mobile') || '';
    const savedEmail = localStorage.getItem('pref_email') || '';
    
    setFormData(prev => ({
      ...prev,
      pharmacistName: savedName,
      mobileNumber: savedMobile,
      lmsEmail: savedEmail
    }));
  }, []);

  const loadMyIssues = async () => {
    setLoading(true);
    const data = await fetchIssues();
    const myMobile = localStorage.getItem('pref_mobile');
    const myEmail = localStorage.getItem('pref_email');
    
    const filtered = data.filter(i => 
      (myMobile && i.mobileNumber === myMobile) || 
      (myEmail && i.lmsEmail?.toLowerCase() === myEmail.toLowerCase())
    );
    setIssues(filtered.length > 0 ? filtered : data.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'MY_ISSUES') loadMyIssues();
  }, [activeTab]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData({ ...formData, category });
    setErrors(prev => ({ ...prev, category: '' }));
    if (category && SUGGESTED_SOLUTIONS[category]) {
      setShowQuickFix(true);
    } else {
      setShowQuickFix(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.pharmacistName.trim()) newErrors.pharmacistName = 'الاسم مطلوب';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'رقم الجوال مطلوب';
    if (!formData.lmsEmail.trim()) newErrors.lmsEmail = 'بريد المنصة مطلوب';
    if (!formData.category) newErrors.category = 'يرجى اختيار التصنيف';
    if (!formData.description.trim()) newErrors.description = 'وصف المشكلة مطلوب';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuickFixResolved = async () => {
    setLoading(true);
    await submitIssue({
      ...formData,
      status: 'تم الحل' as any,
      description: `[تم الحل ذاتياً] ${formData.category}`,
      priority: 'عادي'
    });
    setResolvedByTip(true);
    setLoading(false);
    setTimeout(() => {
      setResolvedByTip(false);
      setShowQuickFix(false);
      setFormData(prev => ({ ...prev, category: '' }));
      setActiveTab('MY_ISSUES');
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setFormData(prev => ({ ...prev, screenshot: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    localStorage.setItem('pref_name', formData.pharmacistName);
    localStorage.setItem('pref_mobile', formData.mobileNumber);
    localStorage.setItem('pref_email', formData.lmsEmail);

    const success = await submitIssue(formData);
    if (success) {
      setSubmitted(true);
      setShowQuickFix(false);
      setFormData(prev => ({ ...prev, description: '', category: '', screenshot: '' }));
      setErrors({});
      setTimeout(() => {
        setSubmitted(false);
        setActiveTab('MY_ISSUES');
      }, 2000);
    }
    setLoading(false);
  };

  const cardClasses = isDarkMode 
    ? "bg-[#001a4d] border-white/5 shadow-2xl shadow-black/40" 
    : "bg-white border-gray-100 shadow-xl shadow-gray-200/50";

  const inputClasses = isDarkMode
    ? "bg-black/20 border-white/10 text-white focus:border-[#3FA9F5]"
    : "bg-gray-50 border-gray-100 text-gray-800 focus:border-[#002060] focus:bg-white focus:ring-4 focus:ring-[#002060]/5";

  return (
    <div className={`h-full overflow-y-auto pb-24 px-4 py-8 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-b from-[#001030] to-[#001a4d]' : 'bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF]'}`}>
      <div className="max-w-md mx-auto">
        
        {/* Tabs */}
        <div className={`flex backdrop-blur-xl rounded-2xl p-1.5 mb-10 shadow-xl border transition-all ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white/70 border-white/50 shadow-[#002060]/5'}`}>
          <button onClick={() => setActiveTab('FORM')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === 'FORM' ? (isDarkMode ? 'bg-[#3FA9F5] text-white' : 'bg-[#002060] text-white shadow-lg') : 'text-gray-400'}`}>
            <PlusCircle size={16} />
            <span className="text-[10px] font-bold mt-1">بلاغ جديد</span>
          </button>
          <button onClick={() => setActiveTab('MY_ISSUES')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === 'MY_ISSUES' ? (isDarkMode ? 'bg-[#3FA9F5] text-white' : 'bg-[#002060] text-white shadow-lg') : 'text-gray-400'}`}>
            <Clock size={16} />
            <span className="text-[10px] font-bold mt-1">طلباتي</span>
          </button>
          <button onClick={() => setActiveTab('RESOURCES')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === 'RESOURCES' ? (isDarkMode ? 'bg-[#3FA9F5] text-white' : 'bg-[#002060] text-white shadow-lg') : 'text-gray-400'}`}>
            <BookOpen size={16} />
            <span className="text-[10px] font-bold mt-1">المصادر</span>
          </button>
        </div>

        {activeTab === 'FORM' && (
          <div className={`${cardClasses} rounded-[2.5rem] border overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700`}>
            <div className="bg-gradient-to-br from-[#00A99D] via-[#3FA9F5] to-[#F7941D] p-10 text-white relative">
              <h3 className="text-3xl font-bold mb-2">الدعم الفني</h3>
              <p className="text-white/80 text-sm font-medium">أرسل مشكلتك وسنقوم بحلها فوراً</p>
            </div>

            {submitted ? (
              <div className="p-20 text-center animate-in zoom-in duration-500">
                <CheckCircle2 size={56} className="text-[#00A99D] mx-auto mb-8 animate-bounce" />
                <h4 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>تم الإرسال بنجاح</h4>
                <p className="text-gray-400 text-sm">سيتم التواصل معك عبر الواتساب.</p>
              </div>
            ) : resolvedByTip ? (
              <div className="p-20 text-center animate-in zoom-in duration-500">
                <Check size={56} className="text-[#3FA9F5] mx-auto mb-8 animate-bounce" />
                <h4 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>رائع! حُلت المشكلة</h4>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold px-2 flex items-center gap-2 opacity-60`}>
                      <User size={12} /> الاسم الثلاثي
                    </label>
                    <input 
                      value={formData.pharmacistName} 
                      onChange={e => setFormData({...formData, pharmacistName: e.target.value})} 
                      className={`w-full border rounded-2xl px-5 py-3 text-sm font-bold transition-all outline-none ${inputClasses} ${errors.pharmacistName ? 'border-red-400' : ''}`} 
                      placeholder="أدخل اسمك الكامل" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold px-2 flex items-center gap-2 opacity-60`}>
                      <Phone size={12} /> رقم الجوال (واتساب)
                    </label>
                    <input 
                      value={formData.mobileNumber} 
                      onChange={e => setFormData({...formData, mobileNumber: e.target.value})} 
                      className={`w-full border rounded-2xl px-5 py-3 text-sm font-bold transition-all outline-none dir-ltr ${inputClasses} ${errors.mobileNumber ? 'border-red-400' : ''}`} 
                      placeholder="رقم الجوال (05xxxx أو 01xxxx)" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold px-2 flex items-center gap-2 opacity-60`}>
                      <Mail size={12} /> بريد المنصة
                    </label>
                    <input 
                      type="email" 
                      value={formData.lmsEmail} 
                      onChange={e => setFormData({...formData, lmsEmail: e.target.value})} 
                      className={`w-full border rounded-2xl px-5 py-3 text-sm font-bold transition-all outline-none dir-ltr ${inputClasses} ${errors.lmsEmail ? 'border-red-400' : ''}`} 
                      placeholder="البريد الإلكتروني المسجل" 
                    />
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className={`text-[10px] font-bold px-2 flex items-center gap-2 opacity-60`}>
                      <Tag size={12} /> تصنيف المشكلة
                    </label>
                    <select 
                      value={formData.category} 
                      onChange={handleCategoryChange} 
                      className={`w-full border rounded-2xl px-5 py-3 text-sm font-bold transition-all outline-none ${inputClasses} ${errors.category ? 'border-red-400' : ''}`}
                    >
                      <option value="">اختر التصنيف</option>
                      {ISSUE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {showQuickFix && (
                    <div className={`rounded-2xl p-5 space-y-3 animate-in slide-in-from-top-4 duration-500 shadow-lg ${isDarkMode ? 'bg-orange-500/10 border border-orange-500/20 text-orange-200' : 'bg-orange-50 border border-orange-100 text-orange-900'}`}>
                      <div className="flex items-center gap-2">
                        <Lightbulb size={16} className="animate-pulse" />
                        <h4 className="font-black text-xs">حل سريع مقترح:</h4>
                      </div>
                      <ul className="space-y-1.5 text-[10px] font-bold leading-relaxed">
                        {SUGGESTED_SOLUTIONS[formData.category]?.map((tip, idx) => <li key={idx} className="flex gap-2 opacity-80"><span className="shrink-0">•</span> {tip}</li>)}
                      </ul>
                      <div className="pt-2 flex gap-2">
                        <button type="button" onClick={handleQuickFixResolved} className="flex-1 bg-[#3FA9F5] text-white font-black py-2 rounded-xl text-xs">تم الحل</button>
                        <button type="button" onClick={() => setShowQuickFix(false)} className="flex-1 bg-white/10 text-[10px] font-bold py-2 rounded-xl opacity-60">لا، أرسل البلاغ</button>
                      </div>
                    </div>
                  )}

                  {!showQuickFix && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold px-2 opacity-60`}>وصف المشكلة</label>
                        <textarea 
                          value={formData.description} 
                          onChange={e => setFormData({...formData, description: e.target.value})} 
                          rows={2} 
                          className={`w-full border rounded-2xl px-5 py-3 text-sm font-bold outline-none ${inputClasses} ${errors.description ? 'border-red-400' : ''}`} 
                          placeholder="اشرح المشكلة باختصار..."
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        {!formData.screenshot ? (
                          <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full h-20 flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-2xl transition-all ${isDarkMode ? 'border-white/10 text-white/20' : 'border-gray-100 text-gray-300'}`}>
                            <Camera size={18} />
                            <span className="text-[9px] font-bold">إرفاق صورة (اختياري)</span>
                          </button>
                        ) : (
                          <div className="relative rounded-2xl overflow-hidden border border-white/10 group h-24">
                            <img src={formData.screenshot} alt="Preview" className="w-full h-full object-cover" />
                            <button onClick={removeScreenshot} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><X size={20} /></button>
                          </div>
                        )}
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                      </div>

                      <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#00A99D] via-[#3FA9F5] to-[#F7941D] text-white font-bold py-4 rounded-2xl shadow-xl flex justify-center items-center gap-3 active:scale-[0.97] text-lg">
                        {loading ? <RefreshCw className="animate-spin" /> : <Send size={18} />}
                        إرسال البلاغ
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'MY_ISSUES' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {issues.length === 0 ? (
               <div className={`${cardClasses} p-20 text-center rounded-[2.5rem]`}>
                 <p className="text-gray-400 font-bold">لا يوجد بلاغات سابقة</p>
               </div>
            ) : issues.map(issue => (
              <div key={issue.id} className={`${cardClasses} p-6 rounded-[2rem] relative overflow-hidden group`}>
                <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${issue.status === 'تم الحل' ? 'bg-[#00A99D]' : 'bg-[#F7941D]'}`}></div>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[9px] px-3 py-1 rounded-lg font-black ${STATUS_COLORS[issue.status]}`}>{issue.status}</span>
                  <span className="text-[9px] text-gray-400 font-mono">#{issue.id.split('-').pop()}</span>
                </div>
                <h4 className={`font-bold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-[#002060]'}`}>{issue.category}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-1">{issue.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'RESOURCES' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="grid grid-cols-2 gap-4">
               {LEARNING_RESOURCES.map(res => (
                 <a key={res.id} href={res.link} target="_blank" rel="noreferrer" className={`${cardClasses} p-5 rounded-[1.8rem] text-center hover:scale-[1.02] transition-all`}>
                   <div className="bg-gradient-to-br from-[#00A99D] to-[#3FA9F5] text-white w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">{res.icon}</div>
                   <p className="text-[10px] font-black line-clamp-2 leading-tight">{res.title}</p>
                 </a>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistPortal;
