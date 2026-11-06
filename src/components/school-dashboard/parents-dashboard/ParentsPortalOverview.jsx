'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Download, 
  Eye, 
  AlertCircle, 
  Paperclip, 
  X 
} from 'lucide-react';
import OnlineTestQuiz from '@/components/school-dashboard/parents-dashboard/OnlineTestQuiz';

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

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default: return 'bg-green-100 text-green-700 border-green-200';
  }
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
    totalLates: '0 Days',
    annualFee: '₹ 0',
    paidFee: '₹ 0',
    pendingFee: '₹ 0',
    academicSession: '2026 - 2027'
  });

  const [noticesList, setNoticesList] = useState([]);
  const [rawHomeworkList, setRawHomeworkList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [feeRecordsList, setFeeRecordsList] = useState([]);

  // View Document Modal State for Notices
  const [viewingNotice, setViewingNotice] = useState(null);

  useEffect(() => {
    async function fetchPortalData() {
      setLoading(true);
      try {
        if (!loggedInParentId) {
          setLoading(false);
          return;
        }

        const cleanId = String(loggedInParentId).trim();

        // 1. Fetch Student Info (Clean & Explicit Lookup)
        const { data: stData, error: stErr } = await supabase
          .from('students')
          .select('*')
          .or(`sr_no.eq.${cleanId},student_id.eq.${cleanId},id.eq.${cleanId}`)
          .limit(1);

        let currentStudentId = null;
        let currentSrNo = null;
        let currentStudentName = '';
        let currentClass = '';
        let annualFeesNum = 0;

        if (!stErr && stData && stData.length > 0) {
          const st = stData[0];
          currentStudentId = st.student_id || st.id;
          currentSrNo = st.sr_no;
          currentStudentName = st.student_full_name || st.name || st.student_name || '';
          currentClass = (st.class_name || '').trim();
          annualFeesNum = Number(st.annual_fees || 0);

          setStudentInfo(prev => ({
            ...prev,
            id: st.student_id || st.id || '',
            name: currentStudentName,
            class: currentClass,
            section: st.section || 'A',
            rollNo: st.sr_no || st.student_id || '',
            admissionNo: st.sr_no ? `SR-${st.sr_no}` : `STU-${st.id}`,
            fatherName: st.father_name || '',
            mobile: st.mobile_number || st.whatsapp_number || '',
            annualFee: annualFeesNum > 0 ? `₹ ${annualFeesNum.toLocaleString()}` : '₹ 0'
          }));
        } else {
          console.warn('Student record not found for loggedInParentId:', loggedInParentId);
          setLoading(false);
          return;
        }

        // 2. Fetch Daily Homework
        const { data: hwData, error: hwErr } = await supabase
          .from('daily_homework')
          .select('*')
          .order('id', { ascending: false });

        if (!hwErr && hwData) {
          const classFilteredHW = currentClass
            ? hwData.filter(h => (h.class_name || '').toLowerCase().includes(currentClass.toLowerCase()))
            : hwData;
          setRawHomeworkList(classFilteredHW);
        }

        // 3. Fetch Attendance (Strict multi-pass filter fallback)
        let attData = [];
        
        // Pass A: Fetch by sr_no
        if (currentSrNo) {
          const { data: srAtt } = await supabase
            .from('attendance')
            .select('*')
            .eq('sr_no', String(currentSrNo))
            .order('attendance_date', { ascending: false });
          if (srAtt && srAtt.length > 0) attData = srAtt;
        }
        
        // Pass B: Fallback by student_id if sr_no returns empty
        if (attData.length === 0 && currentStudentId) {
          const { data: idAtt } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', String(currentStudentId))
            .order('attendance_date', { ascending: false });
          if (idAtt && idAtt.length > 0) attData = idAtt;
        }

        setAttendanceRecords(attData);

        const dbPresentsOnly = attData.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'p').length;
        const dbLates = attData.filter(a => a.status?.toLowerCase() === 'late' || a.status?.toLowerCase() === 'l').length;
        const dbAbsents = attData.filter(a => a.status?.toLowerCase() === 'absent' || a.status?.toLowerCase() === 'a').length;
        
        const totalPresentIncludingLate = dbPresentsOnly + dbLates;
        const totalWorkingDays = totalPresentIncludingLate + dbAbsents;
        const percentage = totalWorkingDays > 0 ? Math.round((totalPresentIncludingLate / totalWorkingDays) * 100) : 0;
        
        setStudentInfo(prev => ({
          ...prev,
          attendanceRate: `${percentage}%`,
          totalPresents: `${totalPresentIncludingLate} Days`,
          totalAbsents: `${dbAbsents} Days`,
          totalLates: `${dbLates} Times`
        }));

        // 4. Fetch Notices
        const { data: noticeData, error: noticeErr } = await supabase
          .from('circulars_and_notices')
          .select('*')
          .order('created_at', { ascending: false });

        if (!noticeErr && noticeData) {
          setNoticesList(noticeData.map((n, idx) => ({
            id: n.id || idx + 1,
            date: n.notice_date || (n.created_at ? n.created_at.split('T')[0] : ''),
            title: n.title || 'Notice',
            description: n.description || '',
            category: n.category || 'General',
            audience: n.audience || 'All Students & Parents',
            priority: n.priority || 'Medium',
            hasAttachment: n.has_attachment || false,
            attachmentUrl: n.attachment_url || ''
          })));
        }

        // 5. Fetch Fees (Strict Multi-pass Filter)
        let feeData = [];
        if (currentSrNo) {
          const { data: srFee } = await supabase
            .from('fee_collections')
            .select('*')
            .eq('sr_no', String(currentSrNo))
            .order('receipt_date', { ascending: false });
          if (srFee && srFee.length > 0) feeData = srFee;
        }
        if (feeData.length === 0 && currentStudentId) {
          const { data: idFee } = await supabase
            .from('fee_collections')
            .select('*')
            .eq('student_id', String(currentStudentId))
            .order('receipt_date', { ascending: false });
          if (idFee && idFee.length > 0) feeData = idFee;
        }

        let totalPaidSum = 0;
        const mappedFees = (feeData || []).map((f, idx) => {
          const paid = Number(f.total_paid || f.fee_paid || 0);
          totalPaidSum += paid;
          return {
            id: f.id ? `TXN-2026-${f.id}` : `TXN-${idx + 1}`,
            studentName: currentStudentName || 'Student',
            class: f.class_name || currentClass || '',
            description: f.allocation_month ? `Tuition Fee Allocation (${f.allocation_month})` : 'Fee Payment',
            date: f.receipt_date || (f.created_at ? f.created_at.split('T')[0] : ''),
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

      } catch (error) {
        console.error('Supabase fetch error:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPortalData();
  }, [loggedInParentId]);

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
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-5 shadow-lg border border-emerald-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-100">Attendance Rate</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.attendanceRate}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-emerald-50 whitespace-nowrap">
            Presents: {studentInfo.totalPresents} | Absents: {studentInfo.totalAbsents} | Late: {studentInfo.totalLates}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-sky-700 text-white rounded-2xl p-5 shadow-lg border border-blue-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-100">Total Fee Paid</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.paidFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-blue-50">
            Annual Fee: {studentInfo.annualFee}
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-700 text-white rounded-2xl p-5 shadow-lg border border-rose-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100">Pending Dues</div>
          <div className="text-[24px] font-black tracking-tight my-2 drop-shadow">{studentInfo.pendingFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-rose-50">
            Current Session
          </div>
        </div>

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
          { key: 'quiz', label: '📝 Online Test / Quiz' },
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
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
                <h2 className="text-[16px] font-black text-blue-900 flex items-center justify-between">
                  <span>Class Homework Tasks ({studentInfo.class})</span>
                  <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md font-bold">Live Data</span>
                </h2>
                <div className="space-y-3">
                  {rawHomeworkList.length > 0 ? (
                    rawHomeworkList.slice(0, 5).map((hw) => {
                      const subjectName = hw.subject_name || 'General';
                      const { dark } = getSubjectStyles(subjectName);
                      return (
                        <div key={hw.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div className={`${dark} px-3 py-1.5 text-[11px] font-black flex justify-between items-center`}>
                            <span>📘 {subjectName}</span>
                            <span>{hw.assign_date}</span>
                          </div>
                          <div className="p-3 text-[12px] text-slate-700 font-medium">
                            {hw.chapter_title ? `${hw.chapter_title}: ` : ''}{hw.instructions}
                          </div>
                        </div>
                      );
                    })
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
                    noticesList.slice(0, 3).map((n) => (
                      <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-extrabold text-slate-900">{n.title}</span>
                          <span className="text-slate-500 text-[11px] font-bold">{n.date}</span>
                        </div>
                        {n.description && <p className="text-[12px] text-slate-700 font-medium line-clamp-1">{n.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-semibold text-slate-400 py-4 text-center">No notices found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE & REMARKS */}
          {activeTab === 'attendance' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-[16px] font-black text-[#1E293B]">Student Attendance History & Teacher Remarks</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-extrabold">
                    Overall Status: {studentInfo.attendanceRate}
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 px-3 py-1 rounded-md font-extrabold">
                    Late Count: {studentInfo.totalLates}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 min-w-[90px]">Roll No / SR</th>
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
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">ID: STU-{att.student_id || studentInfo.id || '01'}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-black border border-slate-200">
                              {att.class_name || studentInfo.class || 'N/A'}
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
                          No attendance records found for {studentInfo.name || 'this student'}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY HOMEWORK */}
          {activeTab === 'homework' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[18px] font-black text-blue-900 flex justify-between items-center">
                <span>Daily Class Homework ({studentInfo.class || 'All Classes'})</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full">
                  Total: {rawHomeworkList.length} Tasks
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rawHomeworkList.length > 0 ? (
                  rawHomeworkList.map((hw) => {
                    const subjectName = hw.subject_name || 'General';
                    const { dark } = getSubjectStyles(subjectName);
                    return (
                      <div key={hw.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                        <div className={`${dark} px-4 py-2.5 text-xs font-black flex justify-between items-center`}>
                          <span>📘 {subjectName}</span>
                          <span>Assigned: {hw.assign_date}</span>
                        </div>
                        <div className="p-4 space-y-2 flex-1">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {hw.chapter_title ? `Chapter: ${hw.chapter_title}` : 'Homework Instructions'}
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {hw.instructions || 'No specific instructions provided.'}
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-[11px] font-bold text-slate-600 flex justify-between">
                          <span>Class: {hw.class_name}</span>
                          <span>Submission: {hw.submission_date || 'Next Class'}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-200">
                    No homework assigned for class {studentInfo.class}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SCHOOL NOTICES */}
          {activeTab === 'notices' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[18px] font-black text-blue-900">School Notices & Announcements</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {noticesList.length > 0 ? (
                  noticesList.map((notice) => (
                    <div key={notice.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${getPriorityColor(notice.priority)} flex items-center gap-1.5`}>
                            <AlertCircle size={14} />
                            {notice.priority} Priority
                          </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-2">
                          {notice.title}
                        </h3>
                        
                        {notice.description && (
                          <p className="text-slate-600 text-sm font-medium mb-4 whitespace-pre-wrap">
                            {notice.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 bg-white p-3 rounded-xl border border-slate-100 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            {notice.date ? new Date(notice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </div>
                          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                          <div className="flex items-center gap-1.5 text-indigo-600">
                            <FileText size={14} />
                            {notice.category}
                          </div>
                          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-slate-400" />
                            {notice.audience}
                          </div>
                        </div>
                      </div>
                      
                      {notice.hasAttachment && (
                        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <Paperclip size={16} className="text-indigo-600" />
                            <span>Attached Document</span>
                          </div>
                          {notice.attachmentUrl ? (
                            <button 
                              onClick={() => setViewingNotice(notice)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-t border-indigo-300 border-b-[3px] border-indigo-950 shadow-sm active:translate-y-0.5 active:border-b-[1px] transition-all cursor-pointer"
                            >
                              <Eye size={14} /> View File
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-semibold">No URL available</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-200">
                    No notices found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: FEE RECORDS */}
          {activeTab === 'fees' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-[16px] font-black text-[#1E293B]">Fee Payment History & Ledger</h2>
                
                <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-700 shadow-sm">
                  Annual Fee: <span className="text-emerald-600 font-black">{studentInfo.annualFee}</span> | Paid: <span className="text-blue-600 font-black">{studentInfo.paidFee}</span> | Pending: <span className="text-rose-600 font-black">{studentInfo.pendingFee}</span>
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                          No fee payment records found for {studentInfo.name || 'this student'}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ONLINE TEST / QUIZ */}
          {activeTab === 'quiz' && (
            <OnlineTestQuiz loggedInParentId={loggedInParentId} />
          )}
        </>
      )}

      {/* Modal Popup for Notices Attachments */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-900">{viewingNotice.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">Document Preview & Download</p>
              </div>
              <button 
                onClick={() => setViewingNotice(null)} 
                className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center">
              {viewingNotice.attachmentUrl.includes('.pdf') || viewingNotice.attachmentUrl.startsWith('data:application/pdf') ? (
                <iframe 
                  src={viewingNotice.attachmentUrl} 
                  className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-inner"
                  title="PDF Viewer"
                />
              ) : (
                <img 
                  src={viewingNotice.attachmentUrl} 
                  alt="Attachment Preview" 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-md border border-slate-300 bg-white" 
                />
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setViewingNotice(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
              <a 
                href={viewingNotice.attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                download
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-md cursor-pointer"
              >
                <Download size={18} /> Download File
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}