
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Target, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  ChevronLeft,
  Briefcase,
  PieChart as PieChartIcon,
  FileText,
  Sparkles,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  Printer,
  BrainCircuit,
  Pencil,
  Trash2,
  PlusCircle,
  X,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { REPORT_METADATA } from '../constants';
import { ViewType } from '../App';
import { WorkforceGroup, SummaryStats } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  view: ViewType;
  workforceData: WorkforceGroup[];
  setWorkforceData: React.Dispatch<React.SetStateAction<WorkforceGroup[]>>;
  summaryStats: SummaryStats;
  onReset?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ view, workforceData, setWorkforceData, summaryStats, onReset }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for Edit/Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkforceGroup | null>(null);
  const [formData, setFormData] = useState<Partial<WorkforceGroup>>({});

  // Chart Data Preparation
  const stackedData = workforceData.map(item => ({
    name: item.name,
    occupied: item.occupied,
    vacant: item.vacant,
  }));

  const donutData = [
    { 
      name: 'كوادر طبية', 
      value: workforceData.filter(i => i.name.includes('طبي')).reduce((a, b) => a + b.total, 0), 
      fill: '#0ea5e9' 
    },
    { 
      name: 'كوادر إدارية', 
      value: workforceData.filter(i => i.name.includes('إداري')).reduce((a, b) => a + b.total, 0), 
      fill: '#8b5cf6' 
    },
    { 
      name: 'أخرى', 
      value: workforceData.filter(i => !i.name.includes('طبي') && !i.name.includes('إداري')).reduce((a, b) => a + b.total, 0), 
      fill: '#64748b' 
    },
  ];

  const generateAIReport = async () => {
    setIsGenerating(true);
    setAiReport(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const statsContext = JSON.stringify(summaryStats);
      const dataContext = JSON.stringify(workforceData);
      
      const prompt = `
        بصفتك مستشاراً استراتيجياً لإدارة المستشفيات وخبيراً في تحليل بيانات القوى العاملة الصحية، قم بإعداد تقرير "تحليل الفجوات والحلول الاستراتيجية" لمستشفى علي عمر عسكر لعام 2025.
        
        بيانات الأساس الحالية:
        - المجموع الكلي للملاك: ${summaryStats.totalPositions} وظيفة.
        - القوة المشغولة حالياً: ${summaryStats.totalOccupied} موظف.
        - إجمالي الشواغر: ${summaryStats.totalVacant} وظيفة (${summaryStats.vacancyRate}%).
        
        سياق البيانات التفصيلي: ${dataContext}
        
        المطلوب صياغة تقرير مهني يحتوي على الأقسام التالية:
        1. **ملخص تنفيذي ذكي**: قراءة سريعة لما تعنيه هذه الأرقام لمستقبل المستشفى.
        2. **تحليل المخاطر التشغيلية**: ما هي مخاطر بقاء الشواغر في الفئات الحساسة؟
        3. **حلول استراتيجية (5 نقاط على الأقل)**: قدم حلولاً عملية (مثل: التوظيف التعاقدي، برامج التدريب، التحول الرقمي).
        4. **توصيات عاجلة**: خطوات يجب اتخاذها خلال الـ 90 يوماً القادمة.
        
        اجعل التقرير منظماً باستخدام Markdown. الأسلوب يجب أن يكون رسمياً وموجهاً لصناع القرار.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiReport(response.text || "عذراً، لم يتم إنشاء التقرير بشكل صحيح.");
    } catch (error) {
      console.error("AI Generation Error:", error);
      setAiReport("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التأكد من صلاحية المفتاح والمحاولة مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (item: WorkforceGroup) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (name: string) => {
    if (confirm(`هل أنت متأكد من حذف المجموعة الوظيفية "${name}"؟`)) {
      setWorkforceData(prev => prev.filter(i => i.name !== name));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', vacant: 0, occupied: 0, total: 0, color: '#3b82f6' });
    setIsModalOpen(true);
  };

  const saveForm = () => {
    if (!formData.name) return alert('يرجى إدخال اسم المجموعة');
    
    // Auto calculate total and vacancy rate
    const occupied = Number(formData.occupied || 0);
    const vacant = Number(formData.vacant || 0);
    const total = occupied + vacant;
    const vacancyRate = total > 0 ? parseFloat(((vacant / total) * 100).toFixed(1)) : 0;

    const newItem: WorkforceGroup = {
      name: formData.name!,
      occupied,
      vacant,
      total,
      vacancyRate,
      color: formData.color || '#3b82f6'
    };

    if (editingItem) {
      setWorkforceData(prev => prev.map(i => i.name === editingItem.name ? newItem : i));
    } else {
      if (workforceData.find(i => i.name === newItem.name)) {
        return alert('هذا الاسم موجود مسبقاً، يرجى اختيار اسم آخر');
      }
      setWorkforceData(prev => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي الملاك الوظيفي" 
          value={summaryStats.totalPositions.toLocaleString()} 
          icon={<Users className="text-blue-500" size={24} />} 
          description="وظيفة مستهدفة"
          color="blue"
        />
        <StatCard 
          title="الوظائف المشغولة" 
          value={summaryStats.totalOccupied.toLocaleString()} 
          icon={<ShieldCheck className="text-emerald-500" size={24} />} 
          description={`${summaryStats.stabilityRate}% نسبة الاستقرار`}
          color="emerald"
        />
        <StatCard 
          title="الوظائف الشاغرة" 
          value={summaryStats.totalVacant.toLocaleString()} 
          icon={<UserPlus className="text-rose-500" size={24} />} 
          description={`${summaryStats.vacancyRate}% احتياج توظيفي`}
          color="rose"
        />
        <StatCard 
          title="الاحتياج الأكبر" 
          value={workforceData.length > 0 ? Math.max(...workforceData.map(i => i.vacant)).toString() : "0"} 
          icon={<AlertCircle className="text-amber-500" size={24} />} 
          description={`في أعلى فئة`}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            توزيع الفجوات الحالي
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar name="مشغول" dataKey="occupied" stackId="a" fill="#3b82f6" />
                <Bar name="شاغر" dataKey="vacant" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChartIcon className="text-emerald-500" size={20} />
            نسبة الكوادر الرئيسية
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {donutData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkforce = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">إدارة المجموعات الوظيفية</h3>
          <p className="text-sm text-slate-500">يمكنك الإضافة والتعديل والحذف لجعل الملاك أكثر مرونة</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {onReset && (
            <button 
              onClick={onReset}
              className="flex-1 md:flex-none border border-rose-200 text-rose-600 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-all"
            >
              <RotateCcw size={18} />
              استعادة الافتراضي
            </button>
          )}
          <button 
            onClick={handleAdd}
            className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <PlusCircle size={20} />
            إضافة فئة جديدة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-slate-500 text-sm border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">المجموعة الوظيفية</th>
                <th className="px-6 py-4 font-semibold text-center">الإجمالي</th>
                <th className="px-6 py-4 font-semibold text-center text-emerald-600">مشغول</th>
                <th className="px-6 py-4 font-semibold text-center text-rose-600">شاغر</th>
                <th className="px-6 py-4 font-semibold text-center">الإشغال %</th>
                <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workforceData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{row.name}</td>
                  <td className="px-6 py-4 text-center font-medium">{row.total}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">{row.occupied}</td>
                  <td className="px-6 py-4 text-center text-rose-600 font-bold">{row.vacant}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-full bg-gray-100 rounded-full h-2 max-w-[80px] mx-auto overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ width: `${100 - row.vacancyRate}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] mt-1 block font-bold text-slate-500">{(100 - row.vacancyRate).toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(row.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {workforceData.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>لا توجد بيانات حالياً، ابدأ بإضافة فئة جديدة.</p>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h4 className="font-bold text-lg text-slate-800">
                {editingItem ? 'تعديل مجموعة وظيفية' : 'إضافة مجموعة جديدة'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">اسم المجموعة</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="مثال: طبية، إدارية..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 text-emerald-600">العدد المشغول</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.occupied}
                    onChange={e => setFormData({ ...formData, occupied: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 text-rose-600">العدد الشاغر</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    value={formData.vacant}
                    onChange={e => setFormData({ ...formData, vacant: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl">
                <div className="flex justify-between text-sm font-bold text-blue-800">
                  <span>الإجمالي المحتسب:</span>
                  <span>{(Number(formData.occupied || 0) + Number(formData.vacant || 0))}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
              <button 
                onClick={saveForm}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                {editingItem ? 'تحديث البيانات' : 'إضافة المجموعة'}
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGaps = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-rose-600">
          <AlertCircle size={24} />
          تحليل احتياجات التوظيف (الشواغر)
        </h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 13, fontWeight: 700 }} width={120} orientation="right" />
              <Tooltip cursor={{ fill: '#fff1f2' }} />
              <Bar name="عدد الشواغر" dataKey="vacant" fill="#f43f5e" radius={[0, 8, 8, 0]} label={{ position: 'right', fontSize: 12, fontWeight: 'bold' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* AI Report Button Section */}
      <div className="flex flex-col gap-6">
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm text-indigo-600">
                <BrainCircuit size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900">محرك التحليل الذكي (AI Analysis)</h3>
                <p className="text-sm text-indigo-700">إنشاء تقرير استراتيجي مفصل بناءً على البيانات المعدلة حالياً</p>
              </div>
            </div>
            <button 
              onClick={generateAIReport}
              disabled={isGenerating}
              className="flex items-center gap-3 bg-indigo-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group w-full md:w-auto shrink-0"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Sparkles className="group-hover:rotate-12 transition-transform" size={20} />
              )}
              <span>{isGenerating ? 'جاري التحليل...' : 'إصدار التقرير الاستراتيجي'}</span>
            </button>
          </div>
        </div>

        {aiReport && (
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-6 duration-700 relative print:shadow-none print:border-none print:p-0">
            <div className="absolute top-8 left-8 flex gap-2 print:hidden">
               <button 
                onClick={() => window.print()}
                className="p-2.5 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                title="طباعة التقرير"
              >
                <Printer size={18} />
              </button>
              <button 
                onClick={() => setAiReport(null)}
                className="p-2.5 bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                title="إغلاق التقرير"
              >
                <RefreshCcw size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-10 text-center">
              <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                تقرير استراتيجي حصري - AI
              </div>
              <h3 className="text-3xl font-black text-slate-900">تقرير تحليل الفجوات والحلول المقترحة</h3>
              <div className="w-16 h-1 bg-indigo-600 mt-4 rounded-full"></div>
            </div>

            <div className="prose prose-indigo max-w-none text-slate-800 leading-loose whitespace-pre-wrap font-medium text-lg">
              {aiReport}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-500" />
                تحليل القوى العاملة المحدث | {REPORT_METADATA.hospital}
              </div>
              <div className="text-left font-mono">{REPORT_METADATA.date}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">الخلاصة والتوصيات الاستراتيجية</h3>
          <p className="text-slate-400 mb-8 max-w-2xl">بناءً على تحليل البيانات الحالية، هذه هي خريطة الطريق المقترحة للعام القادم.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <h4 className="text-amber-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">أولويات التنفيذ</h4>
              <ul className="space-y-4">
                <RecommendationItem 
                  num="01" 
                  title="إدارة الشواغر الحرجة" 
                  desc="البدء فوراً بشغل الوظائف في الفئات التي تتجاوز نسبة شغورها 30%." 
                />
                <RecommendationItem 
                  num="02" 
                  title="الاستقرار الوظيفي" 
                  desc="الحفاظ على المكتسبات في الفئات ذات نسبة الإشغال العالية عبر برامج الحوافز." 
                />
              </ul>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">التطوير المؤسسي</h4>
              <ul className="space-y-4">
                <RecommendationItem 
                  num="03" 
                  title="تحديث الملاك دورياً" 
                  desc="استخدام أدوات التعديل في لوحة التحكم لمواكبة المتغيرات الشهرية في القوة العاملة." 
                />
                <RecommendationItem 
                  num="04" 
                  title="الأتمتة والرقمنة" 
                  desc="تحويل التقارير الورقية إلى نظام لوحة التحكم هذا لضمان دقة اتخاذ القرار." 
                />
              </ul>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );

  // View Switcher
  switch (view) {
    case 'overview': return renderOverview();
    case 'workforce': return renderWorkforce();
    case 'gaps': return renderGaps();
    case 'recommendations': return renderRecommendations();
    default: return renderOverview();
  }
};

const RecommendationItem: React.FC<{ num: string, title: string, desc: string }> = ({ num, title, desc }) => (
  <li className="flex gap-4 group">
    <span className="text-slate-500 font-mono text-lg font-bold group-hover:text-blue-400 transition-colors">{num}</span>
    <div>
      <h5 className="font-bold text-slate-100 group-hover:translate-x-1 transition-transform">{title}</h5>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </li>
);

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  color: 'blue' | 'emerald' | 'rose' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, color }) => {
  const colorClasses = {
    blue: 'border-blue-100 hover:border-blue-300 hover:shadow-blue-50',
    emerald: 'border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-50',
    rose: 'border-rose-100 hover:border-rose-300 hover:shadow-rose-50',
    amber: 'border-amber-100 hover:border-amber-300 hover:shadow-amber-50',
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 transform hover:-translate-y-1 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-gray-300"><ArrowUpRight size={18} /></span>
      </div>
      <h4 className="text-gray-500 text-sm mb-1 font-medium">{title}</h4>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className={`text-sm font-semibold flex items-center gap-1 ${
        color === 'rose' ? 'text-rose-600' : 
        color === 'emerald' ? 'text-emerald-600' : 
        color === 'amber' ? 'text-amber-600' : 'text-blue-600'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          color === 'rose' ? 'bg-rose-600' : 
          color === 'emerald' ? 'bg-emerald-600' : 
          color === 'amber' ? 'bg-amber-600' : 'bg-blue-600'
        }`}></div>
        {description}
      </div>
    </div>
  );
};

export default Dashboard;
