// Filename: ParentsPortalOverview.jsx
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
  X,
  Users
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

  // Multiple Children States
  const [childrenList, setChildrenList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

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

  const [viewingNotice, setViewingNotice] = useState(null);

  // 1. Step: Pehle Parent ke saare linked children ko fetch karna
  useEffect(() => {
    async function fetchParentChildren() {
      if (!loggedInParentId) return;
      try {
        const cleanParentKey = String(loggedInParentId).trim();

        // Check karein ki loggedInParentId, parent_credentials ki 'id' hai ya 'portal_login_id'
        let parentCredUuid = cleanParentKey;
        const { data: credData } = await supabase
          .from('parent_credentials')
          .select('id')
          .or(`id.eq.${cleanParentKey},portal_login_id.eq.${cleanParentKey}`)
          .limit(1);

        if (credData && credData.length > 0) {
          parentCredUuid = credData[0].id;
        }

        // parent_student_mapping se is parent ke sabhi student_id/sr_no nikalein
        const { data: mappingData, error: mapErr } = await supabase
          .from('parent_student_mapping')
          .select('student_id, sr_no')
          .eq('parent_credential_id', parentCredUuid);

        if (!mapErr && mappingData && mappingData.length > 0) {
          // Ab students table se un sabhi bachho ki details layein
          const studentIds = mappingData.map(m => m.student_id).filter(Boolean);
          const srNos = mappingData.map(m => m.sr_no).filter(Boolean);

          let studentQuery = supabase.from('students').select('*');
          let queryOr = [];
          if (studentIds.length > 0) queryOr.push(`student_id.in.(${studentIds.join(',')})`);
          if (srNos.length > 0) queryOr.push(`sr_no.in.(${srNos.join(',')})`);
          
          if (queryOr.length > 0) {
            studentQuery = studentQuery.or(queryOr.join(','));
          }

          const { data: studentsData } = await studentQuery;
          if (studentsData && studentsData.length > 0) {
            setChildrenList(studentsData);
            // Default pehla bachha select karein
            setSelectedStudentId(studentsData[0].student_id || studentsData[0].id || studentsData[0].sr_no);
            return;
          }
        }

        // Fallback: Agar mapping table me entry nahi mili toh direct student table me search karein
        let directQuery = supabase.from('students').select('*');
        directQuery = directQuery.or(`sr_no.eq.${cleanParentKey},id.eq.${cleanParentKey},student_id.eq.${cleanParentKey}`);
        const { data: directSt } = await directQuery;

        if (directSt && directSt.length > 0) {
          setChildrenList(directSt);
          setSelectedStudentId(directSt[0].student_id || directSt[0].id || directSt[0].sr_no);
        }

      } catch (err) {
        console.error('Error fetching children:', err.message);
      }
    }

    fetchParentChildren();
  }, [loggedInParentId]);

  // 2. Step: Jab bhi Selected Student change ho, uska sara data fetch ho
  useEffect(() => {
    if (!selectedStudentId && childrenList.length === 0) return;

    async function fetchStudentPortalData() {
      setLoading(true);
      try {
        const activeStudent = childrenList.find(
          s => String(s.student_id) === String(selectedStudentId) || 
               String(s.id) === String(selectedStudentId) || 
               String(s.sr_no) === String(selectedStudentId)
        ) || childrenList[0];

        if (!activeStudent) {
          setLoading(false);
          return;
        }

        const currentStudentId = String(activeStudent.student_id || activeStudent.id || '').trim();
        const currentSrNo = String(activeStudent.sr_no || '').trim();
        const currentStudentName = activeStudent.student_full_name || activeStudent.name || '';
        const currentClass = (activeStudent.class_name || '').trim();
        const annualFeesNum = Number(activeStudent.annual_fees || 0);

        setStudentInfo({
          id: currentStudentId,
          name: currentStudentName,
          class: currentClass,
          section: activeStudent.section || 'A',
          rollNo: currentSrNo,
          admissionNo: currentSrNo ? `SR-${currentSrNo}` : `STU-${currentStudentId}`,
          fatherName: activeStudent.father_name || '',
          mobile: activeStudent.mobile_number || activeStudent.whatsapp_number || '',
          attendanceRate: '0%',
          totalPresents: '0 Days',
          totalAbsents: '0 Days',
          totalLates: '0 Days',
          annualFee: annualFeesNum > 0 ? `₹ ${annualFeesNum.toLocaleString()}` : '₹ 0',
          paidFee: '₹ 0',
          pendingFee: '₹ 0',
          academicSession: '2026 - 2027'
        });

        // Homework fetch (Class wise)
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

        // Attendance fetch
        let attConditions = [];
        if (currentSrNo) attConditions.push(`sr_no.eq.${currentSrNo}`);
        if (currentStudentId) attConditions.push(`student_id.eq.${currentStudentId}`);
        
        let attQuery = supabase.from('attendance').select('*').order('attendance_date', { ascending: false });
        if (attConditions.length > 0) {
          attQuery = attQuery.or(attConditions.join(','));
        }
        const { data: attData } = await attQuery;

        if (attData) {
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
        }

        // Notices fetch
        const { data: noticeData } = await supabase
          .from('circulars_and_notices')
          .select('*')
          .order('created_at', { ascending: false });

        if (noticeData) {
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

        // Fee Collections fetch
        let feeConditions = [];
        if (currentSrNo) feeConditions.push(`sr_no.eq.${currentSrNo}`);
        if (currentStudentId) feeConditions.push(`student_id.eq.${currentStudentId},id.eq.${currentStudentId}`);

        let feeQuery = supabase.from('fee_collections').select('*').order('receipt_date', { ascending: false });
        if (feeConditions.length > 0) {
          feeQuery = feeQuery.or(feeConditions.join(','));
        }
        const { data: feeData } = await feeQuery;

        if (feeData) {
          let totalPaidSum = 0;
          const mappedFees = feeData.map((f, idx) => {
            const paid = Number(f.total_paid || f.fee_paid || 0);
            totalPaidSum += paid;
            return {
              id: f.id ? `TXN-2026-${f.id}` : `TXN-${idx + 1}`,
              studentName: currentStudentName,
              class: f.class_name || currentClass,
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
        }

      } catch (error) {
        console.error('Supabase fetch error:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentPortalData();
  }, [selectedStudentId, childrenList]);

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-300 rounded-2xl p-6 md:p-8 shadow-md space-y-6 text-slate-900 font-sans">
      
      {/* 👶 MULTIPLE CHILDREN SELECTOR BAR */}
      {childrenList.length > 1 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-sm">
            <Users size={20} />
            <span>Select Student / Child ({childrenList.length} Children Linked):</span>
          </div>
          <select 
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl outline-none shadow-inner cursor-pointer border-2 border-amber-300 min-w-[240px]"
          >
            {childrenList.map((child) => (
              <option key={child.id || child.student_id} value={child.student_id || child.id || child.sr_no}>
                {child.student_full_name || child.name} (Class: {child.class_name} | SR: {child.sr_no})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Academy Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 text-white border border-blue-500 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Parents Portal Overview
          </span>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-wide pt-1">
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
            <span>SR.NO:</span> <span className="text-white font-extrabold">{studentInfo.rollNo}</span>
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
          <div className="text-[24px] font-black tracking-tight my-2">{studentInfo.attendanceRate}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-emerald-50 whitespace-nowrap">
            Presents: {studentInfo.totalPresents} | Absents: {studentInfo.totalAbsents} | Late: {studentInfo.totalLates}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-sky-700 text-white rounded-2xl p-5 shadow-lg border border-blue-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-100">Total Fee Paid</div>
          <div className="text-[24px] font-black tracking-tight my-2">{studentInfo.paidFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-blue-50">
            Annual Fee: {studentInfo.annualFee}
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-700 text-white rounded-2xl p-5 shadow-lg border border-rose-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100">Pending Dues</div>
          <div className="text-[24px] font-black tracking-tight my-2">{studentInfo.pendingFee}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-rose-50">
            Current Session
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg border border-amber-400 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-100">Academic Session</div>
          <div className="text-[24px] font-black tracking-tight my-2">{studentInfo.academicSession}</div>
          <div className="text-[11px] bg-white/20 px-2.5 py-1 rounded-md font-bold w-fit text-amber-50">
            Active Status
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3 border-b-2 border-slate-200 pb-4">
        {[
          { key: 'overview', label: '📊 Dashboard Overview' },
          { key: 'notices', label: '📢 School Notices' },
          { key: 'attendance', label: '📅 Student Attendance & Remarks' },
          { key: 'homework', label: '📚 Daily Homework' },
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
                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-2">{notice.title}</h3>
                        {notice.description && <p className="text-slate-600 text-sm font-medium mb-4 whitespace-pre-wrap">{notice.description}</p>}
                      </div>
                      {notice.hasAttachment && (
                        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <Paperclip size={16} className="text-indigo-600" />
                            <span>Attached Document</span>
                          </div>
                          {notice.attachmentUrl && (
                            <button 
                              onClick={() => setViewingNotice(notice)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-white bg-indigo-600 shadow-sm cursor-pointer"
                            >
                              <Eye size={14} /> View File
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold">No notices found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[16px] font-black text-[#1E293B]">Student Attendance & Remarks ({studentInfo.name})</h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-extrabold">
                  Status: {studentInfo.attendanceRate}
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">SR.NO</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {attendanceRecords.length > 0 ? (
                      attendanceRecords.map((att, idx) => (
                        <tr key={att.id || idx} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-black">{att.sr_no || studentInfo.rollNo}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900">{studentInfo.name}</td>
                          <td className="py-3.5 px-4">{studentInfo.class}</td>
                          <td className="py-3.5 px-4">{att.attendance_date || att.date}</td>
                          <td className="py-3.5 px-4 text-center">
                            {att.status?.toLowerCase() === 'present' || att.status?.toLowerCase() === 'p' ? (
                              <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800">Present</span>
                            ) : (
                              <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800">Absent</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">{att.remarks || 'No remarks'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="py-12 text-center text-slate-400 font-bold">No attendance records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'homework' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[18px] font-black text-blue-900">Daily Homework ({studentInfo.class})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rawHomeworkList.length > 0 ? (
                  rawHomeworkList.map((hw) => {
                    const { dark } = getSubjectStyles(hw.subject_name);
                    return (
                      <div key={hw.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className={`${dark} px-4 py-2.5 text-xs font-black flex justify-between`}>
                          <span>📘 {hw.subject_name || 'General'}</span>
                          <span>{hw.assign_date}</span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-extrabold text-sm">{hw.chapter_title}</h4>
                          <p className="text-xs text-slate-700">{hw.instructions}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold">No homework assigned.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[16px] font-black text-[#1E293B]">Fee Payment Ledger ({studentInfo.name})</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Receipt</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {feeRecordsList.length > 0 ? (
                      feeRecordsList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-black">{item.studentName}</td>
                          <td className="py-3.5 px-4">{item.description}</td>
                          <td className="py-3.5 px-4">{item.date}</td>
                          <td className="py-3.5 px-4 font-mono">{item.receiptNo}</td>
                          <td className="py-3.5 px-4 font-black text-emerald-600">+ {item.amount}</td>
                          <td className="py-3.5 px-4"><span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px]">PAID</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="py-12 text-center text-slate-400 font-bold">No fee records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <OnlineTestQuiz loggedInParentId={selectedStudentId} />
          )}
        </>
      )}

      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black">{viewingNotice.title}</h3>
              <button onClick={() => setViewingNotice(null)} className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer"><X size={20} /></button>
            </div>
            <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center">
              <iframe src={viewingNotice.attachmentUrl} className="w-full h-full rounded-xl bg-white" title="Viewer" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}