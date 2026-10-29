// File name: progress report working_6.txt
'use client';
import React, { useState, useEffect } from 'react';
// Yahan local createClient hata kar apni global file se import karein:
import { supabase } from '@/lib/supabase';

export default function ProgressReportMarkSheetManager() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [examSession, setExamSession] = useState('2026-2027');
  const [schoolLogo, setSchoolLogo] = useState('/school-logo.png');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [subjectsData, setSubjectsData] = useState([
    { id: 1, name: 'HINDI', test1: '0', test2: '0', test3: '0', halfYearly: '0', yearly: '0' },
    { id: 2, name: 'ENGLISH', test1: '0', test2: '0', test3: '0', halfYearly: '0', yearly: '0' },
    { id: 3, name: 'SCIENCE', test1: '0', test2: '0', test3: '0', halfYearly: '0', yearly: '0' },
    { id: 4, name: 'SOCIAL SCIENCE', test1: '0', test2: '0', test3: '0', halfYearly: '0', yearly: '0' },
    { id: 5, name: 'MATHS', test1: '0', test2: '0', test3: '0', halfYearly: '0', yearly: '0' },
  ]);

  const [attendance, setAttendance] = useState({
    totalWorkingDays: '17',
    totalPresentDays: '16',
    resultDate: '31/03/2027',
    artEdu: 'A',
    infoTech: 'A',
    healthPhy: 'A',
    rollNo: '-',
    faculty: 'GENERAL',
    section: 'A',
    promotedClass: 'Sixth',
    division: 'Passed',
  });

  // 1. Fetch Original Students from Supabase on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStudents(data);
        setSelectedStudentId(data[0].id);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students from Supabase:', err);
      alert('Students data load karne me error aayi hai. Supabase connection check karein.');
    } finally {
      setLoading(false);
    }
  };

  // Current selected student object from database
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0] || {
    student_id: '',
    student_full_name: 'Select Student',
    class_name: '',
    father_name: '',
    mother_name: '',
    dob: ''
  };

  const handleDeleteSubject = (id) => {
    setSubjectsData(subjectsData.filter((sub) => sub.id !== id));
  };

  const handleAddSubject = () => {
    const newSub = { id: Date.now(), name: 'NEW SUBJECT', test1: '0', test2: '0', test3: '0', halfYearly: '0', yearly: '0' };
    setSubjectsData([...subjectsData, newSub]);
  };

  // Calculations for totals & percentage
  const calculatedSubjects = subjectsData.map((sub) => {
    const t1 = parseFloat(sub.test1) || 0;
    const t2 = parseFloat(sub.test2) || 0;
    const t3 = parseFloat(sub.test3) || 0;
    const testTotal = t1 + t2 + t3; // Max 30
    const hy = parseFloat(sub.halfYearly) || 0;
    const totalHalfYearly = testTotal + hy; // Max 100
    const yr = parseFloat(sub.yearly) || 0;
    const totalMarks = totalHalfYearly + yr; // Max 200

    return {
      ...sub,
      testTotal,
      totalHalfYearly,
      totalMarks,
    };
  });

  const grandTest1 = calculatedSubjects.reduce((acc, curr) => acc + (parseFloat(curr.test1) || 0), 0);
  const grandTest2 = calculatedSubjects.reduce((acc, curr) => acc + (parseFloat(curr.test2) || 0), 0);
  const grandTest3 = calculatedSubjects.reduce((acc, curr) => acc + (parseFloat(curr.test3) || 0), 0);
  const grandTestTotal = calculatedSubjects.reduce((acc, curr) => acc + curr.testTotal, 0);
  const grandHalfYearly = calculatedSubjects.reduce((acc, curr) => acc + (parseFloat(curr.halfYearly) || 0), 0);
  const grandTotalHalfYearly = calculatedSubjects.reduce((acc, curr) => acc + curr.totalHalfYearly, 0);
  const grandYearly = calculatedSubjects.reduce((acc, curr) => acc + (parseFloat(curr.yearly) || 0), 0);
  const grandTotalMarks = calculatedSubjects.reduce((acc, curr) => acc + curr.totalMarks, 0);

  const maxTotalMarksPossible = subjectsData.length * 200;
  const percentage = maxTotalMarksPossible > 0 ? ((grandTotalMarks / maxTotalMarksPossible) * 100).toFixed(2) : '0.00';

  // Save marks to Supabase `primary_annual_reports` table
  const handleSaveMarks = async () => {
    try {
      setSaving(true);
      const reportPayload = {
        student_id: currentStudent?.student_id || '',
        roll_no: attendance.rollNo,
        promoted_to_class: attendance.promotedClass,
        result_date: attendance.resultDate,
        school_logo_url: schoolLogo,
        session: examSession,
        behaviour_grade: attendance.artEdu,
        dress_grade: attendance.healthPhy,
        total_days: attendance.totalWorkingDays,
        days_present: attendance.totalPresentDays,
        subjects_data: subjectsData,
      };

      const { error } = await supabase.from('primary_annual_reports').insert([reportPayload]);
      if (error) throw error;

      alert('Marks successfully saved to Supabase database!');
    } catch (err) {
      console.error('Error saving marks:', err);
      alert('Marks save karne me error aayi hai.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- STYLES ---
  const inputTheme = "w-full bg-[#F4F7F9] border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/15 shadow-inner transition-all duration-200";
  const tableInputTheme = "w-full min-w-[60px] bg-[#F4F7F9] border-2 border-slate-200 rounded-lg px-2 py-2 text-center font-bold text-slate-800 outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/15 shadow-inner transition-all duration-200";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans space-y-6">
      
      {/* --- PRINT CSS MEDIA QUERY STYLING --- */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-marksheet, #printable-marksheet * {
            visibility: visible;
          }
          #printable-marksheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 8mm;
            background: white !important;
          }
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-5 no-print">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            📊 Progress Report Marksheet <span className="text-sm font-bold text-slate-400 normal-case bg-slate-100 px-2 py-1 rounded-lg ml-2">(Supabase Live Data)</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Manage original students and print professional A4 Landscape marksheet.</p>
        </div>
      </div>

      {/* Selectors & School Logo Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-7 rounded-3xl shadow-sm border border-slate-200 no-print">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Student (From DB):</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className={inputTheme}
            disabled={loading}
          >
            {students.length === 0 ? (
              <option>No students found in database</option>
            ) : (
              students.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.student_full_name} ({stu.class_name || 'N/A'}) - SR: {stu.student_id}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Exam Session:</label>
          <select
            value={examSession}
            onChange={(e) => setExamSession(e.target.value)}
            className={inputTheme}
          >
            <option>2026-2027</option>
            <option>2025-2026</option>
            <option>2024-2025</option>
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">School Logo Path / URL:</label>
            <div className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-slate-50 overflow-hidden">
              <img 
                src={schoolLogo} 
                alt="Preview" 
                className="max-h-5 max-w-5 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            </div>
          </div>
          <input
            type="text"
            value={schoolLogo}
            onChange={(e) => setSchoolLogo(e.target.value)}
            placeholder="/school-logo.png"
            className={inputTheme}
          />
        </div>
      </div>

      {/* Student Details Card */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 no-print">
        <h2 className="text-[15px] font-black uppercase tracking-wider text-indigo-600 mb-5 flex items-center gap-2">
          🧑‍🎓 Original Student Details: <span className="text-slate-800">{currentStudent?.student_full_name} ({currentStudent?.class_name})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-sm mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">Father's Name</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">{currentStudent?.father_name || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">Mother's Name</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">{currentStudent?.mother_name || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">D.O.B</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">{currentStudent?.dob || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase">S.R. No.</span>
            <span className="font-black text-slate-800 mt-1 block text-[15px]">{currentStudent?.student_id || 'N/A'}</span>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Roll No.</span>
            <input 
              type="text" 
              className={`${inputTheme} py-2`} 
              value={attendance.rollNo}
              onChange={(e) => setAttendance({ ...attendance, rollNo: e.target.value })}
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Faculty</span>
            <input 
              type="text" 
              className={`${inputTheme} py-2`} 
              value={attendance.faculty}
              onChange={(e) => setAttendance({ ...attendance, faculty: e.target.value })}
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Section</span>
            <input 
              type="text" 
              className={`${inputTheme} py-2`} 
              value={attendance.section}
              onChange={(e) => setAttendance({ ...attendance, section: e.target.value })}
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Promoted To Class</span>
            <input 
              type="text" 
              className={`${inputTheme} py-2 text-indigo-700`} 
              value={attendance.promotedClass}
              onChange={(e) => setAttendance({ ...attendance, promotedClass: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Subject Marks Entry */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-2 border-slate-100 pb-5">
          <h2 className="text-[15px] font-black uppercase tracking-wider text-indigo-600">Subject Marks & Optional Subjects Entry</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={handleAddSubject}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_4px_0_#3730A3] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              + Add Subject
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider border-b-2 border-slate-200">
                <th className="p-4 rounded-tl-2xl">Subject Name</th>
                <th className="p-4 text-center">First Test (10)</th>
                <th className="p-4 text-center">Second Test (10)</th>
                <th className="p-4 text-center">Third Test (10)</th>
                <th className="p-4 text-center">Half Yearly TH. (70)</th>
                <th className="p-4 text-center">Yearly TH. (100)</th>
                <th className="p-4 text-center rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectsData.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <input 
                      type="text" 
                      value={sub.name} 
                      onChange={(e) => {
                        const updated = subjectsData.map(s => s.id === sub.id ? {...s, name: e.target.value} : s);
                        setSubjectsData(updated);
                      }} 
                      className={`${tableInputTheme} text-left px-3`} 
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input 
                      type="text" 
                      value={sub.test1} 
                      onChange={(e) => {
                        const updated = subjectsData.map(s => s.id === sub.id ? {...s, test1: e.target.value} : s);
                        setSubjectsData(updated);
                      }} 
                      className={tableInputTheme} 
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input 
                      type="text" 
                      value={sub.test2} 
                      onChange={(e) => {
                        const updated = subjectsData.map(s => s.id === sub.id ? {...s, test2: e.target.value} : s);
                        setSubjectsData(updated);
                      }} 
                      className={tableInputTheme} 
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input 
                      type="text" 
                      value={sub.test3} 
                      onChange={(e) => {
                        const updated = subjectsData.map(s => s.id === sub.id ? {...s, test3: e.target.value} : s);
                        setSubjectsData(updated);
                      }} 
                      className={tableInputTheme} 
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input 
                      type="text" 
                      value={sub.halfYearly} 
                      onChange={(e) => {
                        const updated = subjectsData.map(s => s.id === sub.id ? {...s, halfYearly: e.target.value} : s);
                        setSubjectsData(updated);
                      }} 
                      className={tableInputTheme} 
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input 
                      type="text" 
                      value={sub.yearly} 
                      onChange={(e) => {
                        const updated = subjectsData.map(s => s.id === sub.id ? {...s, yearly: e.target.value} : s);
                        setSubjectsData(updated);
                      }} 
                      className={tableInputTheme} 
                    />
                  </td>
                  <td className="p-3 text-center align-middle">
                     <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all w-full"
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

      {/* Attendance & Co-Scholastic Details Input */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 no-print">
        <h2 className="text-[15px] font-black uppercase tracking-wider text-indigo-600 mb-5">Attendance, Grades & Result Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Working Days:</label>
            <input
              type="text"
              value={attendance.totalWorkingDays}
              onChange={(e) => setAttendance({ ...attendance, totalWorkingDays: e.target.value })}
              className={inputTheme}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Present Days:</label>
            <input
              type="text"
              value={attendance.totalPresentDays}
              onChange={(e) => setAttendance({ ...attendance, totalPresentDays: e.target.value })}
              className={inputTheme}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Result Date:</label>
            <input
              type="text"
              value={attendance.resultDate}
              onChange={(e) => setAttendance({ ...attendance, resultDate: e.target.value })}
              className={inputTheme}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Overall Division / Status:</label>
            <input
              type="text"
              value={attendance.division}
              onChange={(e) => setAttendance({ ...attendance, division: e.target.value })}
              className={inputTheme}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t-2 border-slate-100 pt-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Art Education Grade:</label>
            <input
              type="text"
              value={attendance.artEdu}
              onChange={(e) => setAttendance({ ...attendance, artEdu: e.target.value })}
              className={`${inputTheme} text-center text-indigo-700 text-lg`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Info. Tech & Concept Grade:</label>
            <input
              type="text"
              value={attendance.infoTech}
              onChange={(e) => setAttendance({ ...attendance, infoTech: e.target.value })}
              className={`${inputTheme} text-center text-indigo-700 text-lg`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Health & Phy. Edu. Grade:</label>
            <input
              type="text"
              value={attendance.healthPhy}
              onChange={(e) => setAttendance({ ...attendance, healthPhy: e.target.value })}
              className={`${inputTheme} text-center text-indigo-700 text-lg`}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-5 no-print">
        <button 
          onClick={handleSaveMarks}
          disabled={saving}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black px-10 py-4 rounded-2xl shadow-[0_6px_0_#3730A3] transition-all text-[15px] uppercase tracking-wider flex-1 w-full sm:w-auto text-center"
        >
          {saving ? 'Saving...' : '💾 Save Marks to Database'}
        </button>
        <button 
          onClick={handlePrint}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-black px-10 py-4 rounded-2xl shadow-[0_6px_0_#047857] transition-all flex items-center justify-center gap-2 text-[15px] uppercase tracking-wider flex-1 w-full sm:w-auto"
        >
          🖨️ Print Landscape Marksheet (A4)
        </button>
      </div>

      {/* ========================================================= */}
      {/* EXACT PRINTABLE MARKHEET TEMPLATE (WITH SCHOOL LOGO)     */}
      {/* ========================================================= */}
      <div id="printable-marksheet" className="hidden print:block bg-white text-black p-3 font-sans text-[11px]">
        <div className="border-2 border-black p-3 w-full">
          
          {/* Header Title with Logo */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
            <div className="w-14 h-14 flex items-center justify-center">
              {schoolLogo ? (
                <img 
                  src={schoolLogo} 
                  alt="School Logo" 
                  className="max-h-12 max-w-12 object-contain" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
            </div>
            <div className="text-center flex-1 font-bold uppercase">
              <div className="text-xs font-extrabold tracking-wide">Progress Report</div>
              <div className="text-sm font-black tracking-wider">BLUE HEAVEN KIDS ACADEMY</div>
            </div>
            <div className="w-14"></div>
          </div>

          {/* Student & Session Info Grid */}
          <table className="w-full border-collapse border border-black mb-2 text-[10px]">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 font-bold w-[12%]">Session</td>
                <td className="border border-black px-2 py-1 w-[28%]">{examSession}</td>
                <td className="border border-black px-2 py-1 font-bold w-[10%]">Class</td>
                <td className="border border-black px-2 py-1 w-[15%]">{currentStudent?.class_name || 'N/A'}</td>
                <td className="border border-black px-2 py-1 font-bold w-[10%]">Faculty</td>
                <td className="border border-black px-2 py-1 w-[15%]">{attendance.faculty}</td>
                <td className="border border-black px-2 py-1 font-bold w-[5%]">Section</td>
                <td className="border border-black px-2 py-1 w-[5%] text-center">{attendance.section}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">Student Name</td>
                <td className="border border-black px-2 py-1 uppercase font-bold" colSpan={3}>{currentStudent?.student_full_name}</td>
                <td className="border border-black px-2 py-1 font-bold" colSpan={2}>Roll No.</td>
                <td className="border border-black px-2 py-1 text-center" colSpan={2}>{attendance.rollNo}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">Father's Name</td>
                <td className="border border-black px-2 py-1 uppercase" colSpan={3}>{currentStudent?.father_name}</td>
                <td className="border border-black px-2 py-1 font-bold" colSpan={2}>S.R.No.</td>
                <td className="border border-black px-2 py-1 text-center font-bold" colSpan={2}>{currentStudent?.student_id}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">Mother's Name</td>
                <td className="border border-black px-2 py-1 uppercase" colSpan={3}>{currentStudent?.mother_name}</td>
                <td className="border border-black px-2 py-1 font-bold" colSpan={2}>D.O.B</td>
                <td className="border border-black px-2 py-1 text-center" colSpan={2}>{currentStudent?.dob}</td>
              </tr>
            </tbody>
          </table>

          {/* Marks Table */}
          <table className="w-full border-collapse border border-black text-center mb-2 text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 text-left w-[18%]">Subject</th>
                <th className="border border-black p-1">First Test</th>
                <th className="border border-black p-1">Second Test</th>
                <th className="border border-black p-1">Third Test</th>
                <th className="border border-black p-1">Total</th>
                <th className="border border-black p-1">Half Yearly Exam TH.</th>
                <th className="border border-black p-1">Total Half-Yearly Exam</th>
                <th className="border border-black p-1">Yearly Exam TH.</th>
                <th className="border border-black p-1">Total Marks</th>
                <th className="border border-black p-1">Sub. Result</th>
                <th className="border border-black p-1">Sub. Div.</th>
                <th className="border border-black p-1">Distinction Subject</th>
              </tr>
              <tr className="bg-gray-50 font-bold">
                <td className="border border-black p-1 text-left">Max.Marks-</td>
                <td className="border border-black p-1">10</td>
                <td className="border border-black p-1">10</td>
                <td className="border border-black p-1">10</td>
                <td className="border border-black p-1">30</td>
                <td className="border border-black p-1">70</td>
                <td className="border border-black p-1">100</td>
                <td className="border border-black p-1">100</td>
                <td className="border border-black p-1">200</td>
                <td className="border border-black p-1">-</td>
                <td className="border border-black p-1">-</td>
                <td className="border border-black p-1">-</td>
              </tr>
            </thead>
            <tbody>
              {calculatedSubjects.map((sub) => (
                <tr key={sub.id}>
                  <td className="border border-black p-1 text-left font-bold">{sub.name}</td>
                  <td className="border border-black p-1">{sub.test1}</td>
                  <td className="border border-black p-1">{sub.test2}</td>
                  <td className="border border-black p-1">{sub.test3}</td>
                  <td className="border border-black p-1 font-bold">{sub.testTotal}</td>
                  <td className="border border-black p-1">{sub.halfYearly}</td>
                  <td className="border border-black p-1 font-bold">{sub.totalHalfYearly}</td>
                  <td className="border border-black p-1">{sub.yearly}</td>
                  <td className="border border-black p-1 font-bold">{sub.totalMarks}</td>
                  <td className="border border-black p-1">-</td>
                  <td className="border border-black p-1">-</td>
                  <td className="border border-black p-1">-</td>
                </tr>
              ))}

              {/* Total Marks Obtained Row */}
              <tr className="font-bold bg-gray-50">
                <td className="border border-black p-1 text-left">Total Marks Obtained</td>
                <td className="border border-black p-1">{grandTest1}</td>
                <td className="border border-black p-1">{grandTest2}</td>
                <td className="border border-black p-1">{grandTest3}</td>
                <td className="border border-black p-1">{grandTestTotal}</td>
                <td className="border border-black p-1">{grandHalfYearly}</td>
                <td className="border border-black p-1">{grandTotalHalfYearly}</td>
                <td className="border border-black p-1">{grandYearly}</td>
                <td className="border border-black p-1">{grandTotalMarks}</td>
                <td className="border border-black p-1" colSpan={3} rowSpan={2}>
                  <div className="text-center font-bold text-xs uppercase py-1">Detail Of Exam Result</div>
                  <div className="text-center font-black text-red-600 text-sm">{attendance.division}</div>
                </td>
              </tr>

              {/* Total MAX.Marks Row */}
              <tr className="font-bold bg-gray-50">
                <td className="border border-black p-1 text-left">Total MAX.Marks</td>
                <td className="border border-black p-1">{subjectsData.length * 10}</td>
                <td className="border border-black p-1">{subjectsData.length * 10}</td>
                <td className="border border-black p-1">{subjectsData.length * 10}</td>
                <td className="border border-black p-1">{subjectsData.length * 30}</td>
                <td className="border border-black p-1">{subjectsData.length * 70}</td>
                <td className="border border-black p-1">{subjectsData.length * 100}</td>
                <td className="border border-black p-1">{subjectsData.length * 100}</td>
                <td className="border border-black p-1">{maxTotalMarksPossible}</td>
              </tr>
            </tbody>
          </table>

          {/* Bottom Summary Bar */}
          <table className="w-full border-collapse border border-black mb-6 text-[10px]">
            <tbody>
              <tr>
                <td className="border border-black p-1 font-bold w-[12%]">Percentage (%)</td>
                <td className="border border-black p-1 font-bold w-[18%]">{percentage} %</td>
                <td className="border border-black p-1" colSpan={3}>
                  <span className="font-bold">Art Education:</span> {attendance.artEdu} &nbsp;|&nbsp; 
                  <span className="font-bold">Info. Tech & Concept:</span> {attendance.infoTech} &nbsp;|&nbsp; 
                  <span className="font-bold">Health & Phy.Edu.:</span> {attendance.healthPhy}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-bold">Date Of Result Declaration</td>
                <td className="border border-black p-1">{attendance.resultDate}</td>
                <td className="border border-black p-1 font-bold w-[15%]">Total Meeting: {attendance.totalWorkingDays}</td>
                <td className="border border-black p-1 font-bold w-[18%]">Total Attendance: {attendance.totalPresentDays}</td>
                <td className="border border-black p-1">Division: {attendance.division} | Class Position: -</td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-10 px-4 text-xs font-bold">
            <div className="text-center border-t border-black pt-1 w-[180px]">
              Signature Of The Class Teacher
            </div>
            <div className="text-center border-t border-black pt-1 w-[180px]">
              Signature Of The Exam. Incharge
            </div>
            <div className="text-center border-t border-black pt-1 w-[180px]">
              Signature Of The Head Of The Institution
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}