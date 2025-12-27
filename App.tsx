
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Menu, 
  Stethoscope,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { REPORT_METADATA, WORKFORCE_DATA as INITIAL_DATA } from './constants';
import { WorkforceGroup, SummaryStats } from './types';

export type ViewType = 'overview' | 'workforce' | 'gaps' | 'recommendations';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  
  // Initialize data from localStorage or fallback to constants
  const [data, setData] = useState<WorkforceGroup[]>(() => {
    const saved = localStorage.getItem('hospital_workforce_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Calculate summary stats dynamically based on current data
  const [summary, setSummary] = useState<SummaryStats>(() => calculateSummary(data));

  function calculateSummary(workforceData: WorkforceGroup[]): SummaryStats {
    const totalPositions = workforceData.reduce((acc, curr) => acc + curr.total, 0);
    const totalOccupied = workforceData.reduce((acc, curr) => acc + curr.occupied, 0);
    const totalVacant = workforceData.reduce((acc, curr) => acc + curr.vacant, 0);
    
    return {
      totalPositions,
      totalOccupied,
      totalVacant,
      stabilityRate: totalPositions > 0 ? parseFloat(((totalOccupied / totalPositions) * 100).toFixed(1)) : 0,
      vacancyRate: totalPositions > 0 ? parseFloat(((totalVacant / totalPositions) * 100).toFixed(1)) : 0,
    };
  }

  useEffect(() => {
    localStorage.setItem('hospital_workforce_data', JSON.stringify(data));
    setSummary(calculateSummary(data));
  }, [data]);

  const handleReset = () => {
    if (confirm('هل أنت متأكد من رغبتك في استعادة البيانات الأصلية؟ سيتم فقدان جميع التعديلات الحالية والعودة لبيانات تقرير 2025.')) {
      localStorage.removeItem('hospital_workforce_data');
      setData(INITIAL_DATA);
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'overview': return 'لوحة التحكم العامة';
      case 'workforce': return 'توزيع القوى العاملة';
      case 'gaps': return 'تحليل الفجوات والاحتياجات';
      case 'recommendations': return 'التوصيات والقرارات';
      default: return 'لوحة التحكم';
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900" dir="rtl">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <Stethoscope className="text-blue-400 shrink-0" size={24} />
              <span className="font-bold whitespace-nowrap text-sm">مستشفى علي عمر عسكر</span>
            </div>
          )}
          {!isSidebarOpen && <Stethoscope className="text-blue-400 mx-auto" size={24} />}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-2 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="لوحة التحكم" 
            active={activeView === 'overview'} 
            onClick={() => setActiveView('overview')}
            isOpen={isSidebarOpen} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="توزيع القوى العاملة" 
            active={activeView === 'workforce'} 
            onClick={() => setActiveView('workforce')}
            isOpen={isSidebarOpen} 
          />
          <NavItem 
            icon={<AlertTriangle size={20} />} 
            label="تحليل الفجوات" 
            active={activeView === 'gaps'} 
            onClick={() => setActiveView('gaps')}
            isOpen={isSidebarOpen} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="التوصيات" 
            active={activeView === 'recommendations'} 
            onClick={() => setActiveView('recommendations')}
            isOpen={isSidebarOpen} 
          />
        </nav>

        <div className="px-4 py-2">
          <button 
            onClick={handleReset}
            className={`flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-xs font-bold py-2 ${!isSidebarOpen && 'justify-center w-full'}`}
          >
            <RotateCcw size={16} />
            {isSidebarOpen && <span>إعادة تعيين البيانات</span>}
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          {isSidebarOpen ? (
            <>
              <p>إعداد: {REPORT_METADATA.author}</p>
              <p>التاريخ: {REPORT_METADATA.date}</p>
            </>
          ) : (
            <span className="block text-center italic">2025</span>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'mr-64' : 'mr-20'
        } min-h-screen`}
      >
        <header className="bg-white border-b sticky top-0 z-40 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{getViewTitle()}</h1>
            <p className="text-sm text-slate-500">{REPORT_METADATA.hospital} | تقرير ملاك 2025</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <BarChart3 size={18} />
              <span className="hidden sm:inline">إدارة البيانات المرنة</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Dashboard 
            view={activeView} 
            workforceData={data} 
            setWorkforceData={setData}
            summaryStats={summary}
            onReset={handleReset}
          />
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, isOpen, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      active ? 'bg-blue-600 text-white shadow-md scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    {isOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
  </button>
);

export default App;
