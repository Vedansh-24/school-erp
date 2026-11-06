// Filename: StudentAttendanceAndRemarks.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, CheckCircle2, XCircle, Clock, Search, 
  MessageSquare, UserCheck, Filter, Loader2, Send 
} from 'lucide-react';

export default function StudentAttendanceAndRemarks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishingStudentId, setPublishingStudentId] = useState(null);
  const [students, setStudents] = useState([]);

  // Editable Hindi Remark Templates
  const remarkTemplates = {
    Present: [
      "प्रिय अभिभावक, [छात्र का नाम] आज स्कूल में उपस्थित है।",
      "[छात्र का नाम] की आज की उपस्थिति दर्ज हो चुकी है और कक्षाएं सुचारू रूप से चल रही हैं।",
      "आपका बच्चा आज स्कूल में बिल्कुल समय पर उपस्थित हुआ है।"
    ],
    Absent: [
      "प्रिय अभिभावक, [छात्र का नाम] आज स्कूल में अनुपस्थित है। कृपया ऐप या पोर्टल में छुट्टी का कारण अपडेट करें।",
      "[छात्र का नाम] आज कक्षाओं में उपस्थित नहीं था/थी। कृपया इस बारे में कक्षा अध्यापक को सूचित करें।",
      "आपके बच्चे की आज की उपस्थिति 'अनुपस्थित' दर्ज की गई है। यदि आपने पहले ही छुट्टी के लिए आवेदन कर दिया था, तो कृपया इस संदेश को अनदेखा करें।"
    ],
    Late: [
      "प्रिय अभिभावक, [छात्र का नाम] आज स्कूल देर से आया/आई है। बच्चे के प्रवेश का समय [समय] था।",
      "[छात्र का नाम] ने आज स्कूल में देर से प्रवेश लिया है। कृपया ध्यान रखें कि कल से बच्चा स्कूल के समय अनुसार ठीक समय पर आए।",
      "आपके बच्चे की आज की उपस्थिति 'देर से' (Late) दर्ज की गई है। लगातार देर से आने पर स्कूल के नियमों के अनुसार आवश्यक कदम उठाए जा सकते हैं।"
    ]
  };

  // Fetch Students & Original Attendance Table Data from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students
      let studentQuery = supabase.from('students').select('*');
      if (selectedClass !== 'All') {
        studentQuery = studentQuery.eq('class_name', selectedClass);
      }
      const { data: studentData, error: studentError } = await studentQuery;
      if (studentError) throw studentError;

      // 2. Fetch Original Attendance Records for Selected Date
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', selectedDate);

      if (attError) throw attError;

      // Merge Students with Original Attendance Table Data
      if (studentData) {
        const merged = studentData.map((st, index) => {
          const attendanceRecord = attData?.find(
            (a) => String(a.student_id) === String(st.id) || String(a.student_id) === String(st.student_id)
          );
          return {
            id: st.id,
            rollNo: st.sr_no || st.student_id || String(index + 1),
            name: st.student_full_name || 'Unknown',
            class: st.class_name || 'Unassigned',
            attendance: attendanceRecord ? attendanceRecord.status : 'Present',
            remark: attendanceRecord?.remarks || '',
            attendanceId: attendanceRecord ? attendanceRecord.id : null,
          };
        });
        setStudents(merged);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedDate]);

  // Handle Attendance Status Change locally
  const handleStatusChange = (id, newStatus) => {
    setStudents((prev) =>
      prev.map((std) => (std.id === id ? { ...std, attendance: newStatus } : std))
    );
  };

  // Handle Remark Update locally
  const handleRemarkChange = (id, newRemark) => {
    setStudents((prev) =>
      prev.map((std) => (std.id === id ? { ...std, remark: newRemark } : std))
    );
  };

  // Select Quick Template with Dynamic Name Insertion
  const handleSelectTemplate = (id, studentName, templateStr) => {
    if (!templateStr) return;
    const formattedText = templateStr.replace(/\[छात्र का नाम\]/g, studentName);
    handleRemarkChange(id, formattedText);
  };

  // Publish Single Student Attendance & Remark
  const handlePublishSingle = async (student) => {
    setPublishingStudentId(student.id);
    try {
      const recordToUpsert = {
        student_id: student.id,
        sr_no: student.rollNo,
        attendance_date: selectedDate,
        date: selectedDate,
        status: student.attendance,
        class_name: student.class,
        session: '2026-2027',
        remarks: student.remark
      };

      const { error } = await supabase
        .from('attendance')
        .upsert([recordToUpsert], { onConflict: ['student_id', 'attendance_date'] });

      if (error) throw error;
      alert(`Attendance & remark published successfully for ${student.name}! 🚀`);
      fetchData();
    } catch (error) {
      console.error('Error publishing single attendance:', error.message);
      alert('Error publishing: ' + error.message);
    } finally {
      setPublishingStudentId(null);
    }
  };

  // Publish All Attendance to Supabase
  const handlePublishAttendance = async () => {
    setPublishing(true);
    try {
      const recordsToUpsert = students.map((student) => ({
        student_id: student.id,
        sr_no: student.rollNo,
        attendance_date: selectedDate,
        date: selectedDate,
        status: student.attendance,
        class_name: student.class,
        session: '2026-2027',
        remarks: student.remark
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(recordsToUpsert, { onConflict: ['student_id', 'attendance_date'] });

      if (error) throw error;
      alert('All attendance records published and saved successfully! 🚀');
      fetchData();
    } catch (error) {
      console.error('Error publishing attendance:', error.message);
      alert('Error publishing attendance: ' + error.message);
    } finally {
      setPublishing(false);
    }
  };

  // Class & Search Filter Logic
  const filteredStudents = students.filter((std) => {
    const matchesSearch = std.name.toLowerCase().includes(searchQuery.toLowerCase()) || std.rollNo.includes(searchQuery);
    const matchesClass = selectedClass === 'All' || std.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Calculations for Summary Cards
  const totalStudents = filteredStudents.length;
  const totalPresent = filteredStudents.filter((s) => s.attendance === 'Present').length;
  const totalAbsent = filteredStudents.filter((s) => s.attendance === 'Absent').length;
  const totalLate = filteredStudents.filter((s) => s.attendance === 'Late').length;

  const classOptions = [
    'PP.3+', 'PP.4+', 'PP.5+', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh(Arts)', 
    'Eleventh(Commerce)', 'Eleventh(Science)', 'Twelfth(Arts)', 'Twelfth(Commerce)', 'Twelfth(Science)'
  ];

  return (
    <div className="space-y-6 p-2 animate-in fade-in zoom-in duration-300">
      
      {/* Top Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Strength */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-6 rounded-2xl shadow-lg flex items-center justify-between text-white border border-indigo-400/30">
          <div>
            <p className="text-xs font-black uppercase text-indigo-100 tracking-wider">Total Strength</p>
            <h3 className="text-3xl font-black text-white mt-1.5">{totalStudents}</h3>
            <p className="text-xs font-semibold text-indigo-100/80 mt-1">Enrolled students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <UserCheck size={24} />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 p-6 rounded-2xl shadow-lg flex items-center justify-between text-white border border-emerald-400/30">
          <div>
            <p className="text-xs font-black uppercase text-emerald-100 tracking-wider">Present Today</p>
            <h3 className="text-3xl font-black text-white mt-1.5">{totalPresent}</h3>
            <p className="text-xs font-semibold text-emerald-100/80 mt-1">Marked present</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-800 p-6 rounded-2xl shadow-lg flex items-center justify-between text-white border border-rose-400/30">
          <div>
            <p className="text-xs font-black uppercase text-rose-100 tracking-wider">Absent Today</p>
            <h3 className="text-3xl font-black text-white mt-1.5">{totalAbsent}</h3>
            <p className="text-xs font-semibold text-rose-100/80 mt-1">Requires notification</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <XCircle size={24} />
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 p-6 rounded-2xl shadow-lg flex items-center justify-between text-white border border-amber-400/30">
          <div>
            <p className="text-xs font-black uppercase text-amber-100 tracking-wider">Late Arrivals</p>
            <h3 className="text-3xl font-black text-white mt-1.5">{totalLate}</h3>
            <p className="text-xs font-semibold text-amber-100/80 mt-1">Arrived past schedule</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <Clock size={24} />
          </div>
        </div>

      </div>

      {/* Controls & Class Filter Section with Publish Button */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#2F6690] text-white flex items-center justify-center shadow">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Daily Attendance & Remarks</h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Select class, record attendance and publish records</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Class Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-indigo-500 cursor-pointer appearance-none shadow-sm"
            >
              <option value="All">All Classes</option>
              {classOptions.map((cls, index) => (
                <option key={index} value={cls}>{cls}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
          </div>

          {/* Date Picker */}
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
          />

          {/* Search Bar */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          {/* Publish All Button */}
          <button
            onClick={handlePublishAttendance}
            disabled={publishing}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all border-t border-emerald-400/40 border-b-4 border-emerald-950 active:translate-y-0.5 active:border-b-[1px]"
          >
            {publishing ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            <span>Publish All</span>
          </button>

        </div>
      </div>

      {/* Daily Attendance Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-3 text-center w-16">Roll No</th>
                <th className="py-4 px-5 min-w-[180px]">Student Name</th>
                <th className="py-4 px-4 text-center w-28">Class</th>
                <th className="py-4 px-3 text-center w-32">Attendance Date</th>
                <th className="py-4 px-5 text-center min-w-[240px]">Attendance Status</th>
                <th className="py-4 px-5 min-w-[340px]">Teacher Remarks / Feedback</th>
                <th className="py-4 px-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-indigo-600" size={24} />
                      Loading student attendance records...
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Roll No Column */}
                    <td className="py-4 px-3 text-center">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black inline-flex items-center justify-center text-xs border border-indigo-100 shadow-sm">
                        {student.rollNo}
                      </span>
                    </td>

                    {/* Student Name Column */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-sm leading-tight">{student.name}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">ID: STU-{student.id}</span>
                      </div>
                    </td>

                    {/* Class Column */}
                    <td className="py-4 px-4 text-center font-bold text-slate-600">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-black border border-slate-200 inline-block">
                        {student.class}
                      </span>
                    </td>

                    {/* Attendance Date Column */}
                    <td className="py-4 px-3 text-center font-bold text-slate-600 whitespace-nowrap">
                      {selectedDate}
                    </td>

                    {/* Attendance Status Buttons Column */}
                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shadow-inner">
                        
                        {/* Present Button */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            student.attendance === 'Present' 
                              ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white border-t border-emerald-300 border-b-[3px] border-emerald-950 shadow-md active:translate-y-0.5 active:border-b-[1px] active:shadow-none' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                          }`}
                        >
                          Present
                        </button>

                        {/* Absent Button */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'Absent')}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            student.attendance === 'Absent' 
                              ? 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 text-white border-t border-rose-300 border-b-[3px] border-rose-950 shadow-md active:translate-y-0.5 active:border-b-[1px] active:shadow-none' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                          }`}
                        >
                          Absent
                        </button>

                        {/* Late Button */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'Late')}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            student.attendance === 'Late' 
                              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white border-t border-amber-200 border-b-[3px] border-amber-950 shadow-md active:translate-y-0.5 active:border-b-[1px] active:shadow-none' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                          }`}
                        >
                          Late
                        </button>

                      </div>
                    </td>

                    {/* Teacher Remarks / Feedback Column */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-2">
                        
                        {/* Quick Remark Template Selector Dropdown */}
                        <div className="flex items-center gap-1.5">
                          <select
                            onChange={(e) => handleSelectTemplate(student.id, student.name, e.target.value)}
                            defaultValue=""
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer outline-none transition-colors shadow-sm"
                            title="Select quick remark template"
                          >
                            <option value="" disabled>⚡ Choose Hindi Remark Template</option>
                            {(remarkTemplates[student.attendance] || []).map((tmpl, idx) => (
                              <option key={idx} value={tmpl}>
                                Template {idx + 1}: {tmpl.replace(/\[छात्र का नाम\]/g, student.name).substring(0, 35)}...
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Directly Editable Remark Text Input */}
                        <div className="relative w-full">
                          <textarea 
                            rows="2"
                            value={student.remark}
                            onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                            placeholder="Type or select remark template..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm resize-none"
                          />
                          <span className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                            <MessageSquare size={14} />
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* Individual Publish Action Column */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handlePublishSingle(student)}
                        disabled={publishingStudentId === student.id}
                        className="bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white px-3 py-2 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-all border-t border-indigo-400/40 border-b-2 border-indigo-950 active:translate-y-0.5"
                        title="Publish this student's attendance & remark"
                      >
                        {publishingStudentId === student.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Send size={13} />
                        )}
                        <span>Save</span>
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    No students found matching your selected class or search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}