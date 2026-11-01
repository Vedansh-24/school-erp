'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AttendanceView from '@/components/staff-dashboard/AttendanceView';
import ClassSchedule from '@/components/staff-dashboard/ClassSchedule';
import NoticesCard from '@/components/staff-dashboard/NoticesCard';
import TimetableView from '@/components/staff-dashboard/TimetableView';
import HomeworkAndAssignments from '@/components/staff-dashboard/HomeworkAndAssignments';
import ParentsCommunication from '@/components/staff-dashboard/ParentsCommunication';
import QuestionPaperGenerator from '@/components/staff-dashboard/QuestionPaperGenerator';

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
    <div className="my-3 flex justify-center items-center p-2 rounded-xl shadow-lg bg-white/90 border border-slate-200">
      <img src={cleanLogoSrc} alt="School Logo" className="w-20 h-auto max-h-24 object-contain drop-shadow-md" />
    </div>
  );
};

const StatCard = ({ label, value, accent, valueColor = '#1A2332' }) => (
  <div
    className="p-4 rounded-md border-l-4 shadow-sm"
    style={{ ...card, borderLeftColor: accent }}
  >
    <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{label}</span>
    <div className="text-2xl font-black mt-1" style={{ color: valueColor }}>{value}</div>
  </div>
);

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
  const presentCount = Object.values(attendance).filter((v) => v === 'P').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ background: '#F5F7FA', color: '#1A2332' }}>

      {/* Top Header */}
      <div
        className="px-6 py-3.5 flex items-center justify-between shadow-sm"
        style={{ background: '#1B3A6B', borderBottom: '3px solid #C6952C' }}
      >
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#00C9A7] to-[#FFB800] font-black text-xl sm:text-2xl tracking-wider drop-shadow-md">
          MySchoolDashboard ERP System
        </h1>
        <div
          className="font-extrabold text-sm sm:text-base tracking-wider uppercase px-3 py-1 rounded-full"
          style={{ color: '#C6952C', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(198,149,44,0.4)' }}
        >
          👩‍🏫 STAFF PORTAL
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* Left Sidebar */}
        <aside
          className="w-72 flex flex-col justify-between shrink-0 p-4"
          style={{ background: '#FFFFFF', borderRight: '1px solid #E2E7EE' }}
        >
          <div>
            <div className="mb-4 pb-3 text-center flex flex-col items-center" style={{ borderBottom: '1px solid #E2E7EE' }}>
              <h2 className="text-[14px] sm:text-[15px] font-black uppercase whitespace-nowrap overflow-hidden tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B8B] via-[#FFB800] to-[#00C9A7] w-full text-center drop-shadow-md py-1">
                BLUE HEAVEN KIDS ACADEMY
              </h2>
              <p className="text-xs font-semibold mt-1" style={{ color: '#5C6B7A' }}>
                Session: <span className="font-bold" style={{ color: '#2F6690' }}>{activeSession}</span>
              </p>
              <TransparentSchoolLogo src="/school-logo.png" />
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm sm:text-base transition-all duration-200 font-bold ${
                    activeTab === item
                      ? 'text-slate-950 font-black shadow-2xl translate-x-1'
                      : 'font-semibold hover:bg-[#F5F7FA]'
                  }`}
                  style={
                    activeTab === item
                      ? {
                          backgroundColor: '#FFFFFF',
                          borderTop: '3px solid #FF6B8B',
                          borderRight: '3px solid #00C9A7',
                          borderBottom: '3px solid #FFB800',
                          borderLeft: '5px solid #9D4EDD',
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
          <div className="mt-4 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid #E2E7EE' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: '#1B3A6B' }}>
              {staff.name.split(' ')[1].charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: '#1A2332' }}>{staff.name}</div>
              <div className="text-xs font-semibold truncate" style={{ color: '#5C6B7A' }}>{staff.role}</div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0" style={{ background: '#F5F7FA' }}>

          {/* Controls Bar */}
          <header
            className="py-3.5 px-6 flex items-center justify-between gap-4 flex-wrap shadow-sm"
            style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E7EE' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold" style={{ color: '#1A2332' }}>Session:</span>
              <select
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
                className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer shadow-sm"
                style={{ background: '#F5F7FA', color: '#2F6690', border: '1px solid #E2E7EE' }}
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
                  className="text-xs sm:text-sm font-semibold pl-9 pr-3.5 py-2 rounded-md w-56 outline-none shadow-sm"
                  style={{ background: '#F5F7FA', color: '#1A2332', border: '1px solid #E2E7EE' }}
                />
              </div>

              <button
                onClick={() => router.push('/')}
                className="bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs sm:text-sm px-4 py-2 rounded-md font-bold transition shadow-md hover:scale-[1.02] active:scale-95"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Main Dashboard Layout */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">

            {activeTab === 'My Dashboard' && (
              <div className="space-y-5">
                {/* 6 Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
                  {stats.map((s) => (
                    <StatCard key={s.label} {...s} />
                  ))}
                </div>

                {/* Timetable & Tasks Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Today's Timetable */}
                  <div className="lg:col-span-2 rounded-lg shadow-sm" style={card}>
                    <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
                      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>TODAY'S TIMETABLE</h3>
                    </div>
                    <ul>
                      {timetable.map((t, i) => (
                        <li
                          key={t.time}
                          className="px-5 py-3 flex items-center justify-between"
                          style={{ borderTop: i ? '1px solid #E2E7EE' : 'none', background: i % 2 ? '#FAFBFC' : 'transparent' }}
                        >
                          <div>
                            <div className="text-sm font-bold" style={{ color: '#1A2332' }}>{t.subject} — Class {t.cls}</div>
                            <div className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>{t.time}</div>
                          </div>
                          <span
                            className="px-2.5 py-1 rounded-md text-xs font-semibold"
                            style={{
                              background: t.done ? '#EAF4EE' : '#FBF1DE',
                              color: t.done ? '#2E7D4F' : '#8A6512',
                            }}
                          >
                            {t.done ? 'Completed' : 'Upcoming'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pending Tasks */}
                  <div className="rounded-lg shadow-sm" style={card}>
                    <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
                      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>PENDING TASKS</h3>
                    </div>
                    <ul className="p-5 space-y-3">
                      {tasks.map((t) => (
                        <li key={t} className="flex gap-2.5 text-sm font-semibold" style={{ color: '#1A2332' }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C6952C' }} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Notices Block */}
                <div className="rounded-lg p-5 shadow-sm" style={card}>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#8A6512' }}>
                    📢 NOTICES
                  </h3>
                  <div className="space-y-2">
                    {notices.map((n) => (
                      <div key={n.title} className="flex items-center justify-between p-3.5 rounded-md" style={{ background: '#F5F7FA', border: '1px solid #E2E7EE' }}>
                        <span className="text-sm font-bold" style={{ color: '#1A2332' }}>{n.title}</span>
                        <span className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>{n.when}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Component Mappings */}
            {activeTab === 'Mark Attendance' && <AttendanceView students={students} attClass={attClass} setAttClass={setAttClass} myClasses={myClasses} attendance={attendance} setAttendance={setAttendance} />}
            {activeTab === 'My Timetable' && <TimetableView timetable={timetable} />}
            {activeTab === 'Class Schedule' && <ClassSchedule />}
            {activeTab === 'Homework & Assignments' && <HomeworkAndAssignments />}
            {activeTab === 'Question Paper Generator' && <QuestionPaperGenerator />}
            {activeTab === 'Parents Communication' && <ParentsCommunication />}
            {activeTab === 'Notices' && <NoticesCard notices={notices} />}

            {activeTab !== 'My Dashboard' && activeTab !== 'Mark Attendance' && activeTab !== 'My Timetable' && activeTab !== 'Class Schedule' && activeTab !== 'Homework & Assignments' && activeTab !== 'Question Paper Generator' && activeTab !== 'Parents Communication' && activeTab !== 'Notices' && (
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