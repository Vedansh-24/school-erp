// Filename: StudentAttendanceAndRemarks.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, CheckCircle2, XCircle, Clock, Search, 
  MessageSquare, UserCheck, Filter, FileText, Loader2
} from 'lucide-react';

export default function StudentAttendanceAndRemarks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

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

  // Handle Attendance Status Change & Save to Supabase using Upsert (Prevents Duplicate Key Error)
  const handleStatusChange = async (id, newStatus) => {
    setStudents((prev) =>
      prev.map((std) => (std.id === id ? { ...std, attendance: newStatus } : std))
    );

    const student = students.find((s) => s.id === id);
    if (!student) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(
          [
            {
              student_id: student.id,
              sr_no: student.rollNo,
              attendance_date: selectedDate,
              date: selectedDate,
              status: newStatus,
              class_name: student.class,
              session: '2026-2027',
              remarks: student.remark
            }
          ],
          { onConflict: ['student_id', 'attendance_date'] }
        )
        .select();

      if (error) throw error;
      if (data && data[0]) {
        student.attendanceId = data[0].id;
      }
    } catch (error) {
      console.error('Error saving attendance status:', error.message);
    }
  };

  // Handle Remark Update & Save to Supabase using Upsert
  const handleRemarkChange = async (id, newRemark) => {
    setStudents((prev) =>
      prev.map((std) => (std.id === id ? { ...std, remark: newRemark } : std))
    );

    const student = students.find((s) => s.id === id);
    if (!student) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(
          [
            {
              student_id: student.id,
              sr_no: student.rollNo,
              attendance_date: selectedDate,
              date: selectedDate,
              status: student.attendance,
              class_name: student.class,
              session: '2026-2027',
              remarks: newRemark
            }
          ],
          { onConflict: ['student_id', 'attendance_date'] }
        )
        .select();

      if (error) throw error;
      if (data && data[0]) {
        student.attendanceId = data[0].id;
      }
    } catch (error) {
      console.error('Error saving remark:', error.message);
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
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Top Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Strength */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-5 rounded-2xl shadow-lg flex items-center justify-between text-white border border-indigo-400/30">
          <div>
            <p className="text-xs font-black uppercase text-indigo-100 tracking-wider">Total Strength</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalStudents}</h3>
            <p className="text-xs font-semibold text-indigo-100/80 mt-1">Enrolled students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <UserCheck size={24} />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 p-5 rounded-2xl shadow-lg flex items-center justify-between text-white border border-emerald-400/30">
          <div>
            <p className="text-xs font-black uppercase text-emerald-100 tracking-wider">Present Today</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalPresent}</h3>
            <p className="text-xs font-semibold text-emerald-100/80 mt-1">Marked present</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-800 p-5 rounded-2xl shadow-lg flex items-center justify-between text-white border border-rose-400/30">
          <div>
            <p className="text-xs font-black uppercase text-rose-100 tracking-wider">Absent Today</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalAbsent}</h3>
            <p className="text-xs font-semibold text-rose-100/80 mt-1">Requires notification</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <XCircle size={24} />
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 p-5 rounded-2xl shadow-lg flex items-center justify-between text-white border border-amber-400/30">
          <div>
            <p className="text-xs font-black uppercase text-amber-100 tracking-wider">Late Arrivals</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalLate}</h3>
            <p className="text-xs font-semibold text-amber-100/80 mt-1">Arrived past schedule</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <Clock size={24} />
          </div>
        </div>

      </div>

      {/* Controls & Class Filter Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#2F6690] text-white flex items-center justify-center shadow">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Daily Attendance & Remarks</h3>
            <p className="text-xs font-semibold text-slate-500">Select class and record student attendance</p>
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
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

        </div>
      </div>

      {/* Daily Attendance Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-5">Roll & Student</th>
                <th className="py-3 px-5">Class</th>
                <th className="py-3 px-5 text-center">Attendance Status</th>
                <th className="py-3 px-5">Teacher Remarks / Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-indigo-600" size={24} />
                      Loading student attendance records...
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-xs border border-indigo-100">
                          {student.rollNo}
                        </span>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{student.name}</p>
                          <p className="text-[11px] text-slate-400">ID: STU-{student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-black border border-slate-200">
                        {student.class}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      {/* 3D Container with Buttons having 3D Gradients and Dabne Wala Effect */}
                      <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1">
                        
                        {/* Present Button */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            student.attendance === 'Late' 
                              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white border-t border-amber-200 border-b-[3px] border-amber-950 shadow-md active:translate-y-0.5 active:border-b-[1px] active:shadow-none' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                          }`}
                        >
                          Late
                        </button>

                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={student.remark}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          placeholder="Type student remark or observation..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <MessageSquare size={14} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-bold">
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