// Filename: ParentsPortalOverview.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle, Clock, Bell, Calendar, FileText, CheckCircle, Download, Eye, AlertCircle, Paperclip, X } from 'lucide-react';
import OnlineTestQuiz from '@/components/school-dashboard/parents-dashboard/OnlineTestQuiz'; // 👈 Import OnlineTestQuiz

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

  // Homework History Filter States
  const [historyFilterClass, setHistoryFilterClass] = useState('');
  const [historyFilterDate, setHistoryFilterDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  useEffect(() => {
    async function fetchPortalData() {
      setLoading(true);
      try {
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
          currentClass = (st.class_name || '').trim();
          annualFeesNum = Number(st.annual_fees || 0);

          setStudentInfo(prev => ({
            ...prev,
            id: st.id,
            name: currentStudentName,
            class: currentClass,
            section: st.section || 'A',
            rollNo: st.sr_no || st.student_id || '',
            admissionNo: st.sr_no ? `SR-${st.sr_no}` : `STU-${st.id}`,
            fatherName: st.father_name || '',
            mobile: st.mobile_number || st.whatsapp_number || '',
            annualFee: annualFeesNum > 0 ? `₹ ${annualFeesNum.toLocaleString()}` : '₹ 0'
          }));

          setHistoryFilterClass(currentClass);
        }

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
          const filteredAtt = currentClass 
            ? attData.filter(a => !a.class_name || a.class_name.trim().toLowerCase() === currentClass.toLowerCase())
            : attData;

          setAttendanceRecords(filteredAtt);

          const dbPresentsOnly = filteredAtt.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'p').length;
          const dbLates = filteredAtt.filter(a => a.status?.toLowerCase() === 'late' || a.status?.toLowerCase() === 'l').length;
          const dbAbsents = filteredAtt.filter(a => a.status?.toLowerCase() === 'absent' || a.status?.toLowerCase() === 'a').length;
          
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
        }

        const { data: noticeData, error: noticeErr } = await supabase
          .from('circulars_and_notices')
          .select('*')
          .order('created_at', { ascending: false });

        if (!noticeErr && noticeData) {
          setNoticesList(noticeData.map((n, idx) => ({
            id: n.id || idx + 1,
            date: n.notice_date || n.created_at?.split('T')[0] || '',
            title: n.title || 'Notice',
            description: n.description || '',
            category: n.category || 'General',
            audience: n.audience || 'All Students & Parents',
            priority: n.priority || 'Medium',
            hasAttachment: n.has_attachment || false,
            attachmentUrl: n.attachment_url || ''
          })));
        }

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

  const getFilteredHomework = () => {
    let results = rawHomeworkList || [];
    const lockedClass = (studentInfo.class || historyFilterClass).trim().toLowerCase();
    if (lockedClass) {
      results = results.filter(item => {
        const dbClass = (item.class_name || '').trim().toLowerCase();
        return dbClass === lockedClass || dbClass.includes(lockedClass) || lockedClass.includes(dbClass);
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
    setHistoryFilterClass(studentInfo.class || '');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setHistoryFilterDate(`${yyyy}-${mm}-${dd}`);
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

      {/* Navigation Tabs (Added Online Test / Quiz) */}
      <div className="flex flex-wrap gap-3 border-b-2 border-slate-200 pb-4">
        {[
          { key: 'overview', label: '📊 Dashboard Overview' },
          { key: 'attendance', label: '📅 Student Attendance & Remarks' },
          { key: 'homework', label: '📚 Daily Homework' },
          { key: 'notices', label: '📢 School Notices' },
          { key: 'fees', label: '💳 Fee Records' },
          { key: 'quiz', label: '📝 Online Test / Quiz' }, // 👈 Added Tab
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

      {loading && activeTab !== 'quiz' ? (
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

          {activeTab === 'attendance' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              {/* Attendance Table Content */}
            </div>
          )}

          {activeTab === 'homework' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Homework Content */}
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              {/* Notices Content */}
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              {/* Fees Content */}
            </div>
          )}

          {/* 👇 Render OnlineTestQuiz Component Here */}
          {activeTab === 'quiz' && (
            <OnlineTestQuiz />
          )}
        </>
      )}

    </div>
  );
}