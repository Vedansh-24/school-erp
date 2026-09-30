'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, GraduationCap, BarChart3, Receipt, AlertTriangle, 
  MessageSquare, Wallet, UserCheck, Award, Calendar, BookOpen, FileText, 
  Users, Database, Search, Bell, User, Menu, Globe, Building2, ShieldCheck, Settings, CreditCard, TrendingUp, Server 
} from 'lucide-react';

// Sub-components import or inline definitions
import FeeMatrix from '@/components/school-dashboard/studentHub/FeeMatrix';
import StudentAnalyticsRTE from '@/components/school-dashboard/StudentAnalyticsRTE';
import FeeCollectionReceipt from '@/components/school-dashboard/FeeCollectionReceipt';
import StudentRegistration from '@/components/school-dashboard/studentHub/studentRegistration';
import StudentsDirectory from '@/components/school-dashboard/studentHub/studentsDirectory';
import PenaltyManager from '@/components/school-dashboard/PenaltyManager';
import ParentsCommunication from '@/components/school-dashboard/ParentsCommunication';
import ExpensesLog from '@/components/school-dashboard/ExpensesLog';
import StaffPayrollEngine from '@/components/school-dashboard/StaffPayrollEngine';
import AttendanceHolidays from '@/components/school-dashboard/AttendanceHolidays';
import DaybookAccounts from '@/components/school-dashboard/DaybookAccounts';
import ParentsCredentialsManager from '@/components/school-dashboard/parents-dashboard/ParentsCredentialsManager';
import HomeworkPublisherManager from '@/components/school-dashboard/parents-dashboard/HomeworkPublisherManager';
import ClassSubjectMaster from '@/components/school-dashboard/Exams-Reports/ClassSubjectMaster';
import QuestionPaperGenerator from '@/components/school-dashboard/Exams-Reports/QuestionPaperGenerator';
// Certificate Components Imports
// Certificate & Cards Components Imports (नए पाथ के साथ)
import CharacterCertificate from '@/components/school-dashboard/certificates-cards/CharacterCertificate';
import DobCertificate from '@/components/school-dashboard/certificates-cards/DobCertificate';
import BonafideCertificate from '@/components/school-dashboard/certificates-cards/BonafideCertificate';
import AppreciationCertificate from '@/components/school-dashboard/certificates-cards/AppreciationCertificate';
import IdCard from '@/components/school-dashboard/certificates-cards/IdCard';
import AdmitCard from '@/components/school-dashboard/certificates-cards/AdmitCard';
import GatePass from '@/components/school-dashboard/certificates-cards/GatePass';

// Transparent Background Logo Component with CORS fix
const TransparentSchoolLogo = ({ src = '/school-logo.png' }) => {
  const [cleanLogoSrc, setCleanLogoSrc] = useState(src);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 215 && data[i + 1] > 215 && data[i + 2] > 215) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setCleanLogoSrc(canvas.toDataURL());
      } catch (e) {
        console.log('Logo processing error:', e);
      }
    };
  }, [src]);

  return (
    <div 
      className="my-3 flex justify-center items-center p-2 rounded-xl shadow-md bg-white"
      style={{
        borderTop: '3px solid #FF6B8B',
        borderRight: '3px solid #00C9A7',
        borderBottom: '3px solid #FFB800',
        borderLeft: '5px solid #9D4EDD',
      }}
    >
      <img src={cleanLogoSrc} alt="School Logo" className="w-20 h-auto max-h-24 object-contain drop-shadow-md" />
    </div>
  );
};

export default function SchoolDashboard() {
  const router = useRouter();
  
  const [activeSession, setActiveSession] = useState('2026-2027');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [activeTab, setActiveTab] = useState('Dashboard & P/L');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [studentHubSubTab, setStudentHubSubTab] = useState('Students Directory');
  const [certSubTab, setCertSubTab] = useState('Character Certificate');
  const [examSubTab, setExamSubTab] = useState('Class-wise Subject Master'); 
  const [parentsDashboardSubTab, setParentsDashboardSubTab] = useState('Parent Portal Overview');
  const [searchQuery, setSearchQuery] = useState('');

  const sessionsList = ['2025-2026', '2026-2027', '2027-2028', '2028-2029', '2029-2030'];
  const classList = [
    'All Classes', 'PP.3+', 'PP.4+', 'PP.5+', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 
    'Eleventh (Arts)', 'Eleventh (Commerce)', 'Eleventh (Science)', 
    'Twelfth (Arts)', 'Twelfth (Commerce)', 'Twelfth (Science)'
  ];

  const [totalStudents] = useState(97);
  const [totalFees] = useState(10000);
  const [totalPenalty] = useState(71250);
  const [penaltyReceived] = useState(0);
  const [pendingDue] = useState(736677);
  const [totalReceivable] = useState(746677);
  const [staffDue] = useState(4591);
  const [staffPaid] = useState(0);
  const [otherExpenses] = useState(21750);
  const [profitAndLoss] = useState(-11750);

  const birthdayAlerts = [
    { id: 1, name: 'BHANUJ', class: 'Fourth' },
    { id: 2, name: 'BHAVESH', class: 'Fourth' }
  ];

  const handleWhatsAppShare = (name) => {
    const text = encodeURIComponent(`Happy Birthday ${name}! Wishing you a wonderful day from Blue Heaven Kids Academy 🎉`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Exact color sequence requested for rectangular icon boxes (Pink, Yellow, Blue, Yellow, Red, Pink, Red, Teal/Cyan, Pink, Yellow)
  const userColorPalette = [
    { boxColor: '#EC1E79', iconColor: '#ffffff' }, // Pink
    { boxColor: '#FFD400', iconColor: '#1A2332' }, // Yellow
    { boxColor: '#00AEEF', iconColor: '#ffffff' }, // Blue
    { boxColor: '#FFD400', iconColor: '#1A2332' }, // Yellow
    { boxColor: '#ED1C24', iconColor: '#ffffff' }, // Red
    { boxColor: '#EC1E79', iconColor: '#ffffff' }, // Pink
    { boxColor: '#ED1C24', iconColor: '#ffffff' }, // Red
    { boxColor: '#00A99D', iconColor: '#ffffff' }, // Teal/Cyan
    { boxColor: '#EC1E79', iconColor: '#ffffff' }, // Pink
    { boxColor: '#FFD400', iconColor: '#1A2332' }, // Yellow
  ];

  const menuItemsConfig = [
    { name: 'Dashboard & P/L', icon: LayoutDashboard },
    { name: 'Student Hub', icon: GraduationCap },
    { name: 'Student Analytics & RTE', icon: BarChart3 },
    { name: 'Fee Collection & Receipt', icon: Receipt },
    { name: 'Penalty Manager', icon: AlertTriangle },
    { name: 'Parents Communication', icon: MessageSquare },
    { name: 'Expenses Log', icon: Wallet },
    { name: 'Staff & Payroll Engine', icon: UserCheck },
    { name: 'Certificates & Cards ▾', icon: Award },
    { name: 'Attendance & Holidays', icon: Calendar },
    { name: 'Daybook & Accounts', icon: BookOpen },
    { name: 'Exams & Reports ▾', icon: FileText },
    { name: 'Parents Dashboard ▾', icon: Users },
    { name: 'Permanent Audit Logs', icon: Database },
  ];

  // Map each menu item to the user color palette cyclically
  const menuItems = menuItemsConfig.map((item, idx) => ({
    ...item,
    ...userColorPalette[idx % userColorPalette.length]
  }));

  const studentHubList = [
    'Student Registration',
    'Students Directory',
    'Category & Fee Matrix',
  ];

  const studentHubMap = {
    'Student Registration': StudentRegistration,
    'Students Directory': StudentsDirectory,
    'Category & Fee Matrix': FeeMatrix,
  };

  const certList = [
    'Character Certificate',
    'DOB Certificate',
    'Bonafide Certificate',
    'Appreciation Certificate',
    'ID Card',
    'Admit Card',
    'Student Out Pass / Gate Pass',
  ];

  const certificateMap = {
    'Character Certificate': CharacterCertificate,
    'DOB Certificate': DobCertificate,
    'Bonafide Certificate': BonafideCertificate,
    'Appreciation Certificate': AppreciationCertificate,
    'ID Card': IdCard,
    'Admit Card': AdmitCard,
    'Student Out Pass / Gate Pass': GatePass,
  };

  const examSubTabsList = [
    'Class-wise Subject Master',
    'Exam Schedule & Admit Card',
    'Primary Annual Report (PP.3+ to 4th)',
    'Progress Report (Class 6-11)',
    'Question Paper Generator',
  ];

 const examSubTabMap = {
  'Class-wise Subject Master': () => <ClassSubjectMaster />,
  'Exam Schedule & Admit Card': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Exam Schedule & Admit Card Module</div>,
  'Primary Annual Report (PP.3+ to 4th)': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Primary Annual Report Module</div>,
  'Progress Report (Class 6-11)': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Progress Report Module</div>,
  'Question Paper Generator': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Question Paper Generator Module</div>,
};

  const parentsDashboardSubTabsList = [
    'Parent Portal Overview',
    'Fee Dues & Passbook',
    'Student Attendance & Remarks',
    'Circulars & Notices',
    'Credentials Manager',
    'Homework Manager',
  ];

  const parentsDashboardSubTabMap = {
    'Parent Portal Overview': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Parent Portal Overview Module</div>,
    'Fee Dues & Passbook': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Fee Dues & Passbook Module</div>,
    'Student Attendance & Remarks': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Student Attendance & Remarks Module</div>,
    'Circulars & Notices': () => <div className="p-6 text-slate-700 font-bold bg-white rounded-xl shadow-sm border border-slate-200">Circulars & Notices Module</div>,
    'Credentials Manager': ParentsCredentialsManager,
    'Homework Manager': HomeworkPublisherManager,
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F5F7FA] text-[#1A2332] selection:bg-cyan-500 selection:text-black">
      
      {/* Top Header */}
      <header 
        className="bg-[#FFFFFF] px-6 py-3.5 flex items-center justify-between shadow-sm border-b border-slate-200 gap-4"
        style={{
          borderBottom: '3px solid transparent',
          borderImage: 'linear-gradient(to right, #FF6B8B, #9D4EDD, #00C9A7, #FFB800) 1'
        }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🏫</span>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#00C9A7] to-[#FFB800] font-black text-lg sm:text-xl tracking-wider drop-shadow-md">
            MySchoolDashboard ERP System
          </h1>
        </div>

        <div className="hidden xl:flex items-center justify-between px-6 py-2 bg-slate-50 rounded-full border border-slate-200 shadow-inner flex-1 mx-6 overflow-hidden">
          <span className="text-red-500 text-xl transform -rotate-6 filter drop-shadow">⭐</span>
          <span className="text-yellow-400 text-xl transform rotate-6 filter drop-shadow">⭐</span>
          <span className="text-emerald-500 text-xl transform -rotate-3 filter drop-shadow">⭐</span>
          <span className="text-purple-500 text-xl transform rotate-4 filter drop-shadow">⭐</span>
          <span className="text-sky-400 text-xl transform -rotate-8 filter drop-shadow">⭐</span>
          <span className="text-red-500 text-xl transform rotate-3 filter drop-shadow">⭐</span>
          <span className="text-yellow-400 text-xl transform -rotate-5 filter drop-shadow">⭐</span>
          <span className="text-emerald-500 text-xl transform rotate-6 filter drop-shadow">⭐</span>
          <span className="text-purple-500 text-xl transform -rotate-4 filter drop-shadow">⭐</span>
          <span className="text-sky-400 text-xl transform rotate-5 filter drop-shadow">⭐</span>
          <span className="text-red-500 text-xl transform -rotate-6 filter drop-shadow">⭐</span>
          <span className="text-yellow-400 text-xl transform rotate-6 filter drop-shadow">⭐</span>
        </div>

        <div className="text-[#2E7D4F] font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2 shrink-0 shadow-sm">
          <span>⚡</span> Enterprise Cloud SaaS Active
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        
        {/* Left Sidebar */}
        <aside 
          className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-[#1B3A6B] border-r border-[#2F6690]/40 flex flex-col justify-between shrink-0 p-3 shadow-xl z-10`}
        >
          <div>
            <div className="mb-4 pb-3 border-b border-blue-900/40 text-center flex flex-col items-center">
              <div className="w-full flex items-center justify-between px-1 mb-2">
                {isSidebarOpen && (
                  <span className="text-[12px] font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B8B] via-[#FFB800] to-[#00C9A7] truncate">
                    BLUE HEAVEN KIDS ACADEMY
                  </span>
                )}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-[#2F6690]/40 rounded-lg text-white transition ml-auto">
                  <Menu size={18} />
                </button>
              </div>

              {isSidebarOpen && (
                <p className="text-xs font-semibold text-slate-200 mt-0.5">
                  Session: <span className="text-[#C6952C] font-bold">{activeSession}</span>
                </p>
              )}
              
              {isSidebarOpen && <TransparentSchoolLogo src="/school-logo.png" />}
            </div>

            <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 font-bold ${
                    activeTab === item.name
                      ? 'bg-[#2F6690] text-white font-black shadow-md border-l-4 border-[#C6952C]'
                      : 'hover:bg-[#2F6690]/40 text-slate-200 hover:text-white'
                  }`}
                >
                  {/* Super-admin style rectangular icon box with exact custom palette colors */}
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm shrink-0 transition-transform hover:scale-105"
                    style={{ backgroundColor: item.boxColor }}
                  >
                    <item.icon size={20} style={{ color: item.iconColor }} className="drop-shadow-sm" />
                  </div>
                  {isSidebarOpen && <span className="ml-3 text-sm truncate">{item.name}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* User Profile Snippet */}
          {isSidebarOpen && (
            <div className="p-3 border-t border-[#2F6690]/40 flex items-center bg-[#1B3A6B] rounded-lg mt-2">
              <div 
                className="w-9 h-9 rounded-lg shadow-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#EC1E79' }}
              >
                <User size={18} className="text-white" />
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-black text-white">School Admin</p>
                <p className="text-xs text-slate-300 font-bold">Authorized User</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F5F7FA]">
          
          {/* Controls Bar */}
          <div className="py-3.5 px-6 bg-[#FFFFFF] border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-[#5C6B7A] font-bold">Session:</span>
                <select
                  value={activeSession}
                  onChange={(e) => setActiveSession(e.target.value)}
                  className="bg-[#F5F7FA] text-[#2F6690] text-xs sm:text-sm font-bold border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-[#2F6690] shadow-sm cursor-pointer"
                >
                  {sessionsList.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-[#5C6B7A] font-bold">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-[#F5F7FA] text-[#2F6690] text-xs sm:text-sm font-bold border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-[#2F6690] shadow-sm cursor-pointer max-w-[180px]"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="bg-[#F5F7FA] text-xs sm:text-sm font-semibold text-[#1A2332] placeholder-slate-400 pl-9 pr-3.5 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#2F6690] w-56 shadow-sm"
                />
              </div>

              <button className="bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-95">
                <span>📥</span> Import
              </button>

              <button className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-95">
                <span>💾</span> Backup
              </button>

              <button onClick={() => router.push('/')} className="bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs sm:text-sm px-4 py-2 rounded-md font-bold transition shadow-md hover:scale-[1.02] active:scale-95">
                Logout
              </button>
            </div>
          </div>

          {/* Dynamic Workspace */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            
            {activeTab === 'Dashboard & P/L' && (
              <div className="space-y-5">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
                  <div className="bg-white p-4 rounded-md border-l-4 border-l-cyan-400 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500 block">TOTAL REGISTERED STUDENTS</span>
                    <div className="text-2xl font-black text-[#1A2332] mt-1">{totalStudents}</div>
                  </div>

                  <div className="bg-white p-4 rounded-md border-l-4 border-l-emerald-400 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500 block">TOTAL FEES RECEIVED</span>
                    <div className="text-2xl font-black text-[#1A2332] mt-1">₹{totalFees}</div>
                  </div>

                  <div className="bg-white p-4 rounded-md border-l-4 border-l-cyan-500 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500 block">TOTAL PENALTY</span>
                    <div className="text-2xl font-black text-[#1A2332] mt-1">₹{totalPenalty}</div>
                  </div>

                  <div className="bg-white p-4 rounded-md border-l-4 border-l-emerald-500 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500 block">PENALTY RECEIVED</span>
                    <div className="text-2xl font-black text-[#1A2332] mt-1">₹{penaltyReceived}</div>
                  </div>

                  <div className="bg-white p-4 rounded-md border-l-4 border-l-red-500 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500 block">PENDING DUE</span>
                    <div className="text-2xl font-black text-[#EF4444] mt-1">₹{pendingDue}</div>
                  </div>

                  <div className="bg-white p-4 rounded-md border-l-4 border-l-cyan-400 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500 block">FEE RECEIVABLE</span>
                    <div className="text-2xl font-black text-[#1A2332] mt-1">₹{totalReceivable}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="bg-white p-4 rounded-md border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">STAFF PAYMENT (DUE / PAID)</span>
                    <div className="text-base font-black text-[#1A2332] mt-1.5">
                      Due: <span className="text-slate-800">₹{staffDue}</span> | Paid: <span className="text-slate-800">₹{staffPaid}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-md border-l-4 border-l-blue-400 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">OTHER EXPENSES</span>
                    <div className="text-2xl font-black text-[#1A2332] mt-1">₹{otherExpenses}</div>
                  </div>

                  <div className="bg-white p-4 rounded-md border-l-4 border-l-purple-500 border-y border-r border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">PROFIT / LOSS</span>
                    <div className={`text-2xl font-black mt-1 ${profitAndLoss < 0 ? 'text-[#EF4444]' : 'text-emerald-600'}`}>
                      {profitAndLoss < 0 ? '-' : ''}₹{Math.abs(profitAndLoss)}
                    </div>
                  </div>
                </div>

                {/* Birthday Alerts */}
                <div className="mt-6 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🎂</span> Today's Birthdays
                  </h3>
                  <div className="space-y-2">
                    {birthdayAlerts.length > 0 ? (
                      birthdayAlerts.map(alert => (
                        <div key={alert.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-xs">
                              {alert.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">{alert.name}</div>
                              <div className="text-xs font-semibold text-slate-500">Class: {alert.class}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleWhatsAppShare(alert.name)}
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-2 rounded-md transition shadow-md hover:scale-105 active:scale-95 flex items-center gap-2 text-xs font-bold"
                            title="Share on WhatsApp"
                          >
                            Wish on WhatsApp
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-sm font-semibold italic">No birthdays today.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Student Hub with Child Tabs */}
            {activeTab === 'Student Hub' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {studentHubList.map((subTab, idx) => {
                    const buttonColors = [
                      'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-orange-500/20',
                      'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-500/20',
                      'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-green-500/20',
                    ];
                    return (
                      <button
                        key={subTab}
                        onClick={() => setStudentHubSubTab(subTab)}
                        className={`px-5 py-3.5 rounded-xl text-sm sm:text-base font-black text-center transition-all duration-200 shadow-lg hover:scale-[1.01] active:scale-95 ${buttonColors[idx]} ${
                          studentHubSubTab === subTab ? 'ring-4 ring-offset-2 ring-slate-300' : 'opacity-90'
                        }`}
                      >
                        {subTab}
                      </button>
                    );
                  })}
                </div>

                <div>
                  {(() => {
                    const SubComponent = studentHubMap[studentHubSubTab];
                    return SubComponent ? <SubComponent searchQuery={searchQuery} /> : <div className="text-slate-500 p-6 font-semibold">Select a student hub section...</div>;
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'Student Analytics & RTE' && <StudentAnalyticsRTE />}
            {activeTab === 'Fee Collection & Receipt' && <FeeCollectionReceipt />}
            {activeTab === 'Penalty Manager' && <PenaltyManager />}
            {activeTab === 'Parents Communication' && <ParentsCommunication />}
            {activeTab === 'Expenses Log' && <ExpensesLog />}
            {activeTab === 'Staff & Payroll Engine' && <StaffPayrollEngine />}
            
            {activeTab === 'Certificates & Cards ▾' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {certList.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCertSubTab(c)}
                      className={`p-3 rounded-lg text-xs font-bold text-center transition ${
                        certSubTab === c ? 'bg-[#2F6690] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div>
                  {(() => {
                    const Comp = certificateMap[certSubTab];
                    return Comp ? <Comp /> : null;
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'Attendance & Holidays' && <AttendanceHolidays />}
            {activeTab === 'Daybook & Accounts' && <DaybookAccounts />}
            
            {activeTab === 'Exams & Reports ▾' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {examSubTabsList.map((eTab) => (
                    <button
                      key={eTab}
                      onClick={() => setExamSubTab(eTab)}
                      className={`p-3 rounded-lg text-xs font-bold text-center transition ${
                        examSubTab === eTab ? 'bg-[#2F6690] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {eTab}
                    </button>
                  ))}
                </div>
                <div>
                  {examSubTabMap[examSubTab]()}
                </div>
              </div>
            )}

            {activeTab === 'Parents Dashboard ▾' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                  {parentsDashboardSubTabsList.map((pTab) => (
                    <button
                      key={pTab}
                      onClick={() => setParentsDashboardSubTab(pTab)}
                      className={`p-3 rounded-lg text-xs font-bold text-center transition ${
                        parentsDashboardSubTab === pTab ? 'bg-[#2F6690] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pTab}
                    </button>
                  ))}
                </div>
                <div>
                  {parentsDashboardSubTabMap[parentsDashboardSubTab]()}
                </div>
              </div>
            )}

            {activeTab === 'Permanent Audit Logs' && (
              <div className="p-6 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold shadow-sm">
                Permanent Audit Logs Module Active
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
