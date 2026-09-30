'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export default function StudentAnalyticsRTE() {
  // Dynamic today date calculation
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Dynamic system date selection (By default aaj ki current date set hoti hai)
  const [targetDate, setTargetDate] = useState(getTodayDate());
  
  const [fromSession, setFromSession] = useState('2025-26');
  const [toSession, setToSession] = useState('2026-27');
  const [selectedPromoteClass, setSelectedPromoteClass] = useState('PP.3+');
  const [searchQuery, setSearchQuery] = useState('');
  const [promoting, setPromoting] = useState(false);

  // All Standard Classes
  const classList = useMemo(() => [
    'PP.3+', 'PP.4+', 'PP.5+',
    'First', 'Second', 'Third', 'Fourth', 'Fifth',
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    'Eleventh', 'Twelfth'
  ], []);

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [targetDate]);

  const fetchStudentsAndAttendance = async () => {
    try {
      setLoading(true);

      // 1. Fetch All Students Data
      const { data: studentsData, error: stError } = await supabase
        .from('students')
        .select('*');

      if (stError) throw stError;
      setStudents(studentsData || []);

      // 2. Fetch Real Daily Attendance for Selected Date
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .or(`attendance_date.eq.${targetDate},date.eq.${targetDate}`);

      if (!attError && attData) {
        const attLookup = {};
        attData.forEach((item) => {
          const stKey = item.student_id || item.sr_no || item.id;
          if (stKey) {
            attLookup[stKey] = item.status;
          }
        });
        setAttendanceMap(attLookup);
      } else {
        setAttendanceMap({});
      }
    } catch (err) {
      console.error('Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if student was Present on targetDate (Strict Check)
  const isStudentPresent = (student) => {
    const dailyStatus = 
      attendanceMap[student.id] || 
      attendanceMap[student.student_id] || 
      attendanceMap[student.sr_no];

    if (dailyStatus !== undefined && dailyStatus !== null) {
      const normalizedStatus = String(dailyStatus).trim().toLowerCase();
      return normalizedStatus === 'present' || normalizedStatus === 'p';
    }

    return false;
  };

  // Exact Age Calculator
  const calculateAge = (dobString, targetDateString) => {
    if (!dobString || !targetDateString) return '-';
    
    const [dYear, dMonth, dDay] = dobString.split('-').map(Number);
    const [tYear, tMonth, tDay] = targetDateString.split('-').map(Number);
    
    if (!dYear || !dMonth || !dDay || !tYear || !tMonth || !tDay) return '-';

    let years = tYear - dYear;
    let months = tMonth - dMonth;
    let days = tDay - dDay;

    if (days < 0) {
      months -= 1;
      const daysInPrevMonth = new Date(tYear, tMonth - 1, 0).getDate();
      days += daysInPrevMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) return 'Invalid DOB';
    return `${years}Y ${months}M ${days}D`;
  };

  // Bulk Class Promotion Handler
  const handleBulkPromotion = async () => {
    try {
      setPromoting(true);
      const { data, error } = await supabase
        .from('students')
        .update({ session: toSession })
        .eq('class_name', selectedPromoteClass)
        .eq('session', fromSession)
        .select();

      if (error) throw error;

      alert(`Safaltapoorvak ${data ? data.length : 0} vidyarthiyon ko ${selectedPromoteClass} (${fromSession}) se (${toSession}) me promote kar diya gaya hai!`);
      fetchStudentsAndAttendance();
    } catch (err) {
      alert('Promotion Error: ' + err.message);
    } finally {
      setPromoting(false);
    }
  };

  // Metric Calculation
  const metrics = useMemo(() => {
    let totalRTE = 0;
    let newRTE = 0;
    let promotedRTE = 0;
    let newGen = 0;

    students.forEach((s) => {
      const isRTE = s.rte_status === 'Yes' || s.getting_free_education?.includes('Yes');
      const isNew = s.admission_type?.includes('New');

      if (isRTE) {
        totalRTE++;
        if (isNew) newRTE++;
        else promotedRTE++;
      } else {
        if (isNew) newGen++;
      }
    });

    return { totalRTE, newRTE, promotedRTE, newGen };
  }, [students]);

  // Table 1: Class-wise Matrix Data
  const classWiseMatrixData = useMemo(() => {
    const reportMap = {};

    classList.forEach((cls) => {
      ['English', 'Hindi'].forEach((med) => {
        const key = `${cls} (${med})`;
        reportMap[key] = {
          className: key,
          totalStrength: 0,
          rteTotal: 0,
          newRTEAdm: 0,
          promotedRTE: 0,
          newGen: 0,
          promotedGen: 0,
          absents: 0,
        };
      });
    });

    students.forEach((s) => {
      const med = s.medium_of_instruction || 'English';
      const key = `${s.class_name} (${med})`;

      if (!reportMap[key]) {
        reportMap[key] = {
          className: key,
          totalStrength: 0,
          rteTotal: 0,
          newRTEAdm: 0,
          promotedRTE: 0,
          newGen: 0,
          promotedGen: 0,
          absents: 0,
        };
      }

      const row = reportMap[key];
      row.totalStrength += 1;

      const isRTE = s.rte_status === 'Yes' || s.getting_free_education?.includes('Yes');
      const isNew = s.admission_type?.includes('New');
      const present = isStudentPresent(s);

      if (!present) row.absents += 1;

      if (isRTE) {
        row.rteTotal += 1;
        if (isNew) row.newRTEAdm += 1;
        else row.promotedRTE += 1;
      } else {
        if (isNew) row.newGen += 1;
        else row.promotedGen += 1;
      }
    });

    return Object.values(reportMap).filter((r) => r.totalStrength > 0);
  }, [students, classList, attendanceMap]);

  const matrixTotals = useMemo(() => {
    return classWiseMatrixData.reduce(
      (acc, row) => {
        acc.totalStrength += row.totalStrength || 0;
        acc.rteTotal += row.rteTotal || 0;
        acc.newRTEAdm += row.newRTEAdm || 0;
        acc.promotedRTE += row.promotedRTE || 0;
        acc.newGen += row.newGen || 0;
        acc.promotedGen += row.promotedGen || 0;
        acc.absents += row.absents || 0;
        return acc;
      },
      { totalStrength: 0, rteTotal: 0, newRTEAdm: 0, promotedRTE: 0, newGen: 0, promotedGen: 0, absents: 0 }
    );
  }, [classWiseMatrixData]);

  // Table 2: Verification Data
  const verificationData = useMemo(() => {
    const reportMap = {};

    classList.forEach((cls) => {
      ['English', 'Hindi'].forEach((med) => {
        const key = `${cls}-${med}`;
        reportMap[key] = {
          class: cls,
          medium: med,
          rteBoys: 0, rteGirls: 0, rteAttBoys: 0, rteAttGirls: 0,
          genBoys: 0, genGirls: 0, genAttBoys: 0, genAttGirls: 0,
          count: 0
        };
      });
    });

    students.forEach((s) => {
      const g = (s.gender || '').toLowerCase();
      const isBoy = g.includes('boy') || g === 'male' || g === 'm';
      const isGirl = g.includes('girl') || g === 'female' || g === 'f';
      const med = s.medium_of_instruction || 'English';
      const key = `${s.class_name}-${med}`;

      if (!reportMap[key]) {
        reportMap[key] = {
          class: s.class_name,
          medium: med,
          rteBoys: 0, rteGirls: 0, rteAttBoys: 0, rteAttGirls: 0,
          genBoys: 0, genGirls: 0, genAttBoys: 0, genAttGirls: 0,
          count: 0
        };
      }

      const row = reportMap[key];
      row.count++;

      const isRTE = s.rte_status === 'Yes' || s.getting_free_education?.includes('Yes');
      const present = isStudentPresent(s);

      if (isRTE) {
        if (isBoy) {
          row.rteBoys++;
          if (present) row.rteAttBoys++;
        } else if (isGirl) {
          row.rteGirls++;
          if (present) row.rteAttGirls++;
        }
      } else {
        if (isBoy) {
          row.genBoys++;
          if (present) row.genAttBoys++;
        } else if (isGirl) {
          row.genGirls++;
          if (present) row.genAttGirls++;
        }
      }
    });

    return Object.values(reportMap).filter((r) => r.count > 0);
  }, [students, classList, attendanceMap]);

  const verificationTotals = useMemo(() => {
    return verificationData.reduce(
      (acc, row) => {
        acc.rteBoys += row.rteBoys || 0;
        acc.rteGirls += row.rteGirls || 0;
        acc.rteAttBoys += row.rteAttBoys || 0;
        acc.rteAttGirls += row.rteAttGirls || 0;
        acc.genBoys += row.genBoys || 0;
        acc.genGirls += row.genGirls || 0;
        acc.genAttBoys += row.genAttBoys || 0;
        acc.genAttGirls += row.genAttGirls || 0;
        return acc;
      },
      { rteBoys: 0, rteGirls: 0, rteAttBoys: 0, rteAttGirls: 0, genBoys: 0, genGirls: 0, genAttBoys: 0, genAttGirls: 0 }
    );
  }, [verificationData]);

  // Filter & Sort Students
  const sortedFilteredStudents = useMemo(() => {
    let list = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (st) =>
          (st.student_full_name || '').toLowerCase().includes(q) ||
          (st.sr_no || '').toLowerCase().includes(q) ||
          (st.class_name || '').toLowerCase().includes(q) ||
          (st.mobile_number || '').includes(q)
      );
    }

    return list.sort((a, b) => {
      const indexA = classList.indexOf(a.class_name);
      const indexB = classList.indexOf(b.class_name);
      
      const orderA = indexA !== -1 ? indexA : 999;
      const orderB = indexB !== -1 ? indexB : 999;

      if (orderA !== orderB) return orderA - orderB;

      const nameA = (a.student_full_name || '').trim();
      const nameB = (b.student_full_name || '').trim();
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }, [students, searchQuery, classList]);

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col min-h-screen">
      
      {/* Dynamic Print CSS */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #official-print-report, #official-print-report * { visibility: visible; }
          #official-print-report {
            position: absolute; left: 0; top: 0; width: 100%;
            margin: 0; padding: 0; border: none !important; box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header with Calendar Picker Controls */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-sky-800 tracking-wide">
            Student Analytics, RTE Directory & Session Promotion
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-medium">
            Supabase Live Data Integration | Real Daily Attendance & Verification Matrix
          </p>
        </div>

        {/* Date Selector with Calendar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm">
            <span className="text-[13px] font-bold text-slate-700">🗓️ Select Date:</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-slate-50 text-slate-800 text-[14px] px-3 py-1 rounded-lg border border-slate-300 outline-none focus:border-sky-500 font-medium cursor-pointer"
            />
            <button
              onClick={() => setTargetDate(getTodayDate())}
              className="text-[11px] bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold px-2 py-1 rounded-md transition"
              title="Reset to today date"
            >
              Today
            </button>
          </div>

          <button
            onClick={fetchStudentsAndAttendance}
            className="bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-b-4 border-slate-400 text-slate-700 font-bold px-4 py-2 rounded-xl text-[13px] active:border-b-0 active:translate-y-1 transition-all shadow-sm cursor-pointer"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl font-bold text-slate-500 shadow-sm">
          Selected date ({targetDate}) ka Live Data load ho raha hai...
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 border-l-4 border-l-sky-600 p-5 rounded-xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">TOTAL RTE STUDENTS</span>
              <div className="text-[28px] font-black text-sky-700">{metrics.totalRTE}</div>
            </div>
            <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 p-5 rounded-xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">NEW RTE ADMISSIONS</span>
              <div className="text-[28px] font-black text-emerald-600">{metrics.newRTE}</div>
            </div>
            <div className="bg-white border border-slate-200 border-l-4 border-l-cyan-600 p-5 rounded-xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">PROMOTED RTE STUDENTS</span>
              <div className="text-[28px] font-black text-cyan-600">{metrics.promotedRTE}</div>
            </div>
            <div className="bg-white border border-slate-200 border-l-4 border-l-amber-600 p-5 rounded-xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">NEW NON-RTE ADMISSIONS</span>
              <div className="text-[28px] font-black text-amber-600">{metrics.newGen}</div>
            </div>
          </div>

          {/* Bulk Class Promotion Manager */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <span className="text-sky-600 text-lg">🔄</span>
              <h3 className="text-[15px] font-bold text-slate-800 tracking-wide">
                Bulk Class Promotion (सेशन प्रमोशन मैनेजर)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">From Session:</label>
                <select
                  value={fromSession}
                  onChange={(e) => setFromSession(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">To Session:</label>
                <select
                  value={toSession}
                  onChange={(e) => setToSession(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
                >
                  <option value="2026-27">2026-27</option>
                  <option value="2027-28">2027-28</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Select Class:</label>
                <select
                  value={selectedPromoteClass}
                  onChange={(e) => setSelectedPromoteClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  disabled={promoting}
                  onClick={handleBulkPromotion}
                  className="w-full bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl px-5 py-2.5 text-[14px] border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📌</span> {promoting ? 'Promoting...' : 'Promote Class Students'}
                </button>
              </div>
            </div>
          </div>

          {/* TABLE 1: CLASS-WISE RTE & ADMISSION STATISTICS */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-[15px] font-bold text-slate-800 tracking-wide">
                Class-wise RTE & Admission Statistics Matrix
              </h3>
              <span className="text-[12px] bg-slate-100 px-3 py-1 rounded-md font-bold text-slate-600">
                Date: {targetDate}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-3.5">Class</th>
                    <th className="p-3.5 text-center">Total Strength</th>
                    <th className="p-3.5 text-center">RTE Total</th>
                    <th className="p-3.5 text-center">New RTE Adm.</th>
                    <th className="p-3.5 text-center">Promoted RTE</th>
                    <th className="p-3.5 text-center">New Non-RTE / Gen</th>
                    <th className="p-3.5 text-center">Promoted Non-RTE</th>
                    <th className="p-3.5 text-center">Absents (Date: {targetDate})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {classWiseMatrixData.length > 0 ? (
                    classWiseMatrixData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900">{row.className}</td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{row.totalStrength}</td>
                        <td className="p-3.5 text-center font-bold text-amber-600">{row.rteTotal}</td>
                        <td className="p-3.5 text-center font-bold text-emerald-600">{row.newRTEAdm}</td>
                        <td className="p-3.5 text-center font-bold text-cyan-600">{row.promotedRTE}</td>
                        <td className="p-3.5 text-center text-slate-700">{row.newGen}</td>
                        <td className="p-3.5 text-center text-slate-700">{row.promotedGen}</td>
                        <td className="p-3.5 text-center font-bold text-rose-600">{row.absents} Absent</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400 font-medium">
                        Koi data nahi mila.
                      </td>
                    </tr>
                  )}
                </tbody>
                {classWiseMatrixData.length > 0 && (
                  <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td className="p-3.5 font-black text-slate-900">Total (कुल योग)</td>
                      <td className="p-3.5 text-center font-black text-slate-900">{matrixTotals.totalStrength}</td>
                      <td className="p-3.5 text-center font-black text-amber-700">{matrixTotals.rteTotal}</td>
                      <td className="p-3.5 text-center font-black text-emerald-700">{matrixTotals.newRTEAdm}</td>
                      <td className="p-3.5 text-center font-black text-cyan-700">{matrixTotals.promotedRTE}</td>
                      <td className="p-3.5 text-center font-black text-slate-800">{matrixTotals.newGen}</td>
                      <td className="p-3.5 text-center font-black text-slate-800">{matrixTotals.promotedGen}</td>
                      <td className="p-3.5 text-center font-black text-rose-700">{matrixTotals.absents} Absent</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* TABLE 2: OFFICIAL VERIFICATION REPORT */}
          <div
            id="official-print-report"
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 print:border-none print:p-0 print:shadow-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 print:border-black">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 tracking-wide print:text-black">
                  सत्यापन के दिन 25% निःशुल्क एवं 75% सशुल्क शिक्षा प्राप्त कर रहे कक्षावार बालकों की वास्तविक उपस्थिति विवरण
                </h3>
                <p className="text-[13px] text-slate-600 mt-1 font-medium print:text-slate-800">
                  सत्यापन दिनांक: <span className="font-bold">{targetDate}</span> | Daily Real Attendance Sync Active
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="no-print bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-[14px] border-b-4 border-sky-800 active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-2"
              >
                🖨️ Print Official Report
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm print:border-black print:rounded-none">
              <table className="w-full text-center text-[13px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 print:bg-slate-200 print:text-black print:border-black">
                    <th className="p-3 border-r border-slate-300 print:border-black" rowSpan={2}>क्र.सं.</th>
                    <th className="p-3 border-r border-slate-300 print:border-black" rowSpan={2}>कक्षा</th>
                    <th className="p-3 border-r border-slate-300 print:border-black" rowSpan={2}>माध्यम</th>
                    <th className="p-3 border-r border-slate-300 print:border-black" colSpan={2}>25% निःशुल्क शिक्षा (RTE)</th>
                    <th className="p-3 border-r border-slate-300 print:border-black" colSpan={2}>उपस्थिति (RTE)</th>
                    <th className="p-3 border-r border-slate-300 print:border-black" colSpan={2}>75% सशुल्क शिक्षा (Non-RTE)</th>
                    <th className="p-3" colSpan={2}>उपस्थिति (Non-RTE)</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 print:bg-slate-100 print:text-black print:border-black">
                    <th className="p-2 border-r border-slate-300 print:border-black">छात्र</th>
                    <th className="p-2 border-r border-slate-300 print:border-black">छात्रा</th>
                    <th className="p-2 border-r border-slate-300 print:border-black">छात्र</th>
                    <th className="p-2 border-r border-slate-300 print:border-black">छात्रा</th>
                    <th className="p-2 border-r border-slate-300 print:border-black">छात्र</th>
                    <th className="p-2 border-r border-slate-300 print:border-black">छात्रा</th>
                    <th className="p-2 border-r border-slate-300 print:border-black">छात्र</th>
                    <th className="p-2">छात्रा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 print:divide-black">
                  {verificationData.length > 0 ? (
                    verificationData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition text-slate-800 print:text-black">
                        <td className="p-3 border-r border-slate-200 print:border-black">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black font-bold">{row.class}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black text-slate-600 font-medium print:text-black">{row.medium}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black">{row.rteBoys}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black">{row.rteGirls}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black text-emerald-600 font-bold print:text-black">{row.rteAttBoys}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black text-emerald-600 font-bold print:text-black">{row.rteAttGirls}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black">{row.genBoys}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black">{row.genGirls}</td>
                        <td className="p-3 border-r border-slate-200 print:border-black text-emerald-600 font-bold print:text-black">{row.genAttBoys}</td>
                        <td className="p-3 text-emerald-600 font-bold print:text-black">{row.genAttGirls}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-6 text-slate-400 font-medium text-center">
                        Koi data nahi mila.
                      </td>
                    </tr>
                  )}
                </tbody>
                {verificationData.length > 0 && (
                  <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 print:bg-slate-200 print:border-black">
                    <tr>
                      <td className="p-3 border-r border-slate-300 print:border-black text-center font-extrabold" colSpan={3}>
                        कुल योग (Grand Total)
                      </td>
                      <td className="p-3 border-r border-slate-300 print:border-black">{verificationTotals.rteBoys}</td>
                      <td className="p-3 border-r border-slate-300 print:border-black">{verificationTotals.rteGirls}</td>
                      <td className="p-3 border-r border-slate-300 print:border-black text-emerald-700 print:text-black">{verificationTotals.rteAttBoys}</td>
                      <td className="p-3 border-r border-slate-300 print:border-black text-emerald-700 print:text-black">{verificationTotals.rteAttGirls}</td>
                      <td className="p-3 border-r border-slate-300 print:border-black">{verificationTotals.genBoys}</td>
                      <td className="p-3 border-r border-slate-300 print:border-black">{verificationTotals.genGirls}</td>
                      <td className="p-3 border-r border-slate-300 print:border-black text-emerald-700 print:text-black">{verificationTotals.genAttBoys}</td>
                      <td className="p-3 text-emerald-700 print:text-black">{verificationTotals.genAttGirls}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* TABLE 3: CLASS-WISE EXACT AGE CALCULATOR */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-[15px] font-bold text-slate-800 tracking-wide">
                  Class-wise Student Exact Age Calculator Matrix
                </h3>
                <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
                  Target Date: <span className="text-sky-700 font-bold">{targetDate}</span>
                </p>
              </div>

              <input
                type="text"
                placeholder="Search student or SR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-[14px] px-4 py-2 rounded-lg outline-none focus:border-sky-500 shadow-sm font-medium w-full sm:w-72"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-[14px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 font-bold">
                    <th className="p-4">Class</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">DOB</th>
                    <th className="p-4">Exact Age (As on Selected Date)</th>
                    <th className="p-4">Father Name</th>
                    <th className="p-4">Mobile Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedFilteredStudents.length > 0 ? (
                    sortedFilteredStudents.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-800">{st.class_name} ({st.medium_of_instruction || 'English'})</td>
                        <td className="p-4">
                          <div className="font-bold uppercase text-slate-800">{st.student_full_name}</div>
                          <div className="text-[12px] text-sky-700 font-bold">SR: {st.sr_no} | ID: {st.student_id}</div>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{st.dob || '-'}</td>
                        <td className="p-4 font-bold text-sky-600">
                          {calculateAge(st.dob, targetDate)}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{st.father_name || '-'}</td>
                        <td className="p-4 font-bold text-slate-700">
                          {st.mobile_number || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500 font-medium">
                        No matching students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}