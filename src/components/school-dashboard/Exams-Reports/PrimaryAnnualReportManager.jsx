'use client';
import React, { useState } from 'react';

export default function PrimaryAnnualReportManager() {
  const [selectedStudent, setSelectedStudent] = useState('DIVYANSHI AGARWAL (PP.3+) - SR: 20260006');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [resultDate, setResultDate] = useState('25/03/2026');
  const [promotedClass, setPromotedClass] = useState('PP.5+');
  const [rollNo, setRollNo] = useState('');
  
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Hindi', fa1: '12', fa2: '13', sa1: '55', fa3: '14', fa4: '12', sa2: '60' },
    { id: 2, name: 'English', fa1: '10', fa2: '12', sa1: '50', fa3: '13', fa4: '11', sa2: '58' },
    { id: 3, name: 'Mathematics', fa1: '14', fa2: '14', sa1: '65', fa3: '15', fa4: '14', sa2: '62' },
  ]);

  const [attendance, setAttendance] = useState({
    totalDays: '220',
    daysPresent: '210',
    dressGrade: 'A',
    behaviourGrade: 'A',
    classTeacherRemarks: 'B+',
    generalRemarks: 'Excellent performance throughout the year.'
  });

  const handleDeleteSubject = (id) => {
    setSubjects(subjects.filter((sub) => sub.id !== id));
  };

  const handleAddSubject = () => {
    const newSub = { id: Date.now(), name: 'New Subject', fa1: '0', fa2: '0', sa1: '0', fa3: '0', fa4: '0', sa2: '0' };
    setSubjects([...subjects, newSub]);
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjects(
      subjects.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub))
    );
  };

  // Calculations for Marksheet
  const totalDaysNum = Number(attendance.totalDays) || 220;
  const daysPresentNum = Number(attendance.daysPresent) || 210;
  const daysAbsentNum = Math.max(0, totalDaysNum - daysPresentNum);

  let grandTotalMax = 0;
  let grandTotalObt = 0;

  const evaluatedSubjects = subjects.map((sub) => {
    const f1 = Number(sub.fa1) || 0;
    const f2 = Number(sub.fa2) || 0;
    const s1 = Number(sub.sa1) || 0;
    const term1Total = f1 + f2 + s1;

    const f3 = Number(sub.fa3) || 0;
    const f4 = Number(sub.fa4) || 0;
    const s2 = Number(sub.sa2) || 0;
    const term2Total = f3 + f4 + s2;

    const subTotalObt = term1Total + term2Total;
    const subMax = 200;

    grandTotalMax += subMax;
    grandTotalObt += subTotalObt;

    const percentage = (subTotalObt / subMax) * 100;
    let grade = 'E';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 45) grade = 'C';
    else if (percentage >= 33) grade = 'D+';

    return { ...sub, term1Total, term2Total, subTotalObt, grade };
  });

  const overallPercentage = grandTotalMax > 0 ? ((grandTotalObt / grandTotalMax) * 100).toFixed(2) : '0.00';

  // --- THEMES ---
  const inputTheme = "w-full bg-[#F4F7F9] border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/15 shadow-inner transition-all duration-200";
  const tableInputTheme = "w-full min-w-[60px] bg-[#F4F7F9] border-2 border-slate-200 rounded-lg px-2 py-2 text-center font-bold text-slate-800 outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/15 shadow-inner transition-all duration-200";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans space-y-6">
      
      {/* Strict Print CSS to Fix Extra Blank Page Issue */}
      <style jsx global>{`
        @media print {
          body, html {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-marksheet-wrapper, .printable-marksheet-wrapper * {
            visibility: visible !important;
          }
          .printable-marksheet-wrapper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            background-color: white !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            📋 Primary Annual Report Manager <span className="text-sm font-bold text-slate-400 normal-case bg-slate-100 px-2 py-1 rounded-lg ml-2">(Classes PP.3+ to 4th)</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Select a student to manage report data or print professional A4 marksheets.</p>
        </div>
        <button className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-5 py-3.5 rounded-2xl shadow-[0_6px_0_#047857] active:translate-y-[6px] transition-all flex items-center gap-2 text-sm uppercase tracking-wider w-full md:w-auto justify-center">
          📥 Download All Primary Reports
        </button>
      </div>

      {/* Selectors Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Student (PP.3+ to 4th):</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className={inputTheme}
          >
            <option>DIVYANSHI AGARWAL (PP.3+) - SR: 20260006</option>
            <option>ARAV SHARMA (PP.3+) - SR: 20260007</option>
            <option>ANANYA VERMA (PP.4+) - SR: 20260008</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Academic Year (Active Session):</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className={inputTheme}
          >
            <option>2026-2027</option>
            <option>2025-2026</option>
            <option>2024-2025</option>
          </select>
        </div>
      </div>

      {/* Student Details Card */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-[15px] font-black uppercase tracking-wider text-indigo-600 mb-5 flex items-center gap-2">
          🧑‍🎓 Student: <span className="text-slate-800">DIVYANSHI AGARWAL (PP.3+)</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-sm mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">Father's Name</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">RAHUL AGARWAL</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">Mother's Name</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">PRIYANKA GUPTA</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">D.O.B</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">12/02/2023</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">S.R. No.</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">20260006</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Roll No.</span>
            <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="Enter Roll No" className={`${inputTheme} py-2`} />
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Promoted To Class</span>
            <input
              type="text"
              value={promotedClass}
              onChange={(e) => setPromotedClass(e.target.value)}
              className={`${inputTheme} py-2 text-indigo-600`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Result Date:</label>
            <input
              type="text"
              value={resultDate}
              onChange={(e) => setResultDate(e.target.value)}
              className={inputTheme}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Upload School Logo (Professional Fit):</label>
            <div className="flex items-center">
              <input 
                type="file" 
                className="w-full bg-[#F4F7F9] border-2 border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#4F46E5] file:text-white hover:file:bg-[#4338CA] file:cursor-pointer outline-none" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Term-I & Term-II Marks Entry */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-2 border-slate-100 pb-5">
          <h2 className="text-[15px] font-black uppercase tracking-wider text-indigo-600">Term-I & Term-II Marks Entry</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleAddSubject}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_4px_0_#3730A3] active:translate-y-[4px] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              + Add Subject
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider">
                <th className="p-4 rounded-tl-2xl border-b-2 border-slate-200" rowSpan="2">Subject Name</th>
                <th className="p-4 text-center border-l-2 border-b-2 border-slate-200" colSpan="3">Term - I</th>
                <th className="p-4 text-center border-l-2 border-b-2 border-slate-200" colSpan="3">Term - II</th>
                <th className="p-4 text-center rounded-tr-2xl border-l-2 border-b-2 border-slate-200" rowSpan="2">Action</th>
              </tr>
              <tr className="bg-slate-50 text-indigo-700 text-[11px] font-black uppercase border-b-2 border-slate-200">
                <th className="p-3 text-center border-l-2 border-slate-200">F.A.1 (15)</th>
                <th className="p-3 text-center">F.A.2 (15)</th>
                <th className="p-3 text-center">S.A.1 (70)</th>
                <th className="p-3 text-center border-l-2 border-slate-200">F.A.3 (15)</th>
                <th className="p-3 text-center">F.A.4 (15)</th>
                <th className="p-3 text-center">S.A.2 (70)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <input type="text" value={sub.name} onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)} className={`${tableInputTheme} text-left px-3`} />
                  </td>
                  <td className="p-3 text-center border-l-2 border-slate-100">
                    <input type="text" value={sub.fa1} onChange={(e) => handleSubjectChange(sub.id, 'fa1', e.target.value)} className={tableInputTheme} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="text" value={sub.fa2} onChange={(e) => handleSubjectChange(sub.id, 'fa2', e.target.value)} className={tableInputTheme} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="text" value={sub.sa1} onChange={(e) => handleSubjectChange(sub.id, 'sa1', e.target.value)} className={tableInputTheme} />
                  </td>
                  <td className="p-3 text-center border-l-2 border-slate-100">
                    <input type="text" value={sub.fa3} onChange={(e) => handleSubjectChange(sub.id, 'fa3', e.target.value)} className={tableInputTheme} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="text" value={sub.fa4} onChange={(e) => handleSubjectChange(sub.id, 'fa4', e.target.value)} className={tableInputTheme} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="text" value={sub.sa2} onChange={(e) => handleSubjectChange(sub.id, 'sa2', e.target.value)} className={tableInputTheme} />
                  </td>
                  <td className="p-3 text-center border-l-2 border-slate-100 align-middle">
                    <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider shadow-[0_4px_0_#991B1B] active:translate-y-[4px] transition-all w-full"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance & Performance Details */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-[15px] font-black uppercase tracking-wider text-indigo-600 mb-5">Attendance & Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Days:</label>
            <input
              type="text"
              value={attendance.totalDays}
              onChange={(e) => setAttendance({ ...attendance, totalDays: e.target.value })}
              className={inputTheme}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Days Present:</label>
            <input
              type="text"
              value={attendance.daysPresent}
              onChange={(e) => setAttendance({ ...attendance, daysPresent: e.target.value })}
              className={inputTheme}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Dress Grade:</label>
            <input
              type="text"
              value={attendance.dressGrade}
              onChange={(e) => setAttendance({ ...attendance, dressGrade: e.target.value })}
              className={`${inputTheme} text-center text-indigo-700 text-lg`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Behaviour Grade:</label>
            <input
              type="text"
              value={attendance.behaviourGrade}
              onChange={(e) => setAttendance({ ...attendance, behaviourGrade: e.target.value })}
              className={`${inputTheme} text-center text-indigo-700 text-lg`}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Class Teacher Remarks Grade:</label>
            <input
              type="text"
              value={attendance.classTeacherRemarks}
              onChange={(e) => setAttendance({ ...attendance, classTeacherRemarks: e.target.value })}
              className={inputTheme}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">General Remarks:</label>
            <input
              type="text"
              value={attendance.generalRemarks}
              onChange={(e) => setAttendance({ ...attendance, generalRemarks: e.target.value })}
              className={inputTheme}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-5">
        <button className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black px-10 py-4 rounded-2xl shadow-[0_6px_0_#3730A3] active:translate-y-[6px] transition-all text-[15px] uppercase tracking-wider flex-1">
          💾 Save Report Data
        </button>
        <button 
          onClick={() => window.print()}
          className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-black px-10 py-4 rounded-2xl shadow-[0_6px_0_#047857] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 text-[15px] uppercase tracking-wider flex-1"
        >
          🖨️ Print Annual Report (A4)
        </button>
      </div>

      {/* ======================================================== */}
      {/* PERFECT A4 PRINTABLE MARK SHEET CONTAINER WITH SCHOOL LOGO */}
      {/* ======================================================== */}
      <div className="printable-marksheet-wrapper bg-white text-black p-2 w-[210mm] h-[297mm] mx-auto text-xs font-sans">
        
        {/* Outer Border Box */}
        <div className="border-2 border-black p-2 flex flex-col justify-between h-[293mm]">
          
          <div className="space-y-1.5">
            {/* Header with School Logo */}
            <div className="border-b-2 border-black pb-1.5 flex items-center justify-between">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/school-logo.png" 
                  alt="School Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center flex-1 mx-2">
                <h1 className="text-sm font-black tracking-wider uppercase">BLUE HEAVEN KIDS ACADEMY</h1>
                <p className="text-[9px] font-semibold">Dev Nagar, Benad Road, Jaipur</p>
                <h2 className="text-[9px] font-bold uppercase mt-0.5">ANNUAL REPORT - {academicYear}</h2>
              </div>
              <div className="w-10"></div>
            </div>

            {/* Student Info Table */}
            <div className="border border-black text-[9.5px]">
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-0.5 px-1 border-r border-black font-medium">
                  <span className="font-bold">Name :</span> DIVYANSHI AGARWAL
                </div>
                <div className="p-0.5 px-1 font-medium">
                  <span className="font-bold">Class :</span> PP.3+
                </div>
              </div>
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-0.5 px-1 border-r border-black font-medium">
                  <span className="font-bold">Father's Name :</span> RAHUL AGARWAL
                </div>
                <div className="p-0.5 px-1 font-medium">
                  <span className="font-bold">Roll No. :-</span> {rollNo || 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-0.5 px-1 border-r border-black font-medium">
                  <span className="font-bold">Mother's Name :</span> PRIYANKA GUPTA
                </div>
                <div className="p-0.5 px-1 font-medium">
                  <span className="font-bold">S.R. No. :</span> 20260006
                </div>
              </div>
              <div className="p-0.5 px-1 font-medium">
                <span className="font-bold">Date of Birth :</span> 12/02/2023
              </div>
            </div>

            {/* Marks Scholastic Area Table */}
            <div>
              <table className="w-full border-collapse border border-black text-center text-[9.5px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black">
                    <th className="border-r border-black p-1 font-bold uppercase text-left" rowSpan="2">Scholastic Area</th>
                    <th className="border-r border-black p-0.5" colSpan="4">Term - I</th>
                    <th className="border-r border-black p-0.5" colSpan="4">Term - II</th>
                    <th className="p-0.5" colSpan="2">Grand Total</th>
                    <th className="border-l border-black p-1 font-bold" rowSpan="2">Grade</th>
                  </tr>
                  <tr className="border-b border-black bg-slate-50 font-bold text-[8.5px]">
                    <th className="border-r border-black p-0.5">F.A.1<br/>15</th>
                    <th className="border-r border-black p-0.5">F.A.2<br/>15</th>
                    <th className="border-r border-black p-0.5">S.A.1<br/>70</th>
                    <th className="border-r border-black p-0.5">Obt.<br/>100</th>
                    <th className="border-r border-black p-0.5">F.A.3<br/>15</th>
                    <th className="border-r border-black p-0.5">F.A.4<br/>15</th>
                    <th className="border-r border-black p-0.5">S.A.2<br/>70</th>
                    <th className="border-r border-black p-0.5">Obt.<br/>100</th>
                    <th className="border-r border-black p-0.5">M.M.</th>
                    <th className="border-r border-black p-0.5">Obt.</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluatedSubjects.map((sub, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black p-0.5 px-1 text-left font-semibold">{sub.name}</td>
                      <td className="border-r border-black p-0.5">{sub.fa1}</td>
                      <td className="border-r border-black p-0.5">{sub.fa2}</td>
                      <td className="border-r border-black p-0.5">{sub.sa1}</td>
                      <td className="border-r border-black p-0.5 font-bold">{sub.term1Total}</td>
                      <td className="border-r border-black p-0.5">{sub.fa3}</td>
                      <td className="border-r border-black p-0.5">{sub.fa4}</td>
                      <td className="border-r border-black p-0.5">{sub.sa2}</td>
                      <td className="border-r border-black p-0.5 font-bold">{sub.term2Total}</td>
                      <td className="border-r border-black p-0.5">200</td>
                      <td className="border-r border-black p-0.5 font-bold">{sub.subTotalObt}</td>
                      <td className="border-l border-black p-0.5 font-bold">{sub.grade}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-slate-50">
                    <td className="border-r border-black p-0.5 px-1 text-left">Total</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">-</td>
                    <td className="border-r border-black p-0.5">{grandTotalMax}</td>
                    <td className="border-r border-black p-0.5">{grandTotalObt}</td>
                    <td className="border-l border-black p-0.5">A</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Split Section: Grading Scale & Attendance / Performance */}
            <div className="grid grid-cols-2 gap-2 text-[8.5px]">
              {/* Grading Scale Table */}
              <div className="border border-black">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold">
                      <th className="border-r border-black p-0.5 text-left">Mark</th>
                      <th className="border-r border-black p-0.5 text-center">Grade</th>
                      <th className="p-0.5 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black"><td className="border-r border-black p-0.5">90% & above</td><td className="border-r border-black p-0.5 text-center">A+</td><td className="p-0.5">Genius</td></tr>
                    <tr className="border-b border-black"><td className="border-r border-black p-0.5">80% & above</td><td className="border-r border-black p-0.5 text-center">A</td><td className="p-0.5">Excellent</td></tr>
                    <tr className="border-b border-black"><td className="border-r border-black p-0.5">70% & above</td><td className="border-r border-black p-0.5 text-center">B+</td><td className="p-0.5">Very Good</td></tr>
                    <tr className="border-b border-black"><td className="border-r border-black p-0.5">60% & above</td><td className="border-r border-black p-0.5 text-center">B</td><td className="p-0.5">Good</td></tr>
                    <tr className="border-b border-black"><td className="border-r border-black p-0.5">45% & above</td><td className="border-r border-black p-0.5 text-center">C</td><td className="p-0.5">Average</td></tr>
                    <tr className="border-b border-black"><td className="border-r border-black p-0.5">33% & above</td><td className="border-r border-black p-0.5 text-center">D+</td><td className="p-0.5">Below Average</td></tr>
                    <tr><td className="border-r border-black p-0.5">Less than 33%</td><td className="border-r border-black p-0.5 text-center">E</td><td className="p-0.5">Poor</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Attendance & Performance Table */}
              <div className="border border-black flex flex-col justify-between">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold">
                      <th className="p-0.5 text-center" colSpan="2">ATTENDANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-0.5 font-medium">TOTAL DAYS</td>
                      <td className="p-0.5 text-right font-bold">{totalDaysNum}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-0.5 font-medium">NO. OF DAYS PRESENT</td>
                      <td className="p-0.5 text-right font-bold">{daysPresentNum}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-0.5 font-medium">NO. OF DAYS ABSENT</td>
                      <td className="p-0.5 text-right font-bold">{daysAbsentNum}</td>
                    </tr>
                    <tr className="border-b border-black bg-slate-100 font-bold">
                      <td className="p-0.5 text-center" colSpan="2">PERFORMANCE</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-0.5 font-medium">DRESS</td>
                      <td className="p-0.5 text-right font-bold">{attendance.dressGrade}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-0.5 font-medium">BEHAVIOUR</td>
                      <td className="p-0.5 text-right font-bold">{attendance.behaviourGrade}</td>
                    </tr>
                    <tr>
                      <td className="border-r border-black p-0.5 font-medium">CLASS TEACHER REMARKS</td>
                      <td className="p-0.5 text-right font-bold">{attendance.classTeacherRemarks}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks, Result & Percentage Bar */}
            <div className="border border-black text-[9.5px]">
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-0.5 px-1 border-r border-black font-medium">
                  <span className="font-bold">Remarks :</span> {attendance.generalRemarks}
                </div>
                <div className="p-0.5 px-1 font-medium">
                  <span className="font-bold">Rank in class :-</span> 
                </div>
              </div>
              <div className="grid grid-cols-2 font-medium">
                <div className="p-0.5 px-1 border-r border-black">
                  <span className="font-bold text-indigo-700">Result :</span> Pass & Promoted: <span className="font-bold text-indigo-700">{promotedClass}</span>
                </div>
                <div className="p-0.5 px-1">
                  <span className="font-bold">Percentage :</span> {overallPercentage} %
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Date of Declaration Placed Immediately After Percentage */}
          <div className="pt-2 border-t border-black mt-1">
            <div className="flex justify-between items-center text-[9px] font-bold mb-4 px-2">
              <div>Date of Declaration: {resultDate}</div>
            </div>
            <div className="grid grid-cols-3 text-center text-[9.5px] font-bold pt-1">
              <div>Parents Sign.</div>
              <div>Class Teacher Sign.</div>
              <div>Principal Sign.</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}