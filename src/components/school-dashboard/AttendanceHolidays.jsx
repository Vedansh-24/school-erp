'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const classOptions = [
  "PP.3+", "PP.4+", "PP.5+", 
  "First", "Second", "Third", "Fourth", "Fifth", 
  "Sixth", "Seventh", "Eighth", "Ninth", "Tenth",
  "Eleventh (Arts)", "Eleventh (Commerce)", "Eleventh (Science)",
  "Twelfth (Arts)", "Twelfth (Commerce)", "Twelfth (Science)"
];

export default function AttendanceHolidays() {
  const getTodayInputDate = () => new Date().toISOString().split('T')[0];

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // State Declarations
  const [loading, setLoading] = useState(false);
  const [holidayReason, setHolidayReason] = useState('');
  const [fromDate, setFromDate] = useState(getTodayInputDate());
  const [toDate, setToDate] = useState(getTodayInputDate());
  const [holidaysList, setHolidaysList] = useState([]);

  const [attendanceDate, setAttendanceDate] = useState(getTodayInputDate());
  const [selectedClass, setSelectedClass] = useState('PP.3+');
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);

  // Report Viewer States
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [allStaffList, setAllStaffList] = useState([]);
  const [reportFromDate, setReportFromDate] = useState(getTodayInputDate());
  const [reportToDate, setReportToDate] = useState(getTodayInputDate());
  const [selectPersonType, setSelectPersonType] = useState('Student');
  const [reportClassFilter, setReportClassFilter] = useState('All');
  const [selectEntity, setSelectEntity] = useState('All');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchStudentsAndAttendance();
    fetchStaffAndAttendance();
    fetchHolidays();
    fetchAllEntities();
  }, [selectedClass, attendanceDate]);

  const fetchHolidays = async () => {
    try {
      // Date wise order (from_date ascending)
      const { data, error } = await supabase
        .from('school_holidays')
        .select('*')
        .order('from_date', { ascending: true });
      if (!error && data) setHolidaysList(data);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    }
  };

  const fetchAllEntities = async () => {
    try {
      const { data: stData } = await supabase.from('students').select('id, student_full_name, sr_no, class_name').order('student_full_name');
      if (stData) setAllStudentsList(stData);

      const { data: sfData } = await supabase.from('staff').select('id, full_name, designation').order('full_name');
      if (sfData) setAllStaffList(sfData);
    } catch (err) {
      console.error("Error fetching entity lists:", err);
    }
  };

  // Check if a date falls within any holiday range
  const getCustomHolidayReason = (dateStr) => {
    const match = holidaysList.find(h => {
      const fDate = h.from_date || h.from;
      const tDate = h.to_date || h.to;
      return dateStr >= fDate && dateStr <= tDate;
    });
    return match ? match.reason : null;
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      const { data: studentData, error: studentErr } = await supabase
        .from('students')
        .select('id, student_full_name, sr_no')
        .eq('class_name', selectedClass);

      if (studentErr) throw studentErr;

      const { data: attData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('attendance_date', attendanceDate)
        .eq('class_name', selectedClass);

      const attMap = {};
      if (attData) {
        attData.forEach(item => { attMap[item.student_id] = item.status; });
      }

      const formatted = (studentData || []).map(st => ({
        id: st.id,
        name: st.student_full_name,
        srNo: st.sr_no,
        status: attMap[st.id] || '-- Not Marked --'
      }));

      setStudents(formatted);
    } catch (err) {
      console.error("Student fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffAndAttendance = async () => {
    try {
      const { data: staffData } = await supabase.from('staff').select('id, full_name, designation');
      const { data: attData } = await supabase
        .from('staff_attendance')
        .select('staff_id, status')
        .eq('attendance_date', attendanceDate);

      const attMap = {};
      if (attData) {
        attData.forEach(item => { attMap[item.staff_id] = item.status; });
      }

      const formatted = (staffData || []).map(st => ({
        id: st.id,
        name: st.full_name,
        designation: st.designation,
        status: attMap[st.id] || '-- Not Marked --'
      }));

      setStaff(formatted);
    } catch (err) {
      console.error("Staff fetch error:", err);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!holidayReason.trim() || !fromDate || !toDate) {
      alert('Kripya holiday reason aur dates bharein!');
      return;
    }

    const { data, error } = await supabase.from('school_holidays').insert([
      { reason: holidayReason, from_date: fromDate, to_date: toDate, session: '2026-2027' }
    ]).select();

    if (error) {
      alert('Holiday save karne me error aaya: ' + error.message);
    } else {
      fetchHolidays(); // Refresh and sort list date wise
      setHolidayReason('');
      alert('Holiday successfully save ho gaya!');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!confirm('Kya aap is holiday entry ko delete karna chahte hain?')) return;

    try {
      const { error } = await supabase.from('school_holidays').delete().eq('id', id);
      if (error) throw error;

      setHolidaysList(holidaysList.filter(h => h.id !== id));
      alert('Holiday entry successfully delete ho gayi!');
    } catch (err) {
      alert('Delete karne me error aaya: ' + err.message);
    }
  };

  const handleSaveStudentAttendance = async () => {
    const recordsToInsert = students
      .filter(s => s.status !== '-- Not Marked --')
      .map(s => ({
        student_id: s.id,
        sr_no: s.srNo,
        class_name: selectedClass,
        attendance_date: attendanceDate,
        status: s.status,
        session: '2026-2027'
      }));

    if (recordsToInsert.length === 0) {
      alert('Kripya kisi student ki attendance choose karein!');
      return;
    }

    const { error } = await supabase.from('attendance').upsert(recordsToInsert, {
      onConflict: 'student_id,attendance_date'
    });

    if (error) {
      alert('Attendance Save Error: ' + error.message);
    } else {
      alert(`Class ${selectedClass} ki attendance successfully save ho gayi!`);
    }
  };

  const handleSaveStaffAttendance = async () => {
    const recordsToInsert = staff
      .filter(s => s.status !== '-- Not Marked --')
      .map(s => ({
        staff_id: s.id,
        staff_name: s.name,
        attendance_date: attendanceDate,
        status: s.status,
        session: '2026-2027'
      }));

    if (recordsToInsert.length === 0) {
      alert('Kripya kisi staff ki attendance choose karein!');
      return;
    }

    const { error } = await supabase.from('staff_attendance').upsert(recordsToInsert, {
      onConflict: 'staff_id,attendance_date'
    });

    if (error) {
      alert('Staff Attendance Save Error: ' + error.message);
    } else {
      alert('Staff ki attendance successfully save ho gayi!');
    }
  };

  const generateDateArray = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const stop = new Date(end);
    while (current <= stop) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleShowReport = async () => {
    setLoading(true);
    try {
      const isStudent = selectPersonType === 'Student';
      const table = isStudent ? 'attendance' : 'staff_attendance';
      const idColumn = isStudent ? 'student_id' : 'staff_id';

      let query = supabase
        .from(table)
        .select('*')
        .gte('attendance_date', reportFromDate)
        .lte('attendance_date', reportToDate);

      if (selectEntity !== 'All') {
        query = query.eq(idColumn, selectEntity);
      } else if (isStudent && reportClassFilter !== 'All') {
        query = query.eq('class_name', reportClassFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const attendanceMap = {};
      if (data) {
        data.forEach(item => {
          attendanceMap[item.attendance_date] = item.status;
        });
      }

      let selectedPersonInfo = '';
      if (selectEntity !== 'All') {
        if (isStudent) {
          const st = allStudentsList.find(s => String(s.id) === String(selectEntity));
          if (st) selectedPersonInfo = `${st.student_full_name} (Class: ${st.class_name} -- SR: ${st.sr_no})`;
        } else {
          const sf = allStaffList.find(s => String(s.id) === String(selectEntity));
          if (sf) selectedPersonInfo = `${sf.full_name} (${sf.designation || 'Staff'})`;
        }
      } else {
        if (isStudent) {
          selectedPersonInfo = reportClassFilter !== 'All' ? `All Students of Class: ${reportClassFilter}` : 'All Students';
        } else {
          selectedPersonInfo = 'All Staff Members';
        }
      }

      const allDates = generateDateArray(reportFromDate, reportToDate);
      const rows = allDates.map(dateStr => {
        const dayName = getDayName(dateStr);
        const customHoliday = getCustomHolidayReason(dateStr);

        let status = attendanceMap[dateStr] || '-- Not Marked --';

        // Check for Custom Holiday or Sunday
        if (customHoliday) {
          status = `Holiday: ${customHoliday}`;
        } else if (dayName === 'Sunday') {
          status = isStudent ? 'Sunday (Holiday)' : 'Paid Holiday (Sunday)';
        }

        return {
          date: dateStr,
          day: dayName,
          status: status
        };
      });

      setReportData({
        personInfo: selectedPersonInfo,
        fromDate: reportFromDate,
        toDate: reportToDate,
        rows: rows,
        personType: selectPersonType,
        rawCount: data ? data.length : 0
      });
    } catch (err) {
      alert('Report fetch error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, day, personType) => {
    if (status.startsWith('Holiday: ')) {
      const reason = status.replace('Holiday: ', '');
      if (personType === 'Staff') {
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-md font-bold text-[12px] inline-flex items-center gap-1.5 shadow-sm">
            <span>⭐</span> Paid Holiday ({reason})
          </span>
        );
      }
      return (
        <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 rounded-md font-bold text-[12px] inline-flex items-center gap-1.5 shadow-sm">
          <span>🔒</span> Holiday: {reason}
        </span>
      );
    }

    if (day === 'Sunday' || status.includes('Sunday') || status.includes('Paid Holiday')) {
      if (personType === 'Staff' || status === 'Paid Holiday (Sunday)') {
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-md font-bold text-[12px] inline-flex items-center gap-1.5 shadow-sm">
            <span>⭐</span> Paid Holiday (Sunday)
          </span>
        );
      }
      return (
        <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 rounded-md font-bold text-[12px] inline-flex items-center gap-1.5 shadow-sm">
          <span>🔒</span> Sunday (Holiday)
        </span>
      );
    }

    if (status === 'Present') {
      return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-md font-bold text-[12px]">Present</span>;
    }
    if (status === 'Absent') {
      return <span className="bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-md font-bold text-[12px]">Absent</span>;
    }
    if (status === 'Late' || status === 'On Leave') {
      return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-md font-bold text-[12px]">{status}</span>;
    }
    return <span className="bg-slate-100 text-slate-500 border border-slate-300 px-3 py-1 rounded-md text-[12px]">-- Not Marked --</span>;
  };

  const getStatusStyle = (status) => {
    if (status === 'Present') return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    if (status === 'Absent') return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    if (status === 'Late' || status === 'On Leave') return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    return 'bg-slate-50 text-slate-500 border-slate-200 font-normal';
  };

  const filteredStudentsForReport = reportClassFilter === 'All' 
    ? allStudentsList 
    : allStudentsList.filter(st => st.class_name === reportClassFilter);

  const isTodaySunday = getDayName(attendanceDate) === 'Sunday';
  const todayCustomHoliday = getCustomHolidayReason(attendanceDate);
  const isTodayOff = isTodaySunday || !!todayCustomHoliday;

  // Date Wise Sorted List
  const sortedHolidaysList = [...holidaysList].sort((a, b) => {
    const dateA = new Date(a.from_date || a.from || 0);
    const dateB = new Date(b.from_date || b.from || 0);
    return dateA - dateB;
  });

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full">
      
      {/* 1. School Working Days & Holiday Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-[16px] font-bold text-sky-700 tracking-wide">
          School Working Days & Holiday Management
        </h2>

        <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">Vacation / Holiday Reason</label>
            <input 
              type="text"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              placeholder="e.g. Rakhi, Diwali, Winter Vacation"
              className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm placeholder:text-slate-400 font-normal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">From Date</label>
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm font-medium cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">To Date</label>
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm font-medium cursor-pointer"
              />
            </div>
          </div>

          <div>
            <button 
              type="submit"
              className="w-full bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-[0_4px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[3px] transition-all cursor-pointer"
            >
              Add Holiday Vacation Range
            </button>
          </div>
        </form>

        {/* Date Wise Vertical Holiday List */}
        <div className="pt-2">
          <p className="block text-[13px] font-bold text-sky-700 mb-2">Registered Holidays List (Date-Wise)</p>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {sortedHolidaysList.length === 0 ? (
              <p className="text-[13px] text-slate-500 italic">• No holidays added yet.</p>
            ) : (
              sortedHolidaysList.map((h) => (
                <div 
                  key={h.id} 
                  className="bg-sky-50 border border-sky-200 text-sky-900 text-[13px] px-4 py-2.5 rounded-lg font-medium flex items-center justify-between shadow-sm hover:bg-sky-100/80 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">🎉</span>
                    <span>
                      <strong className="text-sky-950 font-bold">{h.reason}</strong>
                      <span className="text-slate-600 text-[12px] ml-2 font-mono">
                        ({formatDateDisplay(h.from_date || h.from)} to {formatDateDisplay(h.to_date || h.to)})
                      </span>
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded px-2 py-0.5 transition font-bold text-[13px] cursor-pointer ml-2"
                    title="Delete Holiday"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Daily Attendance Control Room */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-[16px] font-bold text-sky-700 tracking-wide">
            Daily Attendance & School Holidays Control Room
          </h2>
          {todayCustomHoliday ? (
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 rounded-lg font-bold text-[12px] flex items-center gap-1.5 shadow-sm">
                🔒 Student: Holiday ({todayCustomHoliday})
              </span>
              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-lg font-bold text-[12px] flex items-center gap-1.5 shadow-sm">
                ⭐ Staff: Paid Holiday ({todayCustomHoliday})
              </span>
            </div>
          ) : isTodaySunday ? (
            <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 rounded-lg font-bold text-[12px] flex items-center gap-1.5 shadow-sm">
              Selected Date is Sunday (Holiday)
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">Attendance Date</label>
            <input 
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm font-medium cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">Select Class (For Students)</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm cursor-pointer font-semibold"
            >
              {classOptions.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          
          {/* Student Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[13px] font-bold text-sky-700 uppercase tracking-wide">Student Attendance ({selectedClass})</h3>
                <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">{students.length} Students</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 text-[13px] text-slate-800 font-bold bg-slate-50">
                      <th className="px-4 py-3.5">Name</th>
                      <th className="px-4 py-3.5">SR. No.</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[13px] font-normal text-slate-800">
                    {students.map((stu, index) => (
                      <tr key={stu.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{stu.name}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono">{stu.srNo}</td>
                        <td className="px-4 py-3.5">
                          {todayCustomHoliday ? (
                            <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded-lg text-[12px] font-bold inline-flex items-center gap-1">
                              🔒 Holiday: {todayCustomHoliday}
                            </span>
                          ) : isTodaySunday ? (
                            <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded-lg text-[12px] font-bold inline-flex items-center gap-1">
                              🔒 Sunday (Holiday)
                            </span>
                          ) : (
                            <select 
                              value={stu.status}
                              onChange={(e) => {
                                const updated = [...students];
                                updated[index].status = e.target.value;
                                setStudents(updated);
                              }}
                              className={`text-[12px] px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${getStatusStyle(stu.status)}`}
                            >
                              <option value="-- Not Marked --">-- Not Marked --</option>
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <button 
                onClick={handleSaveStudentAttendance}
                disabled={isTodayOff}
                className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-[12px] font-bold px-5 py-2.5 rounded-xl shadow-[0_3px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50"
              >
                Save Student Attendance
              </button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[13px] font-bold text-sky-700 uppercase tracking-wide">Staff Attendance</h3>
                <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">{staff.length} Staff</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 text-[13px] text-slate-800 font-bold bg-slate-50">
                      <th className="px-4 py-3.5">Staff Name</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[13px] font-normal text-slate-800">
                    {staff.map((stf, index) => (
                      <tr key={stf.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{stf.name}</div>
                          <div className="text-[11px] text-slate-400">{stf.designation}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          {todayCustomHoliday ? (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-[12px] font-bold inline-flex items-center gap-1">
                              ⭐ Paid Holiday ({todayCustomHoliday})
                            </span>
                          ) : isTodaySunday ? (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-[12px] font-bold inline-flex items-center gap-1">
                              ⭐ Paid Holiday (Sunday)
                            </span>
                          ) : (
                            <select 
                              value={stf.status}
                              onChange={(e) => {
                                const updated = [...staff];
                                updated[index].status = e.target.value;
                                setStaff(updated);
                              }}
                              className={`text-[12px] px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${getStatusStyle(stf.status)}`}
                            >
                              <option value="-- Not Marked --">-- Not Marked --</option>
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                              <option value="On Leave">On Leave</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <button 
                onClick={handleSaveStaffAttendance}
                disabled={isTodayOff}
                className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-[12px] font-bold px-5 py-2.5 rounded-xl shadow-[0_3px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50"
              >
                Save Staff Attendance
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Date Range Report Viewer */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-[16px] font-bold text-sky-700 tracking-wide">
          Date Range & Monthly Attendance Report Viewer
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">From Date</label>
            <input 
              type="date"
              value={reportFromDate}
              onChange={(e) => setReportFromDate(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm font-medium cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">To Date</label>
            <input 
              type="date"
              value={reportToDate}
              onChange={(e) => setReportToDate(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm font-medium cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">Select Person Type</label>
            <select 
              value={selectPersonType}
              onChange={(e) => {
                setSelectPersonType(e.target.value);
                setSelectEntity('All');
                setReportClassFilter('All');
              }}
              className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm cursor-pointer font-semibold"
            >
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          {selectPersonType === 'Student' && (
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Filter by Class</label>
              <select 
                value={reportClassFilter}
                onChange={(e) => {
                  setReportClassFilter(e.target.value);
                  setSelectEntity('All');
                }}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm cursor-pointer font-semibold"
              >
                <option value="All">All Classes</option>
                {classOptions.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}

          <div className={selectPersonType === 'Staff' ? 'lg:col-span-2' : ''}>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">Select Entity</label>
            <select 
              value={selectEntity}
              onChange={(e) => setSelectEntity(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm cursor-pointer font-semibold"
            >
              <option value="All">
                {selectPersonType === 'Student' && reportClassFilter !== 'All' 
                  ? `All Students (${reportClassFilter})` 
                  : `All ${selectPersonType}s`}
              </option>

              {selectPersonType === 'Student' ? (
                filteredStudentsForReport.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.student_full_name} ({st.class_name} -- SR: {st.sr_no})
                  </option>
                ))
              ) : (
                allStaffList.map(sf => (
                  <option key={sf.id} value={sf.id}>
                    {sf.full_name} ({sf.designation || 'Staff'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <button 
            onClick={handleShowReport}
            disabled={loading}
            className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-[0_4px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[3px] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Show Range Attendance Report'}
          </button>
        </div>

        {/* Detailed Attendance Register Table */}
        {reportData && (
          <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-1">
              <h3 className="text-[15px] font-bold text-sky-700">
                Detailed Attendance Register: {reportData.personInfo}
              </h3>
              <p className="text-[12px] font-semibold text-slate-500">
                Period: {formatDateDisplay(reportData.fromDate)} to {formatDateDisplay(reportData.toDate)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[13px] text-sky-800 font-bold bg-slate-100">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[13px] text-slate-700">
                  {reportData.rows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50 transition ${row.day === 'Sunday' || row.status.startsWith('Holiday:') ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-4 py-3 font-medium font-mono">
                        {formatDateDisplay(row.date)}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${row.day === 'Sunday' ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                        {row.day}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(row.status, row.day, reportData.personType)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}