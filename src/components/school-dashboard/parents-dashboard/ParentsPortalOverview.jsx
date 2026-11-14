// Filename: ParentsPortalOverview.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
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

// 🎨 Subject 3D Color Gradients & Styles (Home2 के अनुसार)
const getSubjectStyles = (subject) => {
  const subLower = (subject || '').toLowerCase();
  if (subLower.includes('english')) {
    return { light: 'bg-blue-100 text-blue-900 border-blue-300', dark: 'bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white border-t border-blue-200 border-b-[4px] border-blue-950 shadow-md' };
  } else if (subLower.includes('hindi')) {
    return { light: 'bg-orange-100 text-orange-900 border-orange-300', dark: 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700 text-white border-t border-orange-200 border-b-[4px] border-orange-950 shadow-md' };
  } else if (subLower.includes('math') || subLower.includes('ganit') || subLower.includes('mathematics')) {
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

  const [childrenList, setChildrenList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [resolvedParentId, setResolvedParentId] = useState(loggedInParentId);

  const [studentInfo, setStudentInfo] = useState({
    id: '', name: '', class: '', section: 'A', rollNo: '', admissionNo: '',
    fatherName: '', mobile: '', attendanceRate: '0%', totalPresents: '0 Days',
    totalAbsents: '0 Days', totalLates: '0 Days', annualFee: '₹ 0',
    paidFee: '₹ 0', pendingFee: '₹ 0', academicSession: '2026 - 2027'
  });

  const [noticesList, setNoticesList] = useState([]);
  const [rawHomeworkList, setRawHomeworkList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [feeRecordsList, setFeeRecordsList] = useState([]);
  const [viewingNotice, setViewingNotice] = useState(null);

  // Auto-detect Parent ID from localStorage
  useEffect(() => {
    if (loggedInParentId) {
      setResolvedParentId(loggedInParentId);
      return;
    }

    const parentInfoStr = localStorage.getItem('parentInfo');
    if (parentInfoStr) {
      try {
        const pInfo = JSON.parse(parentInfoStr);
        if (pInfo.id) {
          setResolvedParentId(pInfo.id);
          return;
        }
      } catch (e) {}
    }

    const storedLogin = localStorage.getItem('parent_login_id');
    if (storedLogin) {
      setResolvedParentId(storedLogin);
    } else {
      setResolvedParentId('ALL');
    }
  }, [loggedInParentId]);

  // Fetch all children linked to this parent
  useEffect(() => {
    async function fetchParentChildren() {
      setLoading(true);
      try {
        if (!resolvedParentId || resolvedParentId === 'ALL') {
          const { data: allSt } = await supabase.from('students').select('*').limit(10);
          if (allSt && allSt.length > 0) {
            setChildrenList(allSt);
            setSelectedStudentId(allSt[0].student_id || allSt[0].id || allSt[0].sr_no);
          }
          setLoading(false);
          return;
        }

        const cleanKey = String(resolvedParentId).trim();

        let parentCredUuid = cleanKey;
        const { data: credData } = await supabase
          .from('parent_credentials')
          .select('id')
          .or(`id.eq.${cleanKey},portal_login_id.eq.${cleanKey},mobile_number.eq.${cleanKey}`)
          .limit(1);

        if (credData && credData.length > 0) {
          parentCredUuid = credData[0].id;
        }

        // Fetch from mapping table
        const { data: mappingData } = await supabase
          .from('parent_student_mapping')
          .select('student_id, sr_no')
          .eq('parent_credential_id', parentCredUuid);

        if (mappingData && mappingData.length > 0) {
          const studentIds = mappingData.map(m => m.student_id).filter(Boolean);
          const srNos = mappingData.map(m => m.sr_no).filter(Boolean);

          let studentQuery = supabase.from('students').select('*');
          let queryOr = [];
          if (studentIds.length > 0) queryOr.push(`student_id.in.(${studentIds.join(',')})`);
          if (srNos.length > 0) queryOr.push(`sr_no.in.(${srNos.join(',')})`);
          
          if (queryOr.length > 0) studentQuery = studentQuery.or(queryOr.join(','));

          const { data: studentsData } = await studentQuery;
          if (studentsData && studentsData.length > 0) {
            setChildrenList(studentsData);
            setSelectedStudentId(studentsData[0].student_id || studentsData[0].id || studentsData[0].sr_no);
            setLoading(false);
            return;
          }
        }

        // Fallback search directly in students table
        const { data: directSt } = await supabase
          .from('students')
          .select('*')
          .or(`sr_no.eq.${cleanKey},student_id.eq.${cleanKey},mobile_number.eq.${cleanKey}`);

        if (directSt && directSt.length > 0) {
          setChildrenList(directSt);
          setSelectedStudentId(directSt[0].student_id || directSt[0].id || directSt[0].sr_no);
        } else {
          const { data: fallback } = await supabase.from('students').select('*').limit(5);
          if (fallback && fallback.length > 0) {
            setChildrenList(fallback);
            setSelectedStudentId(fallback[0].student_id || fallback[0].id || fallback[0].sr_no);
          }
        }
      } catch (err) {
        console.error('Error fetching children:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchParentChildren();
  }, [resolvedParentId]);

  // Fetch active student's Homework, Attendance, Fees & Notices
  useEffect(() => {
    if (!selectedStudentId && childrenList.length === 0) return;

    async function fetchStudentData() {
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

        const currId = String(activeStudent.student_id || activeStudent.id || '').trim();
        const currSr = String(activeStudent.sr_no || '').trim();
        const currName = activeStudent.student_full_name || activeStudent.name || '';
        const currClass = (activeStudent.class_name || '').trim();
        const annualFeeNum = Number(activeStudent.annual_fees || 0);

        setStudentInfo({
          id: currId,
          name: currName,
          class: currClass,
          section: activeStudent.section || 'A',
          rollNo: currSr,
          admissionNo: currSr ? `SR-${currSr}` : `STU-${currId}`,
          fatherName: activeStudent.father_name || '',
          mobile: activeStudent.mobile_number || activeStudent.whatsapp_number || '',
          attendanceRate: '0%',
          totalPresents: '0 Days',
          totalAbsents: '0 Days',
          totalLates: '0 Days',
          annualFee: annualFeeNum > 0 ? `₹ ${annualFeeNum.toLocaleString()}` : '₹ 0',
          paidFee: '₹ 0',
          pendingFee: '₹ 0',
          academicSession: '2026 - 2027'
        });

        // Homework fetch
        const { data: hwData } = await supabase.from('daily_homework').select('*').order('id', { ascending: false });
        if (hwData) {
          const filteredHW = currClass ? hwData.filter(h => (h.class_name || '').toLowerCase().includes(currClass.toLowerCase())) : hwData;
          setRawHomeworkList(filteredHW);
        }

        // Attendance fetch
        let attQuery = supabase.from('attendance').select('*').order('attendance_date', { ascending: false });
        let attConditions = [];
        if (currSr) attConditions.push(`sr_no.eq.${currSr}`);
        if (currId) attConditions.push(`student_id.eq.${currId}`);
        if (attConditions.length > 0) attQuery = attQuery.or(attConditions.join(','));

        const { data: attData } = await attQuery;
        if (attData) {
          setAttendanceRecords(attData);
          const presents = attData.filter(a => ['present', 'p'].includes(a.status?.toLowerCase())).length;
          const lates = attData.filter(a => ['late', 'l'].includes(a.status?.toLowerCase())).length;
          const absents = attData.filter(a => ['absent', 'a'].includes(a.status?.toLowerCase())).length;
          const totalWorking = presents + lates + absents;
          const rate = totalWorking > 0 ? Math.round(((presents + lates) / totalWorking) * 100) : 0;

          setStudentInfo(prev => ({
            ...prev,
            attendanceRate: `${rate}%`,
            totalPresents: `${presents + lates} Days`,
            totalAbsents: `${absents} Days`,
            totalLates: `${lates} Times`
          }));
        }

        // Notices fetch
        const { data: noticeData } = await supabase.from('circulars_and_notices').select('*').order('created_at', { ascending: false });
        if (noticeData) {
          setNoticesList(noticeData.map((n, idx) => ({
            id: n.id || idx + 1,
            date: n.notice_date || n.created_at?.split('T')[0] || '',
            title: n.title || 'Notice',
            description: n.description || '',
            category: n.category || 'General',
            audience: n.audience || 'All',
            priority: n.priority || 'Medium',
            hasAttachment: n.has_attachment || false,
            attachmentUrl: n.attachment_url || ''
          })));
        }

        // Fee Collections fetch
        let feeQuery = supabase.from('fee_collections').select('*').order('receipt_date', { ascending: false });
        let feeConditions = [];
        if (currSr) feeConditions.push(`sr_no.eq.${currSr}`);
        if (currId) feeConditions.push(`student_id.eq.${currId}`);
        if (feeConditions.length > 0) feeQuery = feeQuery.or(feeConditions.join(','));

        const { data: feeData } = await feeQuery;
        if (feeData) {
          let totalPaid = 0;
          const mappedFees = feeData.map((f, idx) => {
            const paidAmt = Number(f.total_paid || f.fee_paid || 0);
            totalPaid += paidAmt;
            return {
              id: f.id || idx,
              studentName: currName,
              description: f.allocation_month ? `Tuition Fee (${f.allocation_month})` : 'Fee Payment',
              date: f.receipt_date || f.created_at?.split('T')[0] || '',
              receiptNo: f.receipt_no || `REC-${idx}`,
              amount: `₹ ${paidAmt.toLocaleString()}`,
              status: 'PAID'
            };
          });

          const pending = Math.max(0, annualFeeNum - totalPaid);
          setFeeRecordsList(mappedFees);
          setStudentInfo(prev => ({
            ...prev,
            paidFee: `₹ ${totalPaid.toLocaleString()}`,
            pendingFee: `₹ ${pending.toLocaleString()}`
          }));
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [selectedStudentId, childrenList]);

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-300 rounded-2xl p-6 md:p-8 shadow-md space-y-6 text-slate-900 font-sans">
      
      {/* 👶 MULTI-CHILD SELECTOR DROPDOWN BAR */}
      {childrenList.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-sm">
            <Users size={20} />
            <span>Select Child / Student ({childrenList.length} Children Linked):</span>
          </div>
          <select 
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl outline-none cursor-pointer border-2 border-amber-300 min-w-[260px]"
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
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase">Parents Portal</span>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-wide">BLUE HEAVEN KIDS ACADEMY</h1>
          <p className="text-[13px] text-sky-100">
            Parent: <strong className="text-white underline">{studentInfo.fatherName || 'Parent'}</strong> | Viewing Student: <span className="text-yellow-300 font-bold">{studentInfo.name}</span>
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-left space-y-1.5 min-w-[240px]">
          <div className="text-[12px] text-sky-100 font-bold flex justify-between"><span>Class:</span> <span className="text-white">{studentInfo.class}</span></div>
          <div className="text-[12px] text-sky-100 font-bold flex justify-between"><span>SR.NO:</span> <span className="text-white">{studentInfo.rollNo}</span></div>
          <div className="text-[12px] text-sky-100 font-bold flex justify-between"><span>Mobile:</span> <span className="text-white">{studentInfo.mobile}</span></div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] font-extrabold uppercase">Attendance Rate</div>
          <div className="text-[24px] font-black my-2">{studentInfo.attendanceRate}</div>
          <div className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-bold w-fit">Presents: {studentInfo.totalPresents}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-sky-700 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] font-extrabold uppercase">Total Fee Paid</div>
          <div className="text-[24px] font-black my-2">{studentInfo.paidFee}</div>
          <div className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-bold w-fit">Annual: {studentInfo.annualFee}</div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-red-700 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] font-extrabold uppercase">Pending Dues</div>
          <div className="text-[24px] font-black my-2">{studentInfo.pendingFee}</div>
          <div className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-bold w-fit">Current Session</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] font-extrabold uppercase">Academic Session</div>
          <div className="text-[24px] font-black my-2">{studentInfo.academicSession}</div>
          <div className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-bold w-fit">Active Status</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3 border-b-2 border-slate-200 pb-4">
        {[
          { key: 'overview', label: '📊 Dashboard Overview' },
          { key: 'notices', label: '📢 School Notices' },
          { key: 'attendance', label: '📅 Attendance & Remarks' },
          { key: 'homework', label: '📚 Daily Homework' },
          { key: 'fees', label: '💳 Fee Records' },
          { key: 'quiz', label: '📝 Online Test / Quiz' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-[13px] font-extrabold px-5 py-2.5 rounded-xl cursor-pointer shadow-md ${
              activeTab === tab.key ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-500 font-bold">
          <Loader2 className="animate-spin text-blue-700" size={32} /> Loading student records...
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-2xl p-6 shadow-md space-y-4">
                <h2 className="text-[16px] font-black text-blue-900">Class Homework ({studentInfo.class})</h2>
                <div className="space-y-3">
                  {rawHomeworkList.length > 0 ? (
                    rawHomeworkList.slice(0, 4).map((hw) => {
                      const { dark } = getSubjectStyles(hw.subject_name);
                      return (
                        <div key={hw.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                          <div className={`${dark} px-3 py-1.5 text-xs font-black flex justify-between items-center`}>
                            <span>📘 {hw.subject_name}</span>
                            <span>{hw.assign_date}</span>
                          </div>
                          <div className="p-3 text-xs space-y-1">
                            {hw.chapter_title && <div className="font-bold text-slate-900">📌 {hw.chapter_title}</div>}
                            <div className="text-slate-700">{hw.instructions}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : <p className="text-xs text-slate-400">No homework found.</p>}
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow-md space-y-4">
                <h2 className="text-[16px] font-black text-blue-900">Latest Notices</h2>
                <div className="space-y-3">
                  {noticesList.length > 0 ? (
                    noticesList.slice(0, 3).map((n) => (
                      <div key={n.id} className="bg-slate-50 border rounded-xl p-3 text-xs">
                        <div className="font-bold text-slate-900">{n.title}</div>
                        <div className="text-slate-600 line-clamp-1">{n.description}</div>
                      </div>
                    ))
                  ) : <p className="text-xs text-slate-400">No notices found.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="bg-white border rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[18px] font-black text-blue-900">School Notices & Circulars</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {noticesList.map((notice) => (
                  <div key={notice.id} className="bg-slate-50 rounded-2xl border p-5 space-y-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getPriorityColor(notice.priority)}`}>{notice.priority} Priority</span>
                    <h3 className="text-lg font-black">{notice.title}</h3>
                    <p className="text-sm text-slate-600">{notice.description}</p>
                    {notice.hasAttachment && (
                      <button onClick={() => setViewingNotice(notice)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-white bg-indigo-600 cursor-pointer">
                        <Eye size={14} /> View Attachment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white border rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[16px] font-black">Attendance Records ({studentInfo.name})</h2>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                    <th className="p-3">SR.NO</th><th className="p-3">Date</th><th className="p-3 text-center">Status</th><th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-semibold">
                  {attendanceRecords.length > 0 ? attendanceRecords.map((att, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3">{att.sr_no || studentInfo.rollNo}</td>
                      <td className="p-3">{att.attendance_date || att.date}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${att.status?.toLowerCase().startsWith('p') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3">{att.remarks || 'No remarks'}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="p-6 text-center text-slate-400">No attendance records.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'homework' && (
            <div className="bg-white border rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[18px] font-black text-blue-900">Class Homework ({studentInfo.class})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rawHomeworkList.length > 0 ? rawHomeworkList.map((hw) => {
                  const { dark } = getSubjectStyles(hw.subject_name);
                  return (
                    <div key={hw.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className={`${dark} px-4 py-3 text-xs font-black flex justify-between items-center`}>
                        <span>📘 {hw.subject_name}</span>
                        <span>{hw.assign_date}</span>
                      </div>
                      <div className="p-4 space-y-2 flex-1">
                        {hw.chapter_title && <div className="font-extrabold text-sm text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">📌 {hw.chapter_title}</div>}
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{hw.instructions}</p>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border-t text-[11px] text-slate-500 font-bold flex justify-between">
                        <span>Submission:</span>
                        <span className="text-emerald-700">{hw.submission_date || 'Next Class'}</span>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-slate-400">No homework assigned.</p>}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="bg-white border rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-[16px] font-black">Fee Payment Ledger</h2>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                    <th className="p-3">Description</th><th className="p-3">Date</th><th className="p-3">Receipt No</th><th className="p-3">Amount</th><th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-semibold">
                  {feeRecordsList.length > 0 ? feeRecordsList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3 font-mono">{item.receiptNo}</td>
                      <td className="p-3 font-black text-emerald-600">{item.amount}</td>
                      <td className="p-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px]">PAID</span></td>
                    </tr>
                  )) : <tr><td colSpan="5" className="p-6 text-center text-slate-400">No fee records found.</td></tr>}
                </tbody>
              </table>
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