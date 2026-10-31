'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentsCommunication() {
  const [activeSubTab, setActiveSubTab] = useState('Unpaid Defaulters');
  
  // Date states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [unpaidDate, setUnpaidDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedClass, setSelectedClass] = useState('Tenth');
  const [loading, setLoading] = useState(false);
  
  // Manual Message States
  const [manualClass, setManualClass] = useState('-- Choose Class --');
  const [messageText, setMessageText] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Unpaid Defaulters Filters & Data State
  const [unpaidClassFilter, setUnpaidClassFilter] = useState('All Classes');
  const [defaultersList, setDefaultersList] = useState([]);

  // Student Directory State
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryClassFilter, setDirectoryClassFilter] = useState('All Classes');
  const [directoryList, setDirectoryList] = useState([]);

  // Absent Students State
  const [absentList, setAbsentList] = useState([]);

  const classesList = [
    'PP.3+', 'PP.4+', 'PP.5+', 
    'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eight', 'Ninth', 'Tenth',
    'Eleventh (Arts)', 'Eleventh (Commerce)', 'Eleventh (Science)',
    'Twelth (Arts)', 'Twelth (Commerce)', 'Twelth (Science)'
  ];

  // Fetch Absent Students based on selectedDate & selectedClass
  useEffect(() => {
    if (activeSubTab === 'Absent Students') {
      fetchAbsentStudents();
    }
  }, [selectedDate, selectedClass, activeSubTab]);

  // Fetch Students for Manual Message when Class Changes
  useEffect(() => {
    if (manualClass !== '-- Choose Class --') {
      fetchStudentsByClass(manualClass);
    } else {
      setClassStudents([]);
      setSelectedStudentIds([]);
      setSelectAll(false);
    }
  }, [manualClass]);

  // Fetch Unpaid Defaulters
  useEffect(() => {
    if (activeSubTab === 'Unpaid Defaulters') {
      fetchDefaulters();
    }
  }, [activeSubTab, unpaidClassFilter]);

  // Fetch Student Directory
  useEffect(() => {
    if (activeSubTab === 'Student Directory') {
      fetchDirectory();
    }
  }, [activeSubTab, directoryClassFilter]);

  // 1. Fetch Absent Students from Supabase
  const fetchAbsentStudents = async () => {
    try {
      setLoading(true);
      // Fetch attendance marked as 'Absent'
      const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('student_id, status, attendance_date, date')
        .eq('status', 'Absent');

      if (attErr) throw attErr;

      const absentStudentIds = attData
        .filter(a => (a.attendance_date === selectedDate || a.date === selectedDate))
        .map(a => a.student_id);

      if (absentStudentIds.length === 0) {
        setAbsentList([]);
        setLoading(false);
        return;
      }

      // Fetch student details for absent IDs
      const { data: stData, error: stErr } = await supabase
        .from('students')
        .select('*')
        .in('id', absentStudentIds)
        .eq('class_name', selectedClass);

      if (stErr) throw stErr;

      const formatted = (stData || []).map(st => ({
        id: st.id,
        sr_no: st.sr_no || 'N/A',
        name: st.student_full_name || 'N/A',
        father: st.father_name || 'N/A',
        mobile: st.whatsapp_number || st.mobile_number || 'No Mobile',
        status: 'Absent'
      }));

      setAbsentList(formatted);
    } catch (err) {
      console.error('Error fetching absent students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Students for Manual Class Message
  const fetchStudentsByClass = async (className) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_name', className);

      if (error) throw error;

      const formatted = (data || []).map(st => ({
        id: st.id,
        sr_no: st.sr_no || 'N/A',
        full_name: st.student_full_name || 'N/A',
        father_name: st.father_name || 'N/A',
        mobile: st.whatsapp_number || st.mobile_number || 'No Mobile'
      }));

      setClassStudents(formatted);
      setSelectedStudentIds([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error fetching class students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Unpaid Defaulters from Supabase
  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      let query = supabase.from('students').select('*');
      if (unpaidClassFilter !== 'All Classes') {
        query = query.eq('class_name', unpaidClassFilter);
      }

      const { data: studentsData, error: stErr } = await query;
      if (stErr) throw stErr;

      const { data: feeData, error: feeErr } = await supabase
        .from('fee_collections')
        .select('student_id, total_paid');
      if (feeErr) throw feeErr;

      // Calculate paid totals per student
      const paidMap = {};
      (feeData || []).forEach(f => {
        paidMap[f.student_id] = (paidMap[f.student_id] || 0) + Number(f.total_paid || 0);
      });

      const list = (studentsData || []).map(st => {
        const annualFee = Number(st.annual_fees || 0);
        const totalPaid = paidMap[st.id] || 0;
        const totalDue = annualFee - totalPaid;

        return {
          id: st.id,
          sr_no: st.sr_no || 'N/A',
          name: st.student_full_name || 'N/A',
          class: st.class_name || 'N/A',
          father: st.father_name || 'N/A',
          mobile: st.whatsapp_number || st.mobile_number || 'No Mobile',
          dueText: totalDue > 0 ? 'Unpaid Due' : 'Paid',
          totalDue: totalDue > 0 ? totalDue : 0
        };
      }).filter(st => st.totalDue > 0);

      setDefaultersList(list);
    } catch (err) {
      console.error('Error fetching defaulters:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Student Directory
  const fetchDirectory = async () => {
    try {
      setLoading(true);
      let query = supabase.from('students').select('*');
      if (directoryClassFilter !== 'All Classes') {
        query = query.eq('class_name', directoryClassFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted = (data || []).map(st => ({
        id: st.id,
        sr_no: st.sr_no || 'N/A',
        name: st.student_full_name || 'N/A',
        class: st.class_name || 'N/A',
        father: st.father_name || 'N/A',
        mobile: st.whatsapp_number || st.mobile_number || 'No Mobile'
      }));

      setDirectoryList(formatted);
    } catch (err) {
      console.error('Error fetching directory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Key Handlers for Date
  const handleDateKeyDown = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const dateObj = new Date(selectedDate);
    if (isNaN(dateObj.getTime())) return;
    dateObj.setDate(dateObj.getDate() + (e.key === 'ArrowUp' ? 1 : -1));
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  const handleUnpaidDateKeyDown = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const dateObj = new Date(unpaidDate);
    if (isNaN(dateObj.getTime())) return;
    dateObj.setDate(dateObj.getDate() + (e.key === 'ArrowUp' ? 1 : -1));
    setUnpaidDate(dateObj.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  // Selection handlers
  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedStudentIds([]);
    } else {
      setSelectAll(true);
      setSelectedStudentIds(classStudents.map(s => s.id));
    }
  };

  const handleCheckboxToggle = (id) => {
    if (selectedStudentIds.includes(id)) {
      const updated = selectedStudentIds.filter(item => item !== id);
      setSelectedStudentIds(updated);
      setSelectAll(false);
    } else {
      const updated = [...selectedStudentIds, id];
      setSelectedStudentIds(updated);
      if (updated.length === classStudents.length) setSelectAll(true);
    }
  };

  // WhatsApp Alert Trigger
  const sendWhatsAppMsg = (mobile, text) => {
    if (!mobile || mobile === 'No Mobile') {
      alert('Is student ka mobile number maujood nahi hai!');
      return;
    }
    const url = `https://api.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Actions
  const handleSendBroadcast = () => {
    if (manualClass === '-- Choose Class --') {
      alert('Kripya pehle koi Class chunein!');
      return;
    }
    if (!messageText.trim()) {
      alert('Kripya bhejne ke liye message likhein!');
      return;
    }
    if (selectedStudentIds.length === 0) {
      alert('Kam se kam ek student ko select karein!');
      return;
    }

    const selectedList = classStudents.filter(s => selectedStudentIds.includes(s.id));
    selectedList.forEach(st => {
      if (st.mobile && st.mobile !== 'No Mobile') {
        const fullMsg = `Dear Parent, \n${messageText}\n\nRegards,\nBlue Heaven Kids Academy`;
        sendWhatsAppMsg(st.mobile, fullMsg);
      }
    });

    alert(`Successfully WhatsApp message triggered for selected students!`);
    setMessageText('');
    setSelectedStudentIds([]);
    setSelectAll(false);
  };

  const handleSendFeeReminder = (studentName, mobile, dueAmount) => {
    const msg = `Dear Parent, \nThis is a gentle reminder regarding the pending fee dues of ₹${dueAmount} for ${studentName}.\nKindly clear the dues at the earliest.\n\nBlue Heaven Kids Academy`;
    sendWhatsAppMsg(mobile, msg);
  };

  const handleSendAbsentAlert = (st) => {
    const msg = `Dear Parent, \nYour child ${st.name} (SR No: ${st.sr_no}) was marked ABSENT today (${formatDisplayDate(selectedDate)}).\nKindly inform the school administration if leave was planned.\n\nBlue Heaven Kids Academy`;
    sendWhatsAppMsg(st.mobile, msg);
  };

  const handlePrintDirectory = () => {
    window.print();
  };

  const filteredDirectory = directoryList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
                          item.mobile.includes(directorySearch) || 
                          item.sr_no.includes(directorySearch);
    return matchesSearch;
  });

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full">
      
      {/* Title Header */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-[16px] font-bold text-sky-700 tracking-wide">
          Parents Communication & Smart Alerts
        </h2>
      </div>

      {/* Top Navigation Sub-Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveSubTab('Absent Students')}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 text-center shadow-md active:translate-y-0.5 cursor-pointer relative ${
            activeSubTab === 'Absent Students'
              ? 'bg-blue-900 text-white shadow-blue-950/60 border-2 border-cyan-400 ring-4 ring-cyan-400/30 scale-[1.02]'
              : 'bg-blue-800 hover:bg-blue-900 text-slate-200 shadow-blue-800/30 border border-transparent opacity-85 hover:opacity-100'
          }`}
        >
          {activeSubTab === 'Absent Students' && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-cyan-400 text-blue-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">Active</span>}
          Absent Students List & WhatsApp
        </button>

        <button
          onClick={() => setActiveSubTab('Manual Message')}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 text-center shadow-md active:translate-y-0.5 cursor-pointer relative ${
            activeSubTab === 'Manual Message'
              ? 'bg-amber-700 text-white shadow-amber-950/60 border-2 border-amber-300 ring-4 ring-amber-400/30 scale-[1.02]'
              : 'bg-amber-600 hover:bg-amber-700 text-slate-200 shadow-amber-700/30 border border-transparent opacity-85 hover:opacity-100'
          }`}
        >
          {activeSubTab === 'Manual Message' && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-300 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">Active</span>}
          Manual Class-wise Message
        </button>

        <button
          onClick={() => setActiveSubTab('Unpaid Defaulters')}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 text-center shadow-md active:translate-y-0.5 cursor-pointer relative ${
            activeSubTab === 'Unpaid Defaulters'
              ? 'bg-red-800 text-white shadow-red-950/60 border-2 border-rose-300 ring-4 ring-rose-400/30 scale-[1.02]'
              : 'bg-red-700 hover:bg-red-800 text-slate-200 shadow-red-700/30 border border-transparent opacity-85 hover:opacity-100'
          }`}
        >
          {activeSubTab === 'Unpaid Defaulters' && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-300 text-red-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">Active</span>}
          Unpaid Fee Defaulters List
        </button>

        <button
          onClick={() => setActiveSubTab('Student Directory')}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 text-center shadow-md active:translate-y-0.5 cursor-pointer relative ${
            activeSubTab === 'Student Directory'
              ? 'bg-emerald-800 text-white shadow-emerald-950/60 border-2 border-emerald-300 ring-4 ring-emerald-400/30 scale-[1.02]'
              : 'bg-emerald-700 hover:bg-emerald-800 text-slate-200 shadow-emerald-700/30 border border-transparent opacity-85 hover:opacity-100'
          }`}
        >
          {activeSubTab === 'Student Directory' && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-300 text-emerald-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">Active</span>}
          Student Directory & Print
        </button>
      </div>

      {/* Tab 1: Absent Students */}
      {activeSubTab === 'Absent Students' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <h3 className="text-[14px] font-bold text-slate-800 tracking-wide">
              Today's Absent Students & WhatsApp Broadcast
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[12px] text-slate-700 mb-1 font-bold">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onKeyDown={handleDateKeyDown}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[12px] text-slate-700 mb-1 font-bold">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
                >
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[13px] bg-slate-50 text-slate-800 font-bold">
                  <th className="p-3.5">SR No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Father Name</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">WhatsApp Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[13px]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                      Loading data...
                    </td>
                  </tr>
                ) : absentList.length > 0 ? (
                  absentList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 text-slate-600 font-medium">{st.sr_no}</td>
                      <td className="p-3.5 font-bold text-slate-800">{st.name}</td>
                      <td className="p-3.5 text-slate-600">{st.father}</td>
                      <td className="p-3.5 text-slate-600">{st.mobile}</td>
                      <td className="p-3.5 text-rose-600 font-bold">{st.status}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleSendAbsentAlert(st)}
                          className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-[12px] px-3.5 py-1.5 rounded-lg font-bold shadow-[0_3px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[2px] transition cursor-pointer"
                        >
                          Send Alert
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[13px] text-slate-500 font-medium">
                      🟢 No absent students found for {formatDisplayDate(selectedDate)} in class {selectedClass}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Manual Class-wise Message */}
      {activeSubTab === 'Manual Message' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="text-[14px] font-bold text-slate-800 tracking-wide">
            💬 Manual Class-wise Message Broadcast
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Select Class</label>
              <select
                value={manualClass}
                onChange={(e) => setManualClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 outline-none focus:border-amber-500 shadow-sm font-medium cursor-pointer"
              >
                <option value="-- Choose Class --">-- Choose Class --</option>
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Type Message</label>
              <textarea
                rows="2"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter message here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 resize-none shadow-sm font-normal"
              ></textarea>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[13px] bg-slate-50 text-slate-800 font-bold">
                  <th className="p-3.5 w-16 text-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllToggle}
                      className="cursor-pointer accent-amber-600 scale-125"
                    />
                    <span className="block text-[10px] text-slate-500 mt-0.5 font-bold">Select All</span>
                  </th>
                  <th className="p-3.5">SR No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Father Name</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[13px]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                      Loading class students...
                    </td>
                  </tr>
                ) : classStudents.length > 0 ? (
                  classStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(st.id)}
                          onChange={() => handleCheckboxToggle(st.id)}
                          className="cursor-pointer accent-amber-600 scale-125"
                        />
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{st.sr_no}</td>
                      <td className="p-3.5 font-bold text-slate-800">{st.full_name}</td>
                      <td className="p-3.5 text-slate-600">{st.father_name}</td>
                      <td className="p-3.5 text-slate-600">{st.mobile}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => sendWhatsAppMsg(st.mobile, messageText || 'Hello Parent, Greetings from Blue Heaven Kids Academy.')}
                          className="bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-[12px] px-3.5 py-1.5 rounded-lg font-bold shadow-[0_3px_0_#92400e] active:shadow-[0_1px_0_#92400e] active:translate-y-[2px] transition cursor-pointer"
                        >
                          Send WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[13px] text-slate-500 font-medium">
                      Please select a class above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {classStudents.length > 0 && (
            <div className="pt-2">
              <button
                onClick={handleSendBroadcast}
                className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl px-6 py-2.5 text-[13px] shadow-[0_4px_0_#065f46] active:shadow-[0_1px_0_#065f46] active:translate-y-[3px] transition cursor-pointer flex items-center gap-2"
              >
                <span>🚀</span> Send to Selected Students via WhatsApp
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Unpaid Fee Defaulters List */}
      {activeSubTab === 'Unpaid Defaulters' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <h3 className="text-[14px] font-bold text-slate-800 tracking-wide">
              Month-wise Unpaid Fee Defaulters
            </h3>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Select Due Date</label>
                <input
                  type="date"
                  value={unpaidDate}
                  onChange={(e) => setUnpaidDate(e.target.value)}
                  onKeyDown={handleUnpaidDateKeyDown}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-rose-500 shadow-sm font-medium cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Select Class</label>
                <select
                  value={unpaidClassFilter}
                  onChange={(e) => setUnpaidClassFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-rose-500 shadow-sm font-medium cursor-pointer"
                >
                  <option value="All Classes">All Classes</option>
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[13px] bg-slate-50 text-slate-800 font-bold">
                  <th className="p-3.5">SR No</th>
                  <th className="p-3.5">Student Name & Class</th>
                  <th className="p-3.5">Father Name</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Total Fee / Balance Due</th>
                  <th className="p-3.5">Send Fee Reminder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[13px]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                      Calculating unpaid fee defaulters...
                    </td>
                  </tr>
                ) : defaultersList.length > 0 ? (
                  defaultersList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 text-slate-600 font-mono font-medium">{item.sr_no}</td>
                      <td className="p-3.5">
                        <span className="font-bold uppercase text-slate-800 block">{item.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{item.class}</span>
                      </td>
                      <td className="p-3.5 text-slate-700 uppercase font-medium">{item.father}</td>
                      <td className={`p-3.5 font-bold ${item.mobile === 'No Mobile' ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.mobile}
                      </td>
                      <td className="p-3.5">
                        <span className="text-rose-600 block font-bold">{item.dueText} (As of {formatDisplayDate(unpaidDate)})</span>
                        <span className="text-[11px] text-slate-500 font-medium">Total Due: ₹{item.totalDue}</span>
                      </td>
                      <td className="p-3.5">
                        {item.mobile !== 'No Mobile' ? (
                          <button
                            onClick={() => handleSendFeeReminder(item.name, item.mobile, item.totalDue)}
                            className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-[12px] px-3.5 py-1.5 rounded-lg font-bold shadow-[0_3px_0_#065f46] active:shadow-[0_1px_0_#065f46] active:translate-y-[2px] transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>💬</span> Fee Reminder
                          </button>
                        ) : (
                          <span className="text-slate-400 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[13px] text-slate-500 font-medium">
                      No unpaid fee defaulters found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Student Directory & Print */}
      {activeSubTab === 'Student Directory' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <h3 className="text-[14px] font-bold text-slate-800 tracking-wide">
              Student Contact Directory & Print Records
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search student, SR or mobile..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-sm font-medium"
              />

              <select
                value={directoryClassFilter}
                onChange={(e) => setDirectoryClassFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-emerald-500 shadow-sm font-medium cursor-pointer"
              >
                <option value="All Classes">All Classes</option>
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              <button
                onClick={handlePrintDirectory}
                className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-[12px] px-4 py-2 rounded-lg font-bold shadow-[0_3px_0_#065f46] active:shadow-[0_1px_0_#065f46] active:translate-y-[2px] transition cursor-pointer"
              >
                🖨️ Print Directory
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[13px] bg-slate-50 text-slate-800 font-bold">
                  <th className="p-3.5">SR No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Father Name</th>
                  <th className="p-3.5">Mobile Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[13px]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-bold">
                      Loading directory...
                    </td>
                  </tr>
                ) : filteredDirectory.length > 0 ? (
                  filteredDirectory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 text-slate-600 font-mono font-medium">{item.sr_no}</td>
                      <td className="p-3.5 font-bold text-slate-800">{item.name}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{item.class}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{item.father}</td>
                      <td className="p-3.5 text-emerald-600 font-bold">{item.mobile}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-[13px] text-slate-500 font-medium">
                      No directory records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}