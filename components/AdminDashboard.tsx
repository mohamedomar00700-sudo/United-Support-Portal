
import React, { useState, useMemo, useEffect } from 'react';
import { Issue, IssueStatus, Priority } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS, LD_TEAM_TITLE, ISSUE_CATEGORIES } from '../constants';
import { Search, X, ChevronRight, RefreshCw, AlertTriangle, Clock, Settings, UserCheck, LayoutGrid, ZoomIn, Target, Phone, MessageSquare, Activity, Check, BarChart3, PieChart as PieIcon, TrendingUp, CheckCircle2 } from 'lucide-react';
import { fetchIssues, updateIssueInSheet } from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface Props {
  isDarkMode?: boolean;
}

const AdminDashboard: React.FC<Props> = ({ isDarkMode }) => {
  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'ANALYTICS'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editStatus, setEditStatus] = useState<IssueStatus>('جديدة');
  const [editNotes, setEditNotes] = useState('');
  const [editResolvedAt, setEditResolvedAt] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState(LD_TEAM_TITLE);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    const data = await fetchIssues();
    setIssues(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 25000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedIssue) {
      setEditStatus(selectedIssue.status);
      setEditNotes(selectedIssue.resolutionNotes || '');
      setEditResolvedAt(selectedIssue.resolvedAt || '');
      setEditAssignedTo(selectedIssue.assignedTo || LD_TEAM_TITLE);
    }
  }, [selectedIssue]);

  const handleStatusChange = (newStatus: IssueStatus) => {
    setEditStatus(newStatus);
    if (newStatus === 'تم الحل') {
      const now = new Date().toLocaleString('ar-EG');
      setEditResolvedAt(now);
    } else {
      setEditResolvedAt(''); 
    }
  };

  const processSave = async () => {
    if (!selectedIssue) return;
    setRefreshing(true);
    const updatedIssue = {
      ...selectedIssue,
      status: editStatus,
      resolutionNotes: editNotes,
      resolvedAt: editResolvedAt,
      assignedTo: editAssignedTo
    };
    
    // إرسال التحديث للشيت مباشرة
    const success = await updateIssueInSheet(updatedIssue);
    if (success) {
      // إعادة تحميل البيانات من الشيت لضمان المزامنة
      await loadData(true);
      setSelectedIssue(null);
    } else {
      // إظهار رسالة خطأ للمستخدم لمساعدة التشخيص
      // لا نغلق المودال حتى يصلح المستخدم أو يحاول مرة أخرى
      try {
        // حاول إظهار خطأ ناعم داخل الواجهة
        // eslint-disable-next-line no-alert
        alert('حدث خطأ أثناء حفظ التحديث في جوجل شيت. يرجى التحقق من اتصال الشبكة أو إعدادات السكربت (CORS).');
      } catch (e) {
        // fallback: console
        console.error('Save failed, and alert could not be shown', e);
      }
    }
    setRefreshing(false);
  };

  const formatWhatsAppNumber = (rawNumber: string) => {
    let cleaned = rawNumber.trim().replace(/\D/g, ''); 
    if (rawNumber.startsWith('+')) return rawNumber.substring(1);
    if (rawNumber.startsWith('00')) return cleaned.substring(2);
    if (cleaned.startsWith('05') && cleaned.length === 10) return '966' + cleaned.substring(1);
    if (cleaned.startsWith('5') && cleaned.length === 9) return '966' + cleaned;
    if (cleaned.startsWith('01') && cleaned.length === 11) return '20' + cleaned.substring(1);
    if (cleaned.startsWith('1') && cleaned.length === 10) return '20' + cleaned;
    return cleaned;
  };

  const openWhatsApp = (issue: Issue, type: 'CHAT' | 'RESOLVE') => {
    const phone = formatWhatsAppNumber(issue.mobileNumber);
    const name = issue.pharmacistName;
    const id = issue.id.split('-').pop();
    let message = type === 'CHAT' 
      ? `دكتور/ة ${name}، بخصوص بلاغك رقم #${id}، معك فريق التدريب والتطوير من صيدليات المتحدة..` 
      : `دكتور/ة ${name}، بخصوص بلاغك رقم #${id}، تم بفضل الله حل المشكلة. \n\nملاحظات الإدارة: ${editNotes || "تمت المعالجة بنجاح."}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const analyticsData = useMemo(() => {
    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryCounts = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = issues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusPie = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));

    const categoryBar = Object.keys(categoryCounts).map(cat => ({
      name: cat.length > 15 ? cat.substring(0, 15) + '..' : cat,
      count: categoryCounts[cat]
    }));

    const resolved = issues.filter(i => i.status === 'تم الحل').length;
    const total = issues.length;

    return { statusPie, categoryBar, priorityCounts, resolved, total };
  }, [issues]);

  const stats = useMemo(() => {
    const resolved = analyticsData.resolved;
    const totalCount = analyticsData.total;
    return {
      total: totalCount,
      new: issues.filter(i => i.status === 'جديدة').length,
      urgent: issues.filter(i => i.priority === 'عاجل' && i.status !== 'تم الحل').length,
      resolved: resolved,
      percentage: totalCount > 0 ? Math.round((resolved / totalCount) * 100) : 0
    };
  }, [issues, analyticsData]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchSearch = (issue.pharmacistName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (issue.mobileNumber || '').includes(searchTerm) ||
                          (issue.id || '').includes(searchTerm);
      const matchStatus = !filterStatus || issue.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [issues, searchTerm, filterStatus]);

  const COLORS = ['#3FA9F5', '#00A99D', '#F7941D', '#8B5CF6', '#EC4899'];

  if (loading) return (
    <div className={`flex flex-col items-center justify-center h-full w-full gap-8 ${isDarkMode ? 'bg-[#001030]' : 'bg-[#F8FAFC]'}`}>
      <div className="w-16 h-16 border-4 border-[#3FA9F5]/20 border-t-[#3FA9F5] rounded-full animate-spin"></div>
      <p className="font-bold tracking-widest text-xs uppercase opacity-60">جاري التحميل من جوجل شيت..</p>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden relative">
      <aside className={`w-full md:w-80 lg:w-96 border-l p-6 md:p-10 flex flex-col gap-8 shrink-0 z-20 transition-all ${isDarkMode ? 'bg-[#001a4d] border-white/5' : 'bg-white border-gray-100 shadow-xl'}`}>
        <div className="flex justify-between items-center">
           <h3 className="font-bold flex items-center gap-3 text-lg md:text-xl">
            <Settings size={20} className="text-[#3FA9F5]" /> الإدارة
          </h3>
          <button onClick={() => loadData()} className={`p-2 rounded-xl transition-all ${refreshing ? 'animate-spin text-[#3FA9F5]' : 'opacity-40 hover:opacity-100'}`}>
            <RefreshCw size={20}/>
          </button>
        </div>

        <div className={`p-1 rounded-2xl flex border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
           <button onClick={() => setActiveSubTab('LIST')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeSubTab === 'LIST' ? (isDarkMode ? 'bg-[#3FA9F5] text-white shadow-lg' : 'bg-white text-[#002060] shadow-sm') : 'text-gray-400'}`}>البلاغات</button>
           <button onClick={() => setActiveSubTab('ANALYTICS')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeSubTab === 'ANALYTICS' ? (isDarkMode ? 'bg-[#3FA9F5] text-white shadow-lg' : 'bg-white text-[#002060] shadow-sm') : 'text-gray-400'}`}>الإحصائيات</button>
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="بحث.." className={`w-full pr-11 py-3.5 border rounded-2xl text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-black/20 border-white/10 focus:border-[#3FA9F5]' : 'bg-gray-50 border-gray-100 focus:border-[#002060]'}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="mt-auto p-6 rounded-3xl bg-gradient-to-br from-[#00A99D]/10 to-[#3FA9F5]/10 border border-[#3FA9F5]/10">
           <div className="flex items-center gap-3 mb-2">
             <TrendingUp size={20} className="text-[#00A99D]" />
             <span className="text-xs font-black opacity-60">نسبة الإنجاز</span>
           </div>
           <p className="text-2xl font-black">{stats.percentage}%</p>
           <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00A99D] to-[#3FA9F5]" style={{ width: `${stats.percentage}%` }}></div>
           </div>
        </div>
      </aside>

      <div className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-8 ${isDarkMode ? 'bg-[#001030]' : 'bg-[#F8FAFC]'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'إجمالي الحالات', val: stats.total, color: 'border-[#3FA9F5]', icon: <LayoutGrid size={20}/> },
             { label: 'بلاغات جديدة', val: stats.new, color: 'border-blue-400', icon: <Clock size={20}/> },
             { label: 'عاجلة جداً', val: stats.urgent, color: 'border-[#F7941D]', icon: <AlertTriangle size={20} className="animate-pulse"/> },
             { label: 'تم الانتهاء', val: stats.resolved, color: 'border-[#00A99D]', icon: <CheckCircle2 size={20}/> }
           ].map((item, i) => (
             <div key={i} className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#001a4d] border-white/5' : 'bg-white border-gray-100 shadow-sm'} ${item.color} border-r-8`}>
               <div className="flex justify-between items-center mb-2 opacity-60">
                 <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                 {item.icon}
               </div>
               <p className="text-3xl font-black">{item.val}</p>
             </div>
           ))}
        </div>

        {activeSubTab === 'LIST' ? (
          <div className={`rounded-[2.5rem] border overflow-hidden transition-all animate-in fade-in duration-500 ${isDarkMode ? 'bg-[#001a4d] border-white/5' : 'bg-white border-gray-100 shadow-2xl'}`}>
             <div className="p-8 flex justify-between items-center border-b border-white/5">
                <h4 className="font-black text-xl flex items-center gap-3"><Activity className="text-[#00A99D]" /> سجل البلاغات الموحد</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#00A99D] animate-ping"></div>
                   <span className="text-[10px] font-black opacity-40">تحديث تلقائي</span>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-right text-sm">
                 <thead className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-black/20 text-white/30' : 'bg-gray-50 text-gray-400'}`}>
                   <tr>
                     <th className="px-8 py-5">الصيدلي</th>
                     <th className="px-8 py-5">المشكلة</th>
                     <th className="px-8 py-5 text-center">الحالة</th>
                     <th className="px-8 py-5 text-center">واتساب</th>
                     <th className="px-8 py-5 text-center">إجراء</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {filteredIssues.map(issue => (
                     <tr key={issue.id} className={`hover:bg-white/5 transition-all cursor-pointer group`} onClick={() => setSelectedIssue(issue)}>
                       <td className="px-8 py-6">
                         <div className="font-bold text-base">{issue.pharmacistName}</div>
                         <div className="text-[11px] opacity-40 flex items-center gap-2"><Phone size={10} /> {issue.mobileNumber}</div>
                       </td>
                       <td className="px-8 py-6">
                         <div className={`text-[11px] font-black px-3 py-1 rounded-lg w-fit mb-1 ${isDarkMode ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-500'}`}>{issue.lmsEmail}</div>
                         <div className="text-[12px] opacity-60">{issue.category}</div>
                       </td>
                       <td className="px-8 py-6 text-center">
                         <span className={`px-4 py-2 rounded-xl text-[10px] font-black border ${STATUS_COLORS[issue.status]}`}>{issue.status}</span>
                       </td>
                       <td className="px-8 py-6 text-center">
                         <button 
                           onClick={(e) => { e.stopPropagation(); openWhatsApp(issue, 'CHAT'); }} 
                           className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all whatsapp-glow"
                         >
                           <MessageSquare size={18} fill="currentColor" fillOpacity={0.2} />
                         </button>
                       </td>
                       <td className="px-8 py-6 text-center">
                          <ChevronRight className="mx-auto text-gray-300 group-hover:text-[#3FA9F5] transition-all" />
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Analytics Widgets */}
            <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#001a4d] border-white/5' : 'bg-white border-gray-100 shadow-xl'}`}>
               <h4 className="font-black text-lg mb-8 flex items-center gap-3"><PieIcon className="text-[#3FA9F5]" /> تحليل الحالات</h4>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={analyticsData.statusPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                       {analyticsData.statusPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                     <Legend verticalAlign="bottom" height={36}/>
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>
            {/* Additional analytics components can stay here */}
          </div>
        )}
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedIssue(null)}></div>
          <div className={`relative w-full max-w-xl h-full shadow-2xl flex flex-col p-10 transition-all ${isDarkMode ? 'bg-[#001a4d] border-r border-white/5' : 'bg-white'}`}>
             <div className="flex justify-between items-center mb-10 pb-5 border-b border-white/5">
                <h3 className="text-2xl font-black">تفاصيل البلاغ</h3>
                <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400"><X size={28} /></button>
             </div>
             
             <div className="flex flex-col gap-4 mb-10">
                <button 
                  onClick={() => openWhatsApp(selectedIssue, 'CHAT')} 
                  className="w-full bg-[#25D366] text-white py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] transition-all border-b-4 border-green-700 whatsapp-glow"
                >
                  <MessageSquare size={28} fill="white" /> تواصل عبر الواتساب
                </button>
             </div>

             <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                <div className={`p-6 rounded-3xl border-r-8 border-[#3FA9F5] shadow-sm ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                  <p className="text-[11px] font-black opacity-40 uppercase mb-2">الوصف:</p>
                  <p className="font-bold text-lg leading-relaxed italic">"{selectedIssue.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black opacity-40 uppercase px-2">الحالة</label>
                    <select value={editStatus} onChange={e => handleStatusChange(e.target.value as IssueStatus)} className={`w-full p-4 rounded-2xl font-black text-sm outline-none transition-all ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                       {['جديدة', 'تحت المعالجة', 'بانتظار رد الصيدلي', 'تم الحل'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black opacity-40 uppercase px-2">المسؤول</label>
                    <div className={`w-full p-4 rounded-2xl font-black text-sm opacity-50 ${isDarkMode ? 'bg-black/10' : 'bg-gray-100'}`}>{LD_TEAM_TITLE}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black opacity-40 uppercase px-2">ملاحظات فريق العمل</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={4} className={`w-full p-5 rounded-3xl font-bold text-sm outline-none transition-all ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-100'}`} placeholder="اكتب ملاحظات الحل.."></textarea>
                </div>
                
                {selectedIssue.screenshot && (
                   <div className="space-y-2">
                     <label className="text-[11px] font-black opacity-40 uppercase px-2">المرفق</label>
                     <div className="relative rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in" onClick={() => setViewerImage(selectedIssue.screenshot || null)}>
                        <img src={selectedIssue.screenshot} className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                           <ZoomIn className="text-white" size={32} />
                        </div>
                     </div>
                   </div>
                )}
             </div>

             <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                <button onClick={processSave} className="flex-[2] bg-gradient-to-r from-[#00A99D] to-[#3FA9F5] text-white font-black py-5 rounded-3xl text-xl shadow-xl transition-all active:scale-95">حفظ في جوجل شيت</button>
                <button onClick={() => setSelectedIssue(null)} className={`flex-1 font-bold py-5 rounded-3xl ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200'}`}>إلغاء</button>
             </div>
          </div>
        </div>
      )}

      {viewerImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setViewerImage(null)}>
           <button className="absolute top-10 right-10 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={32} /></button>
           <img src={viewerImage} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
