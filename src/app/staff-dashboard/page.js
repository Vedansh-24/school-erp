'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import MyDashboardView from '@/components/staff-dashboard/mydashboard';
import AttendanceView from '@/components/staff-dashboard/AttendanceView';
import ClassSchedule from '@/components/staff-dashboard/ClassSchedule';
import NoticesCard from '@/components/staff-dashboard/NoticesCard';
import TimetableView from '@/components/staff-dashboard/mytimetable';
import HomeworkAndAssignments from '@/components/staff-dashboard/HomeworkAndAssignments';
import MarksEntry from '@/components/staff-dashboard/marksentry';
import ParentsCommunication from '@/components/staff-dashboard/ParentsCommunication';
import QuestionPaperGenerator from '@/components/staff-dashboard/QuestionPaperGenerator';
import StaffProfile from '@/components/staff-dashboard/staffprofile';
import LeaveRequests from '@/components/staff-dashboard/leaverequests';
import SalarySlips from '@/components/staff-dashboard/salaryslips';
import NoticesView from '@/components/staff-dashboard/notices';
import OnlineTestPaperGenerator from '@/components/staff-dashboard/onlinetestpapergenerator';
import SmartAnalytics from '@/components/staff-dashboard/SmartAnalytics';
import BehaviorLog from '@/components/staff-dashboard/behaviorlog';
import StaffGatePass from '@/components/staff-dashboard/Staffgatepass';

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };

const TransparentSchoolLogo = ({ src = '/school-logo.png' }) => {
  const [cleanLogoSrc, setCleanLogoSrc] = useState(src);

  useEffect(() => {
    const img = new Image();
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
    <div className="my-1 flex justify-center items-center p-1 rounded-xl shadow-md bg-white/90 border border-slate-200">
      <img src={cleanLogoSrc} alt="School Logo" className="w-14 h-auto max-h-16 object-contain drop-shadow-md" />
    </div>
  );
};

export default function StaffDashboard() {
  const router = useRouter();

  const [activeSession, setActiveSession] = useState('2026-2027');
  const [activeTab, setActiveTab] = useState('My Dashboard');
  const [attClass, setAttClass] = useState('Fourth');
  const [searchQuery, setSearchQuery] = useState('');

  const sessionsList = ['2025-2026', '2026-2027', '2027-2028'];
  const myClasses = ['Third', 'Fourth', 'Fifth'];

  const menuItems = [
    'My Dashboard',
    'Mark Attendance',
    'My Timetable',
    'Class Schedule',
    'Homework & Assignments',
    'Marks Entry',
    'Question Paper Generator',
    'Online Test Paper Generator',
    'Smart Analytics',
    'Student Behavior Log',
    'Staff Gate Pass',
    'Leave Requests',
    'Salary Slips',
    'Parents Communication',
    'Notices',
    'My Profile',
  ];

  const staff = { name: 'Mrs. Sunita Sharma', role: 'Class Teacher – Fourth' };

  const stats = [
    { label: 'MY CLASSES TODAY', value: '5', accent: '#1B3A6B' },
    { label: 'STUDENTS IN MY CLASS', value: '32', accent: '#2F6690' },
    { label: 'ATTENDANCE MARKED', value: '3 / 5', accent: '#C6952C' },
    { label: 'HOMEWORK TO CHECK', value: '18', accent: '#2F6690' },
    { label: 'LEAVE BALANCE', value: '7 days', accent: '#1B3A6B' },
    { label: 'SALARY (THIS MONTH)', value: 'Processing', accent: '#C6952C', valueColor: '#8A6512' },
  ];

  const timetable = [
    { time: '08:00 – 08:40', cls: 'Fourth', subject: 'Mathematics', done: true },
    { time: '08:40 – 09:20', cls: 'Third', subject: 'Mathematics', done: true },
    { time: '09:40 – 10:20', cls: 'Fifth', subject: 'EVS', done: true },
    { time: '10:20 – 11:00', cls: 'Fourth', subject: 'Mathematics', done: false },
    { time: '11:20 – 12:00', cls: 'Third', subject: 'EVS', done: false },
  ];

  const tasks = [
    'Check Class Fourth Maths homework (18 pending)',
    'Enter Unit Test marks – Class Third',
    'Reply to 2 parent messages',
    'Submit monthly attendance report',
  ];

  const notices = [
    { title: 'PTM scheduled for Class 3–5', when: 'Today' },
    { title: 'Annual sports day — duty roster out', when: 'Yesterday' },
    { title: 'Diwali break circular', when: '2 days ago' },
  ];

  const students = [
    { id: 1, name: 'AARAV SINGH', sr: '1021' },
    { id: 2, name: 'ANANYA SHARMA', sr: '1022' },
    { id: 3, name: 'BHANUJ VERMA', sr: '1023' },
    { id: 4, name: 'BHAVESH MEHTA', sr: '1024' },
    { id: 5, name: 'ISHITA NAIR', sr: '1025' },
    { id: 6, name: 'KABIR KHAN', sr: '1026' },
  ];

  const [attendance, setAttendance] = useState(
    Object.fromEntries(students.map((s) => [s.id, 'P']))
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans" style={{ background: '#F5F7FA', color: '#1A2332' }}>

      {/* Top Header */}
      <div
        className="px-6 py-2.5 flex items-center justify-between shadow-sm shrink-0"
        style={{ background: '#1B3A6B', borderBottom: '3px solid #C6952C' }}
      >
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#00C9A7] to-[#FFB800] font-black text-xl sm:text-2xl tracking-wider drop-shadow-md">
          MySchoolDashboard ERP System
        </h1>
        <div
          className="font-extrabold text-xs sm:text-sm tracking-wider uppercase px-3 py-1 rounded-full"
          style={{ color: '#C6952C', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(198,149,44,0.4)' }}
        >
          👩‍🏫 Staff Portal
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left Sidebar with Dedicated Independent Scrollbar */}
        <aside
          className="w-72 flex flex-col shrink-0 p-3 bg-white border-r border-[#E2E7EE] h-full overflow-hidden"
        >
          <div className="flex flex-col h-full min-h-0">
            
            {/* Header / Logo */}
            <div className="mb-2 pb-2 text-center flex flex-col items-center shrink-0 border-b border-[#E2E7EE]">
              <h2 className="text-[13px] sm:text-[14px] font-black uppercase whitespace-nowrap overflow-hidden tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B8B] via-[#FFB800] to-[#00C9A7] w-full text-center drop-shadow-md py-0.5">
                BLUE HEAVEN KIDS ACADEMY
              </h2>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#5C6B7A' }}>
                Session: <span className="font-bold" style={{ color: '#2F6690' }}>{activeSession}</span>
              </p>
              <TransparentSchoolLogo src="/school-logo.png" />
            </div>

            {/* Independent Scrollable Sidebar Menu Container */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 border-b border-[#E2E7EE] pb-2">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTab(item)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 font-bold cursor-pointer ${
                      activeTab === item
                        ? 'text-slate-950 font-black shadow-sm translate-x-1'
                        : 'font-semibold hover:bg-[#F5F7FA]'
                    }`}
                    style={
                      activeTab === item
                        ? {
                            backgroundColor: '#FFFFFF',
                            borderTop: '2px solid #FF6B8B',
                            borderRight: '2px solid #00C9A7',
                            borderBottom: '2px solid #FFB800',
                            borderLeft: '4px solid #9D4EDD',
                          }
                        : { color: '#5C6B7A' }
                    }
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            {/* Staff Identity */}
            <div className="pt-2 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#1B3A6B' }}>
                {staff.name.split(' ')[1].charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: '#1A2332' }}>{staff.name}</div>
                <div className="text-[10px] font-semibold truncate" style={{ color: '#5C6B7A' }}>{staff.role}</div>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: '#F5F7FA' }}>

          {/* Controls Bar */}
          <header
            className="py-2.5 px-6 flex items-center justify-between gap-4 flex-wrap shadow-sm shrink-0 bg-white border-b border-[#E2E7EE]"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold" style={{ color: '#1A2332' }}>Session:</span>
              <select
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
                className="text-xs sm:text-sm font-bold rounded-md px-3 py-1 outline-none cursor-pointer shadow-sm bg-[#F5F7FA] text-[#2F6690] border border-[#E2E7EE]"
              >
                {sessionsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs" style={{ color: '#5C6B7A' }}>🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student (Name, SR..."
                  className="text-xs sm:text-sm font-semibold pl-9 pr-3 py-1 rounded-md w-56 outline-none shadow-sm bg-[#F5F7FA] text-[#1A2332] border border-[#E2E7EE]"
                />
              </div>

              <button
                onClick={() => router.push('/')}
                className="bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs sm:text-sm px-4 py-1 rounded-md font-bold transition shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Dynamic Workspace Area */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">

            {activeTab === 'My Dashboard' && (
              <MyDashboardView
                stats={stats}
                timetable={timetable}
                tasks={tasks}
                notices={notices}
                cardStyle={card}
              />
            )}

            {activeTab === 'Mark Attendance' && (
              <AttendanceView
                students={students}
                attClass={attClass}
                setAttClass={setAttClass}
                myClasses={myClasses}
                attendance={attendance}
                setAttendance={setAttendance}
              />
            )}

            {activeTab === 'My Timetable' && <TimetableView timetable={timetable} />}

            {activeTab === 'Class Schedule' && <ClassSchedule />}

            {activeTab === 'Homework & Assignments' && <HomeworkAndAssignments />}

            {activeTab === 'Marks Entry' && <MarksEntry />}

            {activeTab === 'Question Paper Generator' && <QuestionPaperGenerator />}

            {activeTab === 'Online Test Paper Generator' && <OnlineTestPaperGenerator />}

            {activeTab === 'Smart Analytics' && <SmartAnalytics />}

            {activeTab === 'Student Behavior Log' && <BehaviorLog />}

            {activeTab === 'Staff Gate Pass' && <StaffGatePass />}

            {activeTab === 'Leave Requests' && <LeaveRequests />}

            {activeTab === 'Salary Slips' && <SalarySlips />}

            {activeTab === 'Parents Communication' && <ParentsCommunication />}

            {activeTab === 'Notices' && <NoticesView notices={notices} />}

            {activeTab === 'My Profile' && <StaffProfile staff={staff} />}

            {activeTab !== 'My Dashboard' &&
              activeTab !== 'Mark Attendance' &&
              activeTab !== 'My Timetable' &&
              activeTab !== 'Class Schedule' &&
              activeTab !== 'Homework & Assignments' &&
              activeTab !== 'Marks Entry' &&
              activeTab !== 'Question Paper Generator' &&
              activeTab !== 'Online Test Paper Generator' &&
              activeTab !== 'Smart Analytics' &&
              activeTab !== 'Student Behavior Log' &&
              activeTab !== 'Staff Gate Pass' &&
              activeTab !== 'Leave Requests' &&
              activeTab !== 'Salary Slips' &&
              activeTab !== 'Parents Communication' &&
              activeTab !== 'Notices' &&
              activeTab !== 'My Profile' && (
                <div
                  className="flex items-center justify-center h-64 rounded-2xl shadow-sm font-bold uppercase tracking-widest text-sm"
                  style={{ ...card, color: '#5C6B7A' }}
                >
                  Module '{activeTab}' is under development
                </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}