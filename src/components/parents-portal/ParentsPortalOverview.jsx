// Filename: ParentsPortalOverview.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ParentsPortalOverview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [studentInfo, setStudentInfo] = useState({
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
  });

  const [noticesList, setNoticesList] = useState([
    { id: 1, date: '22 Sep 2026', title: 'Half Yearly Exam Syllabus Update', desc: 'All subjects syllabus for upcoming term exams has been uploaded in the portal.' },
    { id: 2, date: '15 Sep 2026', title: 'Parent-Teacher Meeting (PTM)', desc: 'PTM scheduled for coming Saturday from 9:00 AM to 12:00 PM.' },
    { id: 3, date: '05 Sep 2026', title: 'Teachers Day Celebration', desc: 'Students participated enthusiastically in cultural events.' }
  ]);

  const [homeworkList, setHomeworkList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Fee Records updated matching Image 1 headings and layout sequence
  const [feeRecordsList, setFeeRecordsList] = useState([
    {
      id: 'TXN-2026-042',
      studentName: 'Aarav Saini',
      class: 'Fourth (A)',
      description: 'Tuition Fee Allocation (April 2026 - September 2026)',
      date: '10 April 2026',
      receiptNo: 'REC-2026-042',
      amount: '₹ 14,500',
      status: 'Paid',
      mode: 'Cash'
    }
  ]);

  useEffect(() => {
    async function fetchPortalData() {
      setLoading(true);
      try {
        // 1. Fetch Daily Homework matching student class 'PP.3+' or general
        const { data: hwData, error: hwErr } = await supabase
          .from('daily_homework')
          .select('*')
          .order('assign_date', { ascending: false });

        if (!hwErr && hwData && hwData.length > 0) {
          setHomeworkList(hwData.map((hw, idx) => ({
            id: hw.id || idx + 1,
            subject: hw.subject_name || 'General',
            task: `${hw.chapter_title ? hw.chapter_title + ': ' : ''}${hw.instructions || 'Homework assigned.'}`,
            date: hw.assign_date || '2026-09-28'
          })));
        } else {
          setHomeworkList([
            { id: 1, subject: 'Mathematics', task: 'Complete Chapter 4 exercise questions 1 to 15 in notebook.', date: '21 Sep 2026' },
            { id: 2, subject: 'Hindi', task: 'Padhaye gaye paath ka shabdarth yaad karein.', date: '22 Sep 2026' },
            { id: 3, subject: 'Science', task: 'Draw a neat diagram of plant parts in your homework copy.', date: '22 Sep 2026' }
          ]);
        }

        // 2. Fetch Attendance
        const { data: attData } = await supabase
          .from('attendance')
          .select('*');

        if (attData && attData.length > 0) {
          setAttendanceRecords(attData);

          const dbPresents = attData.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'p').length;
          const dbAbsents = attData.filter(a => a.status?.toLowerCase() === 'absent' || a.status?.toLowerCase() === 'a').length;
          
          if (dbPresents > 0 || dbAbsents > 0) {
            const totalDays = dbPresents + dbAbsents;
            const percentage = totalDays > 0 ? Math.round((dbPresents / totalDays) * 100) : 94;
            setStudentInfo(prev => ({
              ...prev,
              attendanceRate: `${percentage}%`,
              totalPresents: `${dbPresents} Days`,
              totalAbsents: `${dbAbsents} Days`
            }));
          }
        } else {
          setAttendanceRecords([
            { id: 1, attendance_date: '2026-10-01', status: 'Present', remarks: 'On time, active in class.' },
            { id: 2, attendance_date: '2026-09-30', status: 'Present', remarks: 'Completed all assignments.' },
            { id: 3, attendance_date: '2026-09-29', status: 'Late', remarks: 'Arrived 10 minutes past schedule.' },
            { id: 4, attendance_date: '2026-09-28', status: 'Absent', remarks: 'Medical leave informed by parent.' }
          ]);
        }

        // 3. Fetch Notices from 'circulars_and_notices'
        const { data: noticeData } = await supabase
          .from('circulars_and_notices')
          .select('*');

        if (noticeData && noticeData.length > 0) {
          setNoticesList(noticeData.map((n, idx) => ({
            id: n.id || idx + 1,
            date: n.date || '22 Sep 2026',
            title: n.title || 'Notice',
            desc: n.description || n.desc || ''
          })));
        }

      } catch (error) {
        console.error('Supabase fetch error:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPortalData();
  }, []);

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
            <span>Admission ID:</span> <span className="text-white font-extrabold truncate max-w-[140px]">{studentInfo.admissionNo}</span>
          </div>
          <div className="text-[12px] text-sky-100 font-bold flex justify-between pt-1 border-t border-white/10 mt-1">
            <span>Mobile:</span> <span className="text-white font-extrabold">{studentInfo.mobile}</span>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards with Colorful Gradients & Hover Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-5 shadow-lg border border-emerald-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-100">Attendance Rate</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.attendanceRate}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-emerald-50 whitespace-nowrap">
            Presents: {studentInfo.totalPresents} | Absents: {studentInfo.totalAbsents}
          </div>
        </div>

        {/* Fee Paid */}
        <div className="bg-gradient-to-br from-blue-500 to-sky-700 text-white rounded-2xl p-5 shadow-lg border border-blue-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-100">Total Fee Paid</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.paidFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-blue-50">
            Annual Fee: {studentInfo.annualFee}
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-gradient-to-br from-rose-500 to-red-700 text-white rounded-2xl p-5 shadow-lg border border-rose-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100">Pending Dues</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.pendingFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-rose-50">
            No arrears pending
          </div>
        </div>

        {/* Academic Session */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg border border-amber-400 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-100">Academic Session</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.academicSession}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-amber-50">
            Active Semester
          </div>
        </div>

      </div>

      {/* Navigation Tabs - Student Attendance & Remarks at 2nd Position */}
      <div className="flex flex-wrap gap-3 border-b-2 border-slate-200 pb-4">
        {[
          { key: 'overview', label: '📊 Dashboard Overview' },
          { key: 'attendance', label: '📅 Student Attendance & Remarks' },
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

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-500 font-bold">
          <Loader2 className="animate-spin text-blue-700" size={32} />
          Supabase se live data load ho raha hai...
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Student Attendance & Remarks Working Tab at 2nd Position */}
          {activeTab === 'attendance' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-[16px] font-black text-blue-900">Student Attendance History & Teacher Remarks</h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-extrabold">
                  Overall Status: {studentInfo.attendanceRate}
                </span>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold border-b border-slate-700">
                      <th className="px-4 py-3.5 border-r border-slate-700">Attendance Date</th>
                      <th className="px-4 py-3.5 border-r border-slate-700">Status</th>
                      <th className="px-4 py-3.5">Teacher Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
                    {attendanceRecords.length > 0 ? (
                      attendanceRecords.map((att, idx) => (
                        <tr key={att.id || idx} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3.5 border-r border-slate-200 font-bold">{att.attendance_date || att.date || '2026-09-28'}</td>
                          <td className="px-4 py-3.5 border-r border-slate-200">
                            {att.status?.toLowerCase() === 'present' || att.status?.toLowerCase() === 'p' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full text-xs border border-emerald-200">
                                <CheckCircle2 size={14} /> Present
                              </span>
                            ) : att.status?.toLowerCase() === 'late' ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-extrabold bg-amber-50 px-2.5 py-1 rounded-full text-xs border border-amber-200">
                                <Clock size={14} /> Late
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold bg-rose-50 px-2.5 py-1 rounded-full text-xs border border-rose-200">
                                <XCircle size={14} /> Absent
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 font-medium">
                            {att.remarks || 'No remarks recorded for this date.'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-slate-500 font-bold">
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

          {activeTab === 'fees' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-[16px] font-black text-blue-900">Fee Payment History & Ledger</h2>
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-[12px] font-bold text-blue-900">
                  Annual Fee Total: <span className="text-emerald-700 font-black">{studentInfo.annualFee}</span> | Pending: <span className="text-rose-600 font-black">{studentInfo.pendingFee}</span>
                </div>
              </div>
              
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Student Details</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                    {feeRecordsList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-black text-slate-900">{item.studentName}</p>
                          <p className="text-[11px] text-indigo-600 font-bold">{item.class}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-600">
                          {item.description}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-black text-slate-800">{item.date}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{item.id}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 font-bold">
                          {item.receiptNo}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                          + {item.amount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                            ✅ {item.mode} ({item.status})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer active:translate-y-0.5">
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}