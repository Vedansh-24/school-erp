'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard as IconDashboard, GraduationCap as IconCap, BarChart3 as IconChart, 
  Receipt as IconReceipt, AlertTriangle as IconAlert, MessageSquare as IconMsg, 
  Wallet as IconWallet, UserCheck as IconCheck, Award as IconAward, 
  Calendar as IconCalendar, BookOpen as IconBook, FileText as IconFile, 
  Users as IconUsers, Database as IconDatabase, Search as IconSearch, 
  User as IconUser, Menu as IconMenu 
} from 'lucide-react';

import DashboardAndPL from '@/components/school-dashboard/DashboardAndPL';
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
import CircularsAndNoticesManager from '@/components/school-dashboard/parents-dashboard/CircularsAndNoticesManager';
import ClassSubjectMaster from '@/components/school-dashboard/Exams-Reports/ClassSubjectMaster';
import ExamScheduleAdmitCard from '@/components/school-dashboard/Exams-Reports/ExamScheduleAdmitCard';
import PrimaryAnnualReportManager from '@/components/school-dashboard/Exams-Reports/PrimaryAnnualReportManager';
import ProgressReportManager from '@/components/school-dashboard/Exams-Reports/ProgressReportManager';
import QuestionPaperGenerator from '@/components/school-dashboard/Exams-Reports/QuestionPaperGenerator';

import CharacterCertificate from '@/components/school-dashboard/certificates-cards/CharacterCertificate';
import DobCertificate from '@/components/school-dashboard/certificates-cards/DobCertificate';
import BonafideCertificate from '@/components/school-dashboard/certificates-cards/BonafideCertificate';
import AppreciationCertificate from '@/components/school-dashboard/certificates-cards/AppreciationCertificate';
import IdCard from '@/components/school-dashboard/certificates-cards/IdCard';
import AdmitCard from '@/components/school-dashboard/certificates-cards/AdmitCard';
import GatePass from '@/components/school-dashboard/certificates-cards/GatePass';
import ParentsPortalOverview from '@/components/parents-portal/ParentsPortalOverview';
import FeeDuesAndPassbook from '@/components/school-dashboard/parents-dashboard/FeeDuesAndPassbook';
import StudentAttendanceAndRemarks from '@/components/school-dashboard/parents-dashboard/StudentAttendanceAndRemarks';
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
        if (!ctx) return;

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
  const [activeTab, setActiveTab] = useState('Student Hub');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [studentHubSubTab, setStudentHubSubTab] = useState('Student Registration');
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

  const userColorPalette = [
    { boxColor: '#EC1E79', iconColor: '#ffffff' },
    { boxColor: '#FFD400', iconColor: '#1A2332' },
    { boxColor: '#00AEEF', iconColor: '#ffffff' },
    { boxColor: '#FFD400', iconColor: '#1A2332' },
    { boxColor: '#ED1C24', iconColor: '#ffffff' },
    { boxColor: '#EC1E79', iconColor: '#ffffff' },
    { boxColor: '#ED1C24', iconColor: '#ffffff' },
    { boxColor: '#00A99D', iconColor: '#ffffff' },
    { boxColor: '#EC1E79', iconColor: '#ffffff' },
    { boxColor: '#FFD400', iconColor: '#1A2332' },
  ];

  const menuItemsConfig = [
    { name: 'Dashboard & P/L', icon: IconDashboard },
    { name: 'Student Hub', icon: IconCap },
    { name: 'Student Analytics & RTE', icon: IconChart },
    { name: 'Fee Collection & Receipt', icon: IconReceipt },
    { name: 'Penalty Manager', icon: IconAlert },
    { name: 'Parents Communication', icon: IconMsg },
    { name: 'Expenses Log', icon: IconWallet },
    { name: 'Staff & Payroll Engine', icon: IconCheck },
    { name: 'Certificates & Cards ▾', icon: IconAward },
    { name: 'Attendance & Holidays', icon: IconCalendar },
    { name: 'Daybook & Accounts', icon: IconBook },
    { name: 'Exams & Reports ▾', icon: IconFile },
    { name: 'Parents Dashboard ▾', icon: IconUsers },
    { name: 'Permanent Audit Logs', icon: IconDatabase },
  ];

  const menuItems = menuItemsConfig.map((item, idx) => ({
    ...item,
    ...userColorPalette[idx % userColorPalette.length]
  }));

  const studentHubMap = {
    'Student Registration': StudentRegistration,
    'Students Directory': StudentsDirectory,
    'Category & Fee Matrix': FeeMatrix,
  };

  const certList = [
    'Character Certificate', 'DOB Certificate', 'Bonafide Certificate',
    'Appreciation Certificate', 'ID Card', 'Admit Card', 'Student Out Pass / Gate Pass'
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

  const examSubTabMap = {
    'Class-wise Subject Master': ClassSubjectMaster,
    'Exam Schedule & Admit Card': ExamScheduleAdmitCard,
    'Primary Annual Report (PP.3+ to 4th)': PrimaryAnnualReportManager,
    'Progress Report (Class 6-11)': ProgressReportManager,
    'Question Paper Generator': QuestionPaperGenerator,
  };

  const parentsDashboardSubTabMap = {
    'Parent Portal Overview': ParentsPortalOverview,
    'Fee Dues & Passbook': FeeDuesAndPassbook,
    'Student Attendance & Remarks': StudentAttendanceAndRemarks,
    'Circulars & Notices': CircularsAndNoticesManager,
    'Credentials Manager': ParentsCredentialsManager,
    'Homework Manager': HomeworkPublisherManager,
  };

  const renderSubComponent = (ComponentMap, currentKey) => {
    const ComponentToRender = ComponentMap[currentKey];
    return ComponentToRender ? <ComponentToRender /> : null;
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
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                  className="p-2 bg-[#254a85] hover:bg-[#2F6690] rounded-xl text-white transition-all duration-100 border-t border-blue-300/30 border-b-[4px] border-blue-950 shadow-[0_0_12px_rgba(47,102,144,0.5)] active:translate-y-1 active:border-b-[1px] cursor-pointer ml-auto"
                >
                  <IconMenu size={18} />
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
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-150 font-bold cursor-pointer border-t border-white/10 border-b-[4px] ${
                    activeTab === item.name
                      ? 'bg-[#2F6690] text-white font-black border-b-[#12283a] border-l-4 border-l-[#C6952C] shadow-[0_0_15px_rgba(47,102,144,0.6)] translate-y-0.5'
                      : 'border-b-transparent hover:bg-[#2F6690]/40 text-slate-200 hover:text-white active:translate-y-1 active:border-b-[1px]'
                  }`}
                >
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md shrink-0 transition-transform hover:scale-105 border-b-2 border-black/30"
                    style={{ backgroundColor: item.boxColor }}
                  >
                    <item.icon size={20} style={{ color: item.iconColor }} className="drop-shadow-sm" />
                  </div>
                  {isSidebarOpen && <span className="ml-3 text-sm truncate">{item.name}</span>}
                </button>
              ))}
            </nav>
          </div>

          {isSidebarOpen && (
            <div className="p-3 border-t border-[#2F6690]/40 flex items-center bg-[#1B3A6B] rounded-lg mt-2 shadow-inner">
              <div 
                className="w-9 h-9 rounded-lg shadow-md flex items-center justify-center shrink-0 border-b-2 border-pink-900"
                style={{ backgroundColor: '#EC1E79' }}
              >
                <IconUser size={18} className="text-white" />
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
                  <IconSearch size={16} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="bg-[#F5F7FA] text-xs sm:text-sm font-semibold text-[#1A2332] placeholder-slate-400 pl-9 pr-3.5 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-[#2F6690] w-56 shadow-sm"
                />
              </div>

              <button 
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.from('students').select('*');
                    if (error) throw error;
                    
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `students_backup_${activeSession}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    alert('Database backup downloaded successfully! 💾');
                  } catch (err) {
                    alert('Error creating backup: ' + err.message);
                  }
                }}
                className="bg-gradient-to-b from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369a1] text-white text-xs sm:text-sm px-4.5 py-2 rounded-xl font-black transition-all duration-150 flex items-center justify-center gap-1.5 border-t border-sky-200/50 border-b-[5px] border-[#075985] shadow-[0_0_18px_rgba(56,189,248,0.5)] active:translate-y-1 active:border-b-[1px] cursor-pointer"
              >
                <span>💾</span> Backup
              </button>

              <button 
                onClick={() => router.push('/')} 
                className="bg-gradient-to-b from-[#F87171] to-[#EF4444] hover:from-[#EF4444] hover:to-[#DC2626] text-white text-xs sm:text-sm px-5 py-2 rounded-xl font-black transition-all duration-150 border-t border-red-200/50 border-b-[5px] border-[#991B1B] shadow-[0_0_18px_rgba(239,68,68,0.5)] active:translate-y-1 active:border-b-[1px] cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Dynamic Workspace */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {activeTab === 'Dashboard & P/L' && <DashboardAndPL />}

            {activeTab === 'Student Hub' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-slate-200/90 p-3.5 rounded-2xl border border-slate-300 w-full shadow-inner">
                  
                  <button
                    onClick={() => setStudentHubSubTab('Student Registration')}
                    className={`relative font-black py-4 px-4 rounded-2xl flex items-center justify-center text-center transition-all duration-150 cursor-pointer w-full text-white text-sm sm:text-base border-t border-x border-[#73ffc2]/50 ${
                      studentHubSubTab === 'Student Registration'
                        ? 'bg-gradient-to-b from-[#00f098] via-[#00c885] to-[#008f5d] border-b-[6px] border-[#004d2e] shadow-[0_0_22px_rgba(0,200,133,0.65),0_8px_15px_rgba(0,0,0,0.3)] translate-y-0 active:translate-y-1.5 active:border-b-[2px]'
                        : 'bg-gradient-to-b from-emerald-600 to-teal-800 border-b-[6px] border-emerald-950 opacity-80 hover:opacity-100 shadow-[0_0_12px_rgba(0,200,133,0.3)] active:translate-y-1.5 active:border-b-[2px]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2.5 w-full">
                      <span className="text-xl drop-shadow-md">📋</span>
                      <span className="font-black tracking-wide text-center drop-shadow-md">Student Registration</span>
                      {studentHubSubTab === 'Student Registration' && (
                        <span className="bg-black/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner tracking-wider uppercase ml-1">
                          <span className="text-emerald-400 font-bold">✓</span> ACTIVE
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setStudentHubSubTab('Students Directory')}
                    className={`relative font-black py-4 px-4 rounded-2xl flex items-center justify-center text-center transition-all duration-150 cursor-pointer w-full text-white text-sm sm:text-base border-t border-x border-[#93c5fd]/50 ${
                      studentHubSubTab === 'Students Directory'
                        ? 'bg-gradient-to-b from-[#38bdf8] via-[#0088ff] to-[#0052cc] border-b-[6px] border-[#002b80] shadow-[0_0_22px_rgba(0,136,255,0.65),0_8px_15px_rgba(0,0,0,0.3)] translate-y-0 active:translate-y-1.5 active:border-b-[2px]'
                        : 'bg-gradient-to-b from-blue-600 to-indigo-800 border-b-[6px] border-blue-950 opacity-80 hover:opacity-100 shadow-[0_0_12px_rgba(0,136,255,0.3)] active:translate-y-1.5 active:border-b-[2px]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2.5 w-full">
                      <span className="text-xl drop-shadow-md">📇</span>
                      <span className="font-black tracking-wide text-center drop-shadow-md">Students Directory</span>
                      {studentHubSubTab === 'Students Directory' && (
                        <span className="bg-black/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner tracking-wider uppercase ml-1">
                          <span className="text-sky-400 font-bold">✓</span> ACTIVE
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setStudentHubSubTab('Category & Fee Matrix')}
                    className={`relative font-black py-4 px-4 rounded-2xl flex items-center justify-center text-center transition-all duration-150 cursor-pointer w-full text-white text-sm sm:text-base border-t border-x border-[#f5d0fe]/50 ${
                      studentHubSubTab === 'Category & Fee Matrix'
                        ? 'bg-gradient-to-b from-[#e879f9] via-[#c084fc] to-[#8b5cf6] border-b-[6px] border-[#5b21b6] shadow-[0_0_22px_rgba(192,132,252,0.65),0_8px_15px_rgba(0,0,0,0.3)] translate-y-0 active:translate-y-1.5 active:border-b-[2px]'
                        : 'bg-gradient-to-b from-purple-700 to-fuchsia-950 border-b-[6px] border-purple-950 opacity-80 hover:opacity-100 shadow-[0_0_12px_rgba(192,132,252,0.3)] active:translate-y-1.5 active:border-b-[2px]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2.5 w-full">
                      <span className="text-xl drop-shadow-md">📊</span>
                      <span className="font-black tracking-wide text-center drop-shadow-md">Category & Fee Matrix</span>
                      {studentHubSubTab === 'Category & Fee Matrix' && (
                        <span className="bg-black/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner tracking-wider uppercase ml-1">
                          <span className="text-pink-400 font-bold">✓</span> ACTIVE
                        </span>
                      )}
                    </div>
                  </button>

                </div>
                {renderSubComponent(studentHubMap, studentHubSubTab)}
              </div>
            )}

            {activeTab === 'Student Analytics & RTE' && <StudentAnalyticsRTE />}
            {activeTab === 'Fee Collection & Receipt' && <FeeCollectionReceipt />}
            {activeTab === 'Penalty Manager' && <PenaltyManager />}
            {activeTab === 'Parents Communication' && <ParentsCommunication />}
            {activeTab === 'Expenses Log' && <ExpensesLog />}
            {activeTab === 'Staff & Payroll Engine' && <StaffPayrollEngine />}
            {activeTab === 'Attendance & Holidays' && <AttendanceHolidays />}
            {activeTab === 'Daybook & Accounts' && <DaybookAccounts />}

            {activeTab === 'Certificates & Cards ▾' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  {certList.map((subTab) => (
                    <button
                      key={subTab}
                      onClick={() => setCertSubTab(subTab)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer border-t border-white/30 border-b-[4px] ${
                        certSubTab === subTab
                          ? 'bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] border-b-[#1e3a8a] text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 active:translate-y-1 active:border-b-[1px]'
                      }`}
                    >
                      {subTab}
                    </button>
                  ))}
                </div>
                {renderSubComponent(certificateMap, certSubTab)}
              </div>
            )}

            {activeTab === 'Exams & Reports ▾' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  {Object.keys(examSubTabMap).map((subTab) => (
                    <button
                      key={subTab}
                      onClick={() => setExamSubTab(subTab)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer border-t border-white/30 border-b-[4px] ${
                        examSubTab === subTab
                          ? 'bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] border-b-[#1e3a8a] text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 active:translate-y-1 active:border-b-[1px]'
                      }`}
                    >
                      {subTab}
                    </button>
                  ))}
                </div>
                {renderSubComponent(examSubTabMap, examSubTab)}
              </div>
            )}

            {activeTab === 'Parents Dashboard ▾' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  {Object.keys(parentsDashboardSubTabMap).map((subTab) => (
                    <button
                      key={subTab}
                      onClick={() => setParentsDashboardSubTab(subTab)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer border-t border-white/30 border-b-[4px] ${
                        parentsDashboardSubTab === subTab
                          ? 'bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] border-b-[#1e3a8a] text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 active:translate-y-1 active:border-b-[1px]'
                      }`}
                    >
                      {subTab}
                    </button>
                  ))}
                </div>
                {renderSubComponent(parentsDashboardSubTabMap, parentsDashboardSubTab)}
              </div>
            )}

            {activeTab === 'Permanent Audit Logs' && (
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 font-bold text-slate-700">
                Permanent Audit Logs Module
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}