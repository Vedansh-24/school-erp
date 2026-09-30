'use client';

import { useState } from 'react';

export default function ParentsPortalOverview() {
  const [activeTab, setActiveTab] = useState('overview');

  // Dummy student & portal overview data (Dono old aur new fields mila kar)
  const studentInfo = {
    name: 'Aarav Saini',
    class: 'Fourth',
    section: 'A',
    rollNo: '14',
    admissionNo: 'BHKA/2026/108',
    fatherName: 'Bhagwati Prasad Saini',
    mobile: '9828XXXXXX',
    attendanceRate: '94%',
    totalPresents: '172 Days',
    totalAbsents: '11 Days',
    annualFee: '₹ 28,000',
    paidFee: '₹ 14,500',
    pendingFee: '₹ 13,500',
    academicSession: '2026 - 2027'
  };

  const noticesList = [
    { id: 1, date: '22 Sep 2026', title: 'Half Yearly Exam Syllabus Update', desc: 'All subjects syllabus for upcoming term exams has been uploaded in the portal.' },
    { id: 2, date: '15 Sep 2026', title: 'Parent-Teacher Meeting (PTM)', desc: 'PTM scheduled for coming Saturday from 9:00 AM to 12:00 PM.' },
    { id: 3, date: '05 Sep 2026', title: 'Teachers Day Celebration', desc: 'Students participated enthusiastically in cultural events.' }
  ];

  const homeworkList = [
    { id: 1, subject: 'Mathematics', task: 'Complete Chapter 4 exercise questions 1 to 15 in notebook.', date: '21 Sep 2026' },
    { id: 2, subject: 'Hindi', task: 'Padhaye gaye paath ka shabdarth yaad karein.', date: '22 Sep 2026' },
    { id: 3, subject: 'Science', task: 'Draw a neat diagram of plant parts in your homework copy.', date: '22 Sep 2026' }
  ];

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-300 rounded-2xl p-6 md:p-8 shadow-md space-y-6 text-slate-900 font-sans">
      
      {/* Academy Header Banner with Colorful Gradient & 3D Effect */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 text-white border border-blue-500 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transform transition-all duration-300">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-inner">
            Parents Portal Overview
          </span>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-wide pt-1 drop-shadow-md">
            BLUE HEAVEN KIDS ACADEMY
          </h1>
          <p className="text-[13px] text-sky-100 font-medium">
            Welcome back, <strong className="text-white underline decoration-sky-300">{studentInfo.fatherName}</strong> (Parent of <span className="text-yellow-300 font-bold">{studentInfo.name}</span>)
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-left space-y-1.5 min-w-[250px] shadow-lg">
          <div className="text-[12px] text-sky-100 font-bold flex justify-between">
            <span>Class:</span> <span className="text-white font-extrabold">{studentInfo.class} ({studentInfo.section})</span>
          </div>
          <div className="text-[12px] text-sky-100 font-bold flex justify-between">
            <span>Roll No:</span> <span className="text-white font-extrabold">{studentInfo.rollNo}</span>
          </div>
          <div className="text-[12px] text-sky-100 font-bold flex justify-between">
            <span>Admission ID:</span> <span className="text-white font-extrabold">{studentInfo.admissionNo}</span>
          </div>
          <div className="text-[12px] text-sky-100 font-bold flex justify-between pt-1 border-t border-white/10 mt-1">
            <span>Mobile:</span> <span className="text-white font-extrabold">{studentInfo.mobile}</span>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards - Merging Old and New Fields perfectly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Attendance Rate & Presents/Absents */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-5 shadow-lg border border-emerald-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-100">Attendance Rate</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.attendanceRate}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-emerald-50 whitespace-nowrap">
            Presents: {studentInfo.totalPresents} | Absents: {studentInfo.totalAbsents}
          </div>
        </div>

        {/* Card 2: Fee Paid & Annual Fee */}
        <div className="bg-gradient-to-br from-blue-500 to-sky-700 text-white rounded-2xl p-5 shadow-lg border border-blue-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-100">Total Fee Paid</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.paidFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-blue-50">
            Annual Fee: {studentInfo.annualFee}
          </div>
        </div>

        {/* Card 3: Pending Dues */}
        <div className="bg-gradient-to-br from-rose-500 to-red-700 text-white rounded-2xl p-5 shadow-lg border border-rose-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100">Pending Dues</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.pendingFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-rose-50">
            No arrears pending
          </div>
        </div>

        {/* Card 4: Academic Session */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg border border-amber-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-100">Academic Session</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.academicSession}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-amber-50">
            Active Semester
          </div>
        </div>

      </div>

      {/* Navigation Tabs with 3D Embossed & Pressable Effect */}
      <div className="flex flex-wrap gap-3 border-b-2 border-slate-200 pb-4">
        {[
          { key: 'overview', label: '📊 Dashboard Overview' },
          { key: 'homework', label: '📚 Daily Homework' },
          { key: 'notices', label: '📢 School Notices' },
          { key: 'fees', label: '💳 Fee Records' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-[13px] font-extrabold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md active:scale-95 transform ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-300/50 border-b-4 border-blue-900'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 active:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content 1: Dashboard Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Homework Preview */}
          <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-[16px] font-black text-blue-900 flex items-center justify-between">
              <span>Today's Homework Tasks</span>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md font-bold">Updated Today</span>
            </h2>
            <div className="space-y-3">
              {homeworkList.map((hw) => (
                <div key={hw.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm hover:border-blue-400 transition-all">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-extrabold text-blue-900">{hw.subject}</span>
                    <span className="text-slate-500 text-[11px] font-bold">{hw.date}</span>
                  </div>
                  <p className="text-[12px] text-slate-700 font-medium">{hw.task}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent School Notices */}
          <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-[16px] font-black text-blue-900 flex items-center justify-between">
              <span>Latest Notices & Circulars</span>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-bold">Important</span>
            </h2>
            <div className="space-y-3">
              {noticesList.map((n) => (
                <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm hover:border-amber-400 transition-all">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-extrabold text-slate-900">{n.title}</span>
                    <span className="text-slate-500 text-[11px] font-bold">{n.date}</span>
                  </div>
                  <p className="text-[12px] text-slate-700 font-medium">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Homework */}
      {activeTab === 'homework' && (
        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
          <h2 className="text-[16px] font-black text-blue-900">Complete Homework Assignments</h2>
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold border-b border-slate-700">
                  <th className="px-4 py-3.5 border-r border-slate-700">Date</th>
                  <th className="px-4 py-3.5 border-r border-slate-700">Subject</th>
                  <th className="px-4 py-3.5">Task Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
                {homeworkList.map((hw) => (
                  <tr key={hw.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 border-r border-slate-200 font-bold">{hw.date}</td>
                    <td className="px-4 py-3.5 border-r border-slate-200 text-blue-900 font-extrabold">{hw.subject}</td>
                    <td className="px-4 py-3.5 text-slate-800">{hw.task}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Notices */}
      {activeTab === 'notices' && (
        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
          <h2 className="text-[16px] font-black text-blue-900">School Notices & Announcements</h2>
          <div className="space-y-3">
            {noticesList.map((n) => (
              <div key={n.id} className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-[14px] font-extrabold text-blue-900">{n.title}</h3>
                  <span className="text-[12px] bg-slate-200 text-slate-800 px-3 py-1 rounded-full font-bold">{n.date}</span>
                </div>
                <p className="text-[13px] text-slate-700 font-medium">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Fees */}
      {activeTab === 'fees' && (
        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-[16px] font-black text-blue-900">Fee Payment History & Ledger</h2>
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-[12px] font-bold text-blue-900">
              Annual Fee Total: <span className="text-emerald-700 font-black">{studentInfo.annualFee}</span> | Pending: <span className="text-rose-600 font-black">{studentInfo.pendingFee}</span>
            </div>
          </div>
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold border-b border-slate-700">
                  <th className="px-4 py-3.5 border-r border-slate-700">Receipt No</th>
                  <th className="px-4 py-3.5 border-r border-slate-700">Payment Date</th>
                  <th className="px-4 py-3.5 border-r border-slate-700">Amount Paid</th>
                  <th className="px-4 py-3.5">Mode & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
                <tr className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5 border-r border-slate-200 font-black">REC-2026-042</td>
                  <td className="px-4 py-3.5 border-r border-slate-200">10 April 2026</td>
                  <td className="px-4 py-3.5 border-r border-slate-200 text-emerald-700 font-extrabold">{studentInfo.paidFee}</td>
                  <td className="px-4 py-3.5 text-emerald-700 font-extrabold flex items-center gap-1">✅ Cash (Success)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}