// Filename: parentsportaloverview1_3.txt
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ParentsPortalOverview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [studentInfo, setStudentInfo] = useState({
    name: 'Aarav Saini',
    class: 'PP.3+',
    section: 'A',
    rollNo: '20260006',
    admissionNo: '03d4d947-61b8-45ee-b619-3867431870cc',
    fatherName: 'Bhagwati Prasad Saini',
    mobile: '9828XXXXXX',
    attendance: '94%',
    attendanceStats: 'Presents: 172 Days | Absents: 11 Days',
    pendingFee: '₹0',
    paidFee: '₹14,500'
  });

  const [noticesList, setNoticesList] = useState([
    { id: 1, date: '22 Sep 2026', title: 'Half Yearly Exam Syllabus Update', desc: 'All subjects syllabus for upcoming term exams has been uploaded in the portal.' },
    { id: 2, date: '15 Sep 2026', title: 'Parent-Teacher Meeting (PTM)', desc: 'PTM scheduled for coming Saturday from 9:00 AM to 12:00 PM.' },
    { id: 3, date: '05 Sep 2026', title: 'Teachers Day Celebration', desc: 'Students participated enthusiastically in cultural events.' }
  ]);

  const [homeworkList, setHomeworkList] = useState([]);

  useEffect(() => {
    async function fetchPortalData() {
      setLoading(true);
      try {
        // 1. Fetch Daily Homework matching student class 'PP.3+'
        const { data: hwData, error: hwErr } = await supabase
          .from('daily_homework')
          .select('*')
          .eq('class_name', 'PP.3+')
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
            { id: 1, subject: 'Hindi', task: 'पाठ को ध्यानपूर्वक पढ़ें और कठिन शब्दों के अर्थ अपनी उत्तर-पुस्तिका में लिखें।', date: '2026-09-28' }
          ]);
        }

        // 2. Fetch Attendance for sr_no '20260006'
        const { data: attData } = await supabase
          .from('attendance')
          .select('*')
          .eq('sr_no', '20260006');

        if (attData && attData.length > 0) {
          const dbPresents = attData.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'p').length;
          const dbAbsents = attData.filter(a => a.status?.toLowerCase() === 'absent' || a.status?.toLowerCase() === 'a').length;
          
          const totalPresents = 171 + dbPresents;
          const totalAbsents = 11 + dbAbsents;
          const totalDays = totalPresents + totalAbsents;
          const percentage = totalDays > 0 ? Math.round((totalPresents / totalDays) * 100) : 94;

          setStudentInfo(prev => ({
            ...prev,
            attendance: `${percentage}%`,
            attendanceStats: `Presents: ${totalPresents} Days | Absents: ${totalAbsents} Days`
          }));
        }

        // 3. Fetch Notices from 'circulars_and_notices' (with safe fallback if blank)
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
    <div className="w-full bg-[#F8FAFC] border border-slate-300 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-slate-900 font-sans">
      
      {/* Academy Header Banner */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="bg-sky-100 text-sky-800 text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
            Parents Portal Overview
          </span>
          <h1 className="text-[20px] md:text-[24px] font-extrabold text-sky-900 tracking-wide pt-1">
            BLUE HEAVEN KIDS ACADEMY
          </h1>
          <p className="text-[13px] text-slate-600 font-medium">
            Welcome back, <strong className="text-slate-900">{studentInfo.fatherName}</strong> (Parent of <span className="text-sky-800 font-bold">{studentInfo.name}</span>)
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-1 min-w-[240px] shadow-sm">
          <div className="text-[12px] text-slate-700 font-bold flex justify-between">
            <span>Class:</span> <span className="text-slate-900">{studentInfo.class} ({studentInfo.section})</span>
          </div>
          <div className="text-[12px] text-slate-700 font-bold flex justify-between">
            <span>Roll No:</span> <span className="text-slate-900">{studentInfo.rollNo}</span>
          </div>
          <div className="text-[12px] text-slate-700 font-bold flex justify-between">
            <span>Admission ID:</span> <span className="text-slate-900 truncate max-w-[140px]">{studentInfo.admissionNo}</span>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
          <div className="text-[12px] text-slate-600 font-bold uppercase tracking-wider">Attendance Rate</div>
          <div className="text-[22px] font-extrabold text-emerald-700">{studentInfo.attendance}</div>
          <div className="text-[11px] text-slate-500 font-medium">{studentInfo.attendanceStats}</div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
          <div className="text-[12px] text-slate-600 font-bold uppercase tracking-wider">Total Fee Paid</div>
          <div className="text-[22px] font-extrabold text-sky-800">{studentInfo.paidFee}</div>
          <div className="text-[11px] text-emerald-700 font-bold">Accounts Cleared</div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
          <div className="text-[12px] text-slate-600 font-bold uppercase tracking-wider">Pending Dues</div>
          <div className="text-[22px] font-extrabold text-rose-700">{studentInfo.pendingFee}</div>
          <div className="text-[11px] text-slate-500 font-medium">No arrears pending</div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
          <div className="text-[12px] text-slate-600 font-bold uppercase tracking-wider">Academic Session</div>
          <div className="text-[18px] font-extrabold text-slate-900">2026 - 2027</div>
          <div className="text-[11px] text-sky-800 font-bold">Active Semester</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-slate-300 pb-3">
        {[
          { key: 'overview', label: '📊 Dashboard Overview' },
          { key: 'homework', label: '📚 Daily Homework' },
          { key: 'notices', label: '📢 School Notices' },
          { key: 'fees', label: '💳 Fee Records' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-[13px] font-bold px-4 py-2 rounded-xl transition cursor-pointer active:translate-y-0.5 ${
              activeTab === tab.key
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-500 font-bold">
          <Loader2 className="animate-spin text-sky-700" size={28} />
          Supabase se data load ho raha hai...
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-[15px] font-bold text-sky-800 flex items-center justify-between">
                  <span>Today's Homework Tasks</span>
                  <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">Updated Today</span>
                </h2>
                <div className="space-y-3">
                  {homeworkList.map((hw) => (
                    <div key={hw.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="font-bold text-sky-900">{hw.subject}</span>
                        <span className="text-slate-500 text-[11px] font-medium">{hw.date}</span>
                      </div>
                      <p className="text-[12px] text-slate-800 font-medium">{hw.task}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-[15px] font-bold text-sky-800 flex items-center justify-between">
                  <span>Latest Notices & Circulars</span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Important</span>
                </h2>
                <div className="space-y-3">
                  {noticesList.map((n) => (
                    <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="font-bold text-slate-900">{n.title}</span>
                        <span className="text-slate-500 text-[11px] font-medium">{n.date}</span>
                      </div>
                      <p className="text-[12px] text-slate-700 font-medium">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'homework' && (
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-[15px] font-bold text-sky-800">Complete Homework Assignments</h2>
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold border-b border-slate-300">
                      <th className="px-4 py-3 border-r border-slate-700">Date</th>
                      <th className="px-4 py-3 border-r border-slate-700">Subject</th>
                      <th className="px-4 py-3">Task Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-medium text-slate-900">
                    {homeworkList.map((hw) => (
                      <tr key={hw.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 border-r border-slate-200 font-semibold">{hw.date}</td>
                        <td className="px-4 py-3 border-r border-slate-200 text-sky-900 font-bold">{hw.subject}</td>
                        <td className="px-4 py-3 text-slate-800">{hw.task}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-[15px] font-bold text-sky-800">School Notices & Announcements</h2>
              <div className="space-y-3">
                {noticesList.map((n) => (
                  <div key={n.id} className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[14px] font-bold text-sky-900">{n.title}</h3>
                      <span className="text-[12px] bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded font-bold">{n.date}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 font-medium">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-[15px] font-bold text-sky-800">Fee Payment History & Ledger</h2>
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold border-b border-slate-300">
                      <th className="px-4 py-3 border-r border-slate-700">Receipt No</th>
                      <th className="px-4 py-3 border-r border-slate-700">Payment Date</th>
                      <th className="px-4 py-3 border-r border-slate-700">Amount Paid</th>
                      <th className="px-4 py-3">Mode & Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-medium text-slate-900">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 border-r border-slate-200 font-bold">REC-2026-042</td>
                      <td className="px-4 py-3 border-r border-slate-200">10 April 2026</td>
                      <td className="px-4 py-3 border-r border-slate-200 text-emerald-700 font-bold">₹ 14,500</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">Cash (Success)</td>
                    </tr>
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