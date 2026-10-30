// Filename: ParentsPortalOverview.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

// 🎨 Subject 3D Color Gradients & Styles
const getSubjectStyles = (subject) => {
  const subLower = (subject || '').toLowerCase();
  if (subLower.includes('english')) {
    return { light: 'bg-blue-100 text-blue-900 border-blue-300', dark: 'bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white border-t border-blue-200 border-b-[4px] border-blue-950 shadow-md' };
  } else if (subLower.includes('hindi')) {
    return { light: 'bg-orange-100 text-orange-900 border-orange-300', dark: 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700 text-white border-t border-orange-200 border-b-[4px] border-orange-950 shadow-md' };
  } else if (subLower.includes('math') || subLower.includes('mathematics')) {
    return { light: 'bg-rose-100 text-rose-900 border-rose-300', dark: 'bg-gradient-to-r from-rose-500 via-pink-600 to-red-700 text-white border-t border-rose-200 border-b-[4px] border-rose-950 shadow-md' };
  } else if (subLower.includes('evs') || subLower.includes('science') || subLower.includes('biology')) {
    return { light: 'bg-emerald-100 text-emerald-900 border-emerald-300', dark: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-green-700 text-white border-t border-emerald-200 border-b-[4px] border-emerald-950 shadow-md' };
  } else if (subLower.includes('physics') || subLower.includes('chemistry') || subLower.includes('computer')) {
    return { light: 'bg-indigo-100 text-indigo-900 border-indigo-300', dark: 'bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-700 text-white border-t border-indigo-200 border-b-[4px] border-indigo-950 shadow-md' };
  } else if (subLower.includes('social') || subLower.includes('history')) {
    return { light: 'bg-amber-100 text-amber-900 border-amber-300', dark: 'bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-700 text-white border-t border-amber-200 border-b-[4px] border-amber-950 shadow-md' };
  } else if (subLower.includes('sanskrit')) {
    return { light: 'bg-purple-100 text-purple-900 border-purple-300', dark: 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 text-white border-t border-purple-200 border-b-[4px] border-purple-950 shadow-md' };
  } else if (subLower.includes('g.k.') || subLower.includes('gk')) {
    return { light: 'bg-lime-100 text-lime-900 border-lime-300', dark: 'bg-gradient-to-r from-lime-500 via-emerald-600 to-green-700 text-white border-t border-lime-200 border-b-[4px] border-lime-950 shadow-md' };
  }
  
  return { light: 'bg-slate-100 text-slate-800 border-slate-300', dark: 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white border-t border-slate-300 border-b-[4px] border-slate-950 shadow-md' };
};

export default function ParentsPortalOverview({ loggedInParentId = null }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [studentInfo, setStudentInfo] = useState({
    id: '',
    name: '',
    class: '',
    section: '',
    rollNo: '',
    admissionNo: '',
    fatherName: '',
    mobile: '',
    attendanceRate: '0%',
    totalPresents: '0 Days',
    totalAbsents: '0 Days',
    annualFee: '₹ 0',
    paidFee: '₹ 0',
    pendingFee: '₹ 0',
    academicSession: '2026 - 2027'
  });

  const [noticesList, setNoticesList] = useState([]);
  const [rawHomeworkList, setRawHomeworkList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [feeRecordsList, setFeeRecordsList] = useState([]);

  // Homework History Filter States - Strictly default to logged in student's class
  const [historyFilterClass, setHistoryFilterClass] = useState('');
  const [historyFilterDate, setHistoryFilterDate] = useState('');

  useEffect(() => {
    async function fetchPortalData() {
      setLoading(true);
      try {
        // 1. Fetch Logged-in Student Profile Data from 'students' table
        let studentQuery = supabase.from('students').select('*');
        if (loggedInParentId) {
          studentQuery = studentQuery.eq('id', loggedInParentId);
        }
        const { data: stData, error: stErr } = await studentQuery.limit(1);

        let currentStudentId = null;
        let currentSrNo = null;
        let currentStudentName = '';
        let currentClass = '';
        let annualFeesNum = 0;

        if (!stErr && stData && stData.length > 0) {
          const st = stData[0];
          currentStudentId = st.id;
          currentSrNo = st.sr_no;
          currentStudentName = st.student_full_name || '';
          currentClass = st.class_name || '';
          annualFeesNum = Number(st.annual_fees || 0);

          setStudentInfo(prev => ({
            ...prev,
            id: st.id,
            name: currentStudentName,
            class: currentClass,
            section: 'A',
            rollNo: st.sr_no || st.student_id || '',
            admissionNo: st.sr_no ? `SR-${st.sr_no}` : `STU-${st.id}`,
            fatherName: st.father_name || '',
            mobile: st.mobile_number || st.whatsapp_number || '',
            annualFee: annualFeesNum > 0 ? `₹ ${annualFeesNum.toLocaleString()}` : '₹ 0'
          }));

          setHistoryFilterClass(currentClass);
        }

        // 2. Fetch Daily Homework Tasks (Filtered by Student's Class Only)
        if (currentClass) {
          const { data: hwData, error: hwErr } = await supabase
            .from('daily_homework')
            .select('*')
            .ilike('class_name', `%${currentClass}%`)
            .order('id', { ascending: false });

          if (!hwErr && hwData) {
            setRawHomeworkList(hwData);
          }
        }

        // 3. Fetch Attendance Data ONLY for this specific student
        let attQuery = supabase
          .from('attendance')
          .select('id, student_id, sr_no, attendance_date, date, status, remarks, class_name, created_at');

        if (currentSrNo) {
          attQuery = attQuery.eq('sr_no', currentSrNo);
        } else if (currentStudentId) {
          attQuery = attQuery.eq('student_id', currentStudentId);
        }

        const { data: attData, error: attErr } = await attQuery.order('attendance_date', { ascending: false });

        if (!attErr && attData) {
          setAttendanceRecords(attData);

          const dbPresents = attData.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'p').length;
          const dbAbsents = attData.filter(a => a.status?.toLowerCase() === 'absent' || a.status?.toLowerCase() === 'a').length;
          
          const totalDays = dbPresents + dbAbsents;
          const percentage = totalDays > 0 ? Math.round((dbPresents / totalDays) * 100) : 0;
          
          setStudentInfo(prev => ({
            ...prev,
            attendanceRate: `${percentage}%`,
            totalPresents: `${dbPresents} Days`,
            totalAbsents: `${dbAbsents} Days`
          }));
        }

        // 4. Fetch School Notices from 'circulars_and_notices' table
        const { data: noticeData, error: noticeErr } = await supabase
          .from('circulars_and_notices')
          .select('id, title, description, category, audience, notice_date, created_at')
          .order('notice_date', { ascending: false });

        if (!noticeErr && noticeData) {
          setNoticesList(noticeData.map((n, idx) => ({
            id: n.id || idx + 1,
            date: n.notice_date || '',
            title: n.title || 'Notice',
            desc: n.description || ''
          })));
        }

        // 5. Fetch Fee Records ONLY for this specific student from 'fee_collections' table
        let feeQuery = supabase
          .from('fee_collections')
          .select('id, receipt_no, student_id, class_name, allocation_month, receipt_date, payment_mode, total_paid, sr_no');

        if (currentSrNo) {
          feeQuery = feeQuery.eq('sr_no', currentSrNo);
        } else if (currentStudentId) {
          feeQuery = feeQuery.eq('student_id', currentStudentId);
        }

        const { data: feeData, error: feeErr } = await feeQuery.order('receipt_date', { ascending: false });

        if (!feeErr && feeData) {
          let totalPaidSum = 0;
          const mappedFees = feeData.map((f, idx) => {
            const paid = Number(f.total_paid || 0);
            totalPaidSum += paid;
            return {
              id: f.id ? `TXN-2026-${f.id}` : `TXN-${idx + 1}`,
              studentName: currentStudentName || 'Student',
              class: f.class_name || currentClass || '',
              description: f.allocation_month ? `Tuition Fee Allocation (${f.allocation_month})` : 'Fee Payment',
              date: f.receipt_date || '',
              receiptNo: f.receipt_no || `REC-${idx + 1}`,
              amount: `₹ ${paid.toLocaleString()}`,
              status: 'PAID',
              mode: f.payment_mode ? f.payment_mode.toUpperCase() : 'CASH'
            };
          });

          const calculatedPending = Math.max(0, annualFeesNum - totalPaidSum);

          setFeeRecordsList(mappedFees);
          setStudentInfo(prev => ({
            ...prev,
            paidFee: `₹ ${totalPaidSum.toLocaleString()}`,
            pendingFee: `₹ ${calculatedPending.toLocaleString()}`
          }));
        }

      } catch (error) {
        console.error('Supabase fetch error:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPortalData();
  }, [loggedInParentId]);

  // Homework History Filter Logic matching student's class
  const getFilteredHomework = () => {
    let results = rawHomeworkList || [];

    if (historyFilterClass && historyFilterClass !== 'All') {
      results = results.filter(item => {
        const dbClass = (item.class_name || '').trim().toLowerCase();
        const filterClass = historyFilterClass.trim().toLowerCase();
        return dbClass === filterClass || dbClass.includes(filterClass) || filterClass.includes(dbClass);
      });
    }

    if (historyFilterDate && historyFilterDate.trim() !== '') {
      results = results.filter(item => {
        if (!item.assign_date) return false;
        const dbDate = item.assign_date.split('T')[0];
        return dbDate === historyFilterDate;
      });
    }

    return results;
  };

  const filteredHomework = getFilteredHomework();

  // Subject-wise consolidated data for filtered class
  const getSubjectWiseConsolidatedData = () => {
    const subjectMap = {};
    filteredHomework.forEach(item => {
      let sub = item.subject_name ? item.subject_name.trim() : 'General';
      if (!subjectMap[sub]) {
        subjectMap[sub] = [];
      }
      subjectMap[sub].push({
        id: item.id,
        date: item.assign_date,
        submissionDate: item.submission_date || 'Next Class',
        className: item.class_name,
        work: {
          title: item.chapter_title,
          description: item.instructions
        }
      });
    });
    return subjectMap;
  };

  const subjectWiseConsolidatedData = getSubjectWiseConsolidatedData();

  const handleResetFilters = () => {
    setHistoryFilterClass(studentInfo.class || 'All');
    setHistoryFilterDate('');
  };

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-300 rounded-2xl p-6 md:p-8 shadow-md space-y-6 text-slate-900 font-sans">
      
      {/* Academy Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 text-white border border-blue-500 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transform transition-all duration-300">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-inner">
            Parents Portal Overview
          </span>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-wide pt-1 drop-shadow-md">
            BLUE HEAVEN KIDS ACADEMY
          </h1>
          <p className="text-[13px] text-sky-100 font-medium">
            Welcome back, <strong className="text-white underline decoration-sky-300">{studentInfo.fatherName || 'Parent'}</strong> (Parent of <span className="text-yellow-300 font-bold">{studentInfo.name || 'Student'}</span>)
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-left space-y-1.5 min-w-[250px] shadow-lg">
          <div className="text-[12px] text-sky-100 font-bold flex justify-between">
            <span>Class:</span> <span className="text-white font-extrabold">{studentInfo.class}</span>
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

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-5 shadow-lg border border-emerald-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-100">Attendance Rate</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.attendanceRate}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-emerald-50 whitespace-nowrap">
            Presents: {studentInfo.totalPresents} | Absents: {studentInfo.totalAbsents}
          </div>
        </div>

        {/* Fee Paid */}
        <div className="bg-gradient-to-br from-blue-500 to-sky-700 text-white rounded-2xl p-5 shadow-lg border border-blue-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-100">Total Fee Paid</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.paidFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-blue-50">
            Annual Fee: {studentInfo.annualFee}
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-gradient-to-br from-rose-500 to-red-700 text-white rounded-2xl p-5 shadow-lg border border-rose-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100">Pending Dues</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.pendingFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-rose-50">
            Current Session
          </div>
        </div>

        {/* Academic Session */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg border border-amber-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-100">Academic Session</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.academicSession}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-amber-50">
            Active Status
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
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
            className={`text-[13px] font-extrabold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-4 border-blue-900'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-500 font-bold">
          <Loader2 className="animate-spin text-blue-700" size={32} />
          Fetching student live records from Supabase...
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
                <h2 className="text-[16px] font-black text-blue-900 flex items-center justify-between">
                  <span>Class Homework Tasks ({studentInfo.class})</span>
                  <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md font-bold">Live Data</span>
                </h2>
                <div className="space-y-3">
                  {rawHomeworkList.length > 0 ? (
                    rawHomeworkList.slice(0, 5).map((hw) => (
                      <div key={hw.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-extrabold text-blue-900">{hw.subject_name || 'General'}</span>
                          <span className="text-slate-500 text-[11px] font-bold">{hw.assign_date}</span>
                        </div>
                        <p className="text-[12px] text-slate-700 font-medium">
                          {hw.chapter_title ? `${hw.chapter_title}: ` : ''}{hw.instructions}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-semibold text-slate-400 py-4 text-center">No homework tasks found for {studentInfo.class}.</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
                <h2 className="text-[16px] font-black text-blue-900 flex items-center justify-between">
                  <span>Latest Notices & Circulars</span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-bold">Important</span>
                </h2>
                <div className="space-y-3">
                  {noticesList.length > 0 ? (
                    noticesList.map((n) => (
                      <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-extrabold text-slate-900">{n.title}</span>
                          <span className="text-slate-500 text-[11px] font-bold">{n.date}</span>
                        </div>
                        <p className="text-[12px] text-slate-700 font-medium">{n.desc}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-semibold text-slate-400 py-4 text-center">No notices found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Student Attendance Sub-Tab */}
          {activeTab === 'attendance' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-[16px] font-black text-[#1E293B]">Student Attendance History & Teacher Remarks</h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-extrabold">
                  Overall Status: {studentInfo.attendanceRate}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 min-w-[90px]">Roll No</th>
                      <th className="py-3 px-4 min-w-[200px]">Student Name</th>
                      <th className="py-3 px-4 min-w-[100px]">Class</th>
                      <th className="py-3 px-4 min-w-[130px]">Attendance Date</th>
                      <th className="py-3 px-4 min-w-[140px] text-center">Attendance Status</th>
                      <th className="py-3 px-4 min-w-[240px]">Teacher Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {attendanceRecords.length > 0 ? (
                      attendanceRecords.map((att, idx) => (
                        <tr key={att.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-100">
                              {att.sr_no || studentInfo.rollNo || idx + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-black text-slate-900 text-sm leading-tight">{studentInfo.name || 'Student'}</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">ID: STU-{studentInfo.id || '01'}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-black border border-slate-200">
                              {studentInfo.class || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600 whitespace-nowrap">
                            <span className="text-slate-700 font-semibold">
                              {att.attendance_date || att.date || ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {att.status?.toLowerCase() === 'present' || att.status?.toLowerCase() === 'p' ? (
                              <span className="px-3 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={13} /> Present
                              </span>
                            ) : att.status?.toLowerCase() === 'late' ? (
                              <span className="px-3 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock size={13} /> Late
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle size={13} /> Absent
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {att.remarks || 'No remarks recorded for this date.'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                          No attendance records found for {studentInfo.name}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Homework Sub-Tab */}
          {activeTab === 'homework' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b-2 border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>📜</span> Published Homework History
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                    Showing homework tasks specifically for Class: <strong className="text-indigo-600 font-black">{studentInfo.class}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-500">FILTER DATE:</span>
                    <input
                      type="date"
                      value={historyFilterDate}
                      onChange={(e) => setHistoryFilterDate(e.target.value)}
                      className="bg-slate-50 border-2 border-slate-200 text-xs text-slate-800 font-bold rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                    />
                  </div>

                  {historyFilterDate !== '' && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="bg-slate-700 hover:bg-slate-800 text-white font-black text-xs uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      Reset Date
                    </button>
                  )}
                </div>
              </div>

              {/* Consolidated Subject-wise View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.keys(subjectWiseConsolidatedData).length > 0 ? (
                  Object.keys(subjectWiseConsolidatedData).map((subject) => {
                    const entriesList = subjectWiseConsolidatedData[subject];
                    const { dark } = getSubjectStyles(subject);

                    return (
                      <div key={subject} className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div className={`${dark} font-black text-sm px-4 py-3 flex items-center justify-between`}>
                          <span>📘 {subject}</span>
                          <span className="bg-black/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                            {entriesList.length} Task{entriesList.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-96">
                          {entriesList.map((item, idx) => (
                            <div key={item.id || idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-1.5 mb-1.5">
                                <span>📅 Date: <strong className="text-slate-800">{item.date}</strong></span>
                                <span className="text-emerald-700 font-extrabold">Sub: {item.submissionDate}</span>
                              </div>

                              <div className="space-y-1.5">
                                {item.work.title && (
                                  <div className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                                    📌 {item.work.title}
                                  </div>
                                )}
                                {item.work.description && (
                                  <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed text-xs">
                                    {item.work.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-200">
                    No homework published yet for Class {studentInfo.class}.
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'notices' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[16px] font-black text-blue-900">School Notices & Announcements</h2>
              <div className="space-y-3">
                {noticesList.length > 0 ? (
                  noticesList.map((n) => (
                    <div key={n.id} className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[14px] font-extrabold text-blue-900">{n.title}</h3>
                        <span className="text-[12px] bg-slate-200 text-slate-800 px-3 py-1 rounded-full font-bold">{n.date}</span>
                      </div>
                      <p className="text-[13px] text-slate-700 font-medium">{n.desc}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-semibold text-slate-400 py-4 text-center">No notices found.</p>
                )}
              </div>
            </div>
          )}

          {/* Fee Records Sub-Tab */}
          {activeTab === 'fees' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-[16px] font-black text-[#1E293B]">Fee Payment History & Ledger</h2>
                
                <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-700 shadow-sm">
                  Annual Fee Total: <span className="text-emerald-600 font-black">{studentInfo.annualFee}</span> | Paid: <span className="text-blue-600 font-black">{studentInfo.paidFee}</span> | Pending: <span className="text-rose-600 font-black">{studentInfo.pendingFee}</span>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 min-w-[150px]">STUDENT DETAILS</th>
                      <th className="py-3 px-4 min-w-[280px]">DESCRIPTION</th>
                      <th className="py-3 px-4 min-w-[120px]">DATE</th>
                      <th className="py-3 px-4 min-w-[130px]">RECEIPT NO</th>
                      <th className="py-3 px-4 min-w-[110px]">AMOUNT</th>
                      <th className="py-3 px-4 min-w-[130px]">STATUS</th>
                      <th className="py-3 px-4 min-w-[110px] text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {feeRecordsList.length > 0 ? (
                      feeRecordsList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-black text-slate-900 text-sm leading-tight">{item.studentName}</p>
                            <p className="text-[11px] text-indigo-600 font-bold mt-0.5">{item.class}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600">
                            {item.description}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-black text-slate-800 text-xs">{item.date}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.id}</p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 font-bold">
                            {item.receiptNo}
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-600 text-sm whitespace-nowrap">
                            + {item.amount}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-black uppercase shadow-sm">
                              ✅ {item.mode} ({item.status})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer active:scale-95">
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">
                          No fee payment records found for {studentInfo.name}.
                        </td>
                      </tr>
                    )}
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