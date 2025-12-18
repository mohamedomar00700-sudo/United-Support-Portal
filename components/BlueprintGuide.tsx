
import React from 'react';
import { APPSHEET_COLUMNS } from '../constants';
import { CheckCircle2, Code, Globe, Link as LinkIcon, FileSpreadsheet } from 'lucide-react';

const BlueprintGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 overflow-y-auto h-full text-right" dir="rtl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">تحديث هيكل البيانات (13 عموداً)</h2>
        <p className="text-gray-600">تم تحديث النظام ليتوافق مع الحذف الأخير لأعمدة "المنطقة" و"الفرع" من جوجل شيت.</p>
      </div>

      <section className="bg-emerald-900 text-white rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6" />
          <h3 className="text-xl font-bold">حالة الربط البرمجي</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700">
            <p className="text-xs text-emerald-300 mb-1 font-bold uppercase tracking-wider">رابط القراءة (CSV)</p>
            <p className="text-[10px] opacity-70 truncate mb-2">1X3MlikMug_yu1x8hogFpwfT3_gSOmle4CSrBcDdnLds</p>
            <span className="bg-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">متزامن ✅</span>
          </div>
          <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700">
            <p className="text-xs text-emerald-300 mb-1 font-bold uppercase tracking-wider">رابط الكتابة (API)</p>
            <p className="text-[10px] opacity-70 truncate mb-2">AKfycbzb5gn1n6dlZ9Z5D3LuMEAjSaDswAHfKknSNAc4bP9SDgekQXU5L3CE6CH6uRzeczTaNA</p>
            <span className="bg-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">محدث ⚡</span>
          </div>
        </div>

        <div className="bg-emerald-800 p-4 rounded-xl flex items-center gap-3">
          <LinkIcon className="text-emerald-400 shrink-0" size={20} />
          <p className="text-xs leading-relaxed">
            تم إعادة ترتيب الفهارس (Indices) برمجياً لضمان عدم تداخل البيانات بعد حذف الأعمدة.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <FileSpreadsheet className="text-emerald-600" />
          <h3 className="text-xl font-bold">ترتيب الأعمدة الحالي في الشيت</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-bold border-b">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">اسم العمود (Code)</th>
                <th className="px-4 py-3">الوصف العربي</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {APPSHEET_COLUMNS.map((col, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-emerald-600 font-bold">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold">{col.columnName}</td>
                  <td className="px-4 py-3 text-gray-500">{col.arabicLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BlueprintGuide;
