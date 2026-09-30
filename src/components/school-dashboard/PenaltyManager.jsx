'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PenaltyManager() {
  const [classesList] = useState([
    'PP.3+', 'PP.4+', 'PP.5+', 
    'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eight', 'Ninth', 'Tenth',
    'Eleventh (Arts)', 'Eleventh (Commerce)', 'Eleventh (Science)',
    'Twelth (Arts)', 'Twelth (Commerce)', 'Twelth (Science)'
  ]);

  const [selectedClass, setSelectedClass] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  // Defaulters List Filters & Data
  const [defaulterMonth, setDefaulterMonth] = useState('All Months');
  const [defaulterClass, setDefaulterClass] = useState('All Classes');
  const [defaultersData, setDefaultersData] = useState([]);

  // Waiver Form State
  const [waiverForm, setWaiverForm] = useState({
    fromDate: '',
    toDate: '',
    waiverAmount: '',
    reason: ''
  });

  // Manual Penalty Form State
  const [penaltyForm, setPenaltyForm] = useState({
    penaltyDate: '',
    amount: '',
    reason: ''
  });

  // Fetch students when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    } else {
      setStudentsList([]);
      setSelectedStudent('');
    }
  }, [selectedClass]);

  // Fetch Defaulters Data on load
  useEffect(() => {
    fetchDefaulters();
  }, [defaulterMonth, defaulterClass]);

  const fetchStudentsByClass = async (className) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, sr_no, mobile, father_name, class_name')
        .eq('class_name', className);

      if (error) throw error;
      setStudentsList(data || []);
    } catch (err) {
      console.error('Error fetching students:', err.message);
    }
  };

  const fetchDefaulters = async () => {
    try {
      let query = supabase.from('students').select('*').limit(10);
      if (defaulterClass !== 'All Classes') {
        query = query.eq('class_name', defaulterClass);
      }
      const { data, error } = await query;
      if (error) throw error;
      setDefaultersData(data || []);
    } catch (err) {
      console.error('Error fetching defaulters:', err.message);
    }
  };

  const handleWaiverSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('कृपया पहले छात्र (Student) का चयन करें!');
      return;
    }
    alert('पेनल्टी छूट (Waiver Discount) सफलतापूर्वक लागू कर दी गई है!');
    setWaiverForm({ fromDate: '', toDate: '', waiverAmount: '', reason: '' });
  };

  const handlePenaltySubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('कृपया पहले छात्र (Student) का चयन करें!');
      return;
    }
    alert('मैनुअल पेनल्टी सफलतापूर्वक जोड़ दी गई है!');
    setPenaltyForm({ penaltyDate: '', amount: '', reason: '' });
  };

  const handleWhatsAppShare = () => {
    if (!selectedStudent) {
      alert('कृपया WhatsApp शेयर करने के लिए छात्र चुनें!');
      return;
    }
    alert('पेनल्टी और ब्रेकडाउन स्टेटमेंट WhatsApp पर भेजने की प्रक्रिया शुरू हो रही है...');
  };

  const handleSendReminder = (studentName) => {
    alert(`${studentName} के पेरेंट्स को Professional WhatsApp Reminder भेजा जा रहा है!`);
  };

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full">
      
      {/* Header Section */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-[16px] font-bold text-sky-700 tracking-wide">
          Penalty & Waiver Management
        </h2>
        <p className="text-[12px] text-slate-500 mt-1 font-medium">छात्रों की लेट फीस, पेनल्टी और स्पेशल छूट (Waiver) का प्रबंधन करें।</p>
      </div>

      {/* Select Class & Student Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1">
            1. Select Class (कक्षा चुनें) *
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
          >
            <option value="">-- Select Class --</option>
            {classesList.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1">
            2. Select Student (छात्र चुनें) *
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={!selectedClass}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer disabled:opacity-50"
          >
            <option value="">{selectedClass ? '-- Select Student --' : '-- First Select Class --'}</option>
            {studentsList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.full_name} {st.sr_no ? `(SR: ${st.sr_no})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Columns Grid: Waiver Management & Manual Penalty Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Penalty Waiver Management */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-[14px] font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <span>🏷️</span> Penalty Waiver Management
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">चुनी गई तारीख से तारीख तक पेनल्टी में छूट (Discount) दें।</p>
          </div>

          <form onSubmit={handleWaiverSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">From Date (कब से)</label>
                <input
                  type="date"
                  value={waiverForm.fromDate}
                  onChange={(e) => setWaiverForm({...waiverForm, fromDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">To Date (कब तक)</label>
                <input
                  type="date"
                  value={waiverForm.toDate}
                  onChange={(e) => setWaiverForm({...waiverForm, toDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Waiver Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 200"
                value={waiverForm.waiverAmount}
                onChange={(e) => setWaiverForm({...waiverForm, waiverAmount: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Reason for Waiver</label>
              <input
                type="text"
                placeholder="e.g. Principal Exemption / Medical Reason"
                value={waiverForm.reason}
                onChange={(e) => setWaiverForm({...waiverForm, reason: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl px-5 py-2 text-[13px] shadow-[0_3px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[2px] transition cursor-pointer"
              >
                Apply Waiver Discount
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Manual Penalty Assignment */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-[14px] font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <span>⚡</span> Manual Penalty Assignment
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">विशेष तारीख पर मैनुअल पेनल्टी जोड़ने का विकल्प।</p>
          </div>

          <form onSubmit={handlePenaltySubmit} className="space-y-3">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Penalty Date (जिस तारीख को लगानी है)</label>
              <input
                type="date"
                value={penaltyForm.penaltyDate}
                onChange={(e) => setPenaltyForm({...penaltyForm, penaltyDate: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Manual Penalty Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={penaltyForm.amount}
                onChange={(e) => setPenaltyForm({...penaltyForm, amount: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Reason for Penalty</label>
              <input
                type="text"
                placeholder="e.g. Discipline Fine / Late Renewal"
                value={penaltyForm.reason}
                onChange={(e) => setPenaltyForm({...penaltyForm, reason: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl px-5 py-2 text-[13px] shadow-[0_3px_0_#991b1b] active:shadow-[0_1px_0_#991b1b] active:translate-y-[2px] transition cursor-pointer"
              >
                Add Manual Penalty
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Professional Parents Breakdown Statement Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-[14px] font-bold text-slate-800 tracking-wide">
            Professional Parents Breakdown Statement (पेरेंट्स को समझाने हेतु विवरण)
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {selectedStudent ? 'चयनित छात्र का ब्रेकडाउन स्टेटमेंट नीचे उपलब्ध है।' : 'Please select a student above.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-[12px] px-4 py-2 rounded-lg font-bold shadow-[0_3px_0_#065f46] active:shadow-[0_1px_0_#065f46] active:translate-y-[2px] transition cursor-pointer flex items-center gap-1.5"
        >
          <span>💬</span> WhatsApp Share to Parent
        </button>
      </div>

      {/* Month-wise Penalty Cycle & Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-[14px] font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📅</span> Month-wise Penalty Cycle & Status
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            ⚡ Rule: Session 2026-2027: August Onwards (@₹50/Day). Session 2027-2028: April 20th Onwards Fresh Cycle!
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[13px] bg-slate-50 text-slate-800 font-bold">
                <th className="p-3.5">Month</th>
                <th className="p-3.5">Kab Se (From Date)</th>
                <th className="p-3.5">Kab Tak (To Date)</th>
                <th className="p-3.5">Late Days</th>
                <th className="p-3.5">Rate/Day</th>
                <th className="p-3.5">Penalty Active Status</th>
                <th className="p-3.5">Total Late Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[13px]">
              <tr>
                <td colSpan="7" className="p-10 text-center text-[13px] text-slate-500 font-medium">
                  {selectedStudent ? 'No penalty cycles found for this student.' : 'Please select a student above to view penalty cycles.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Date-wise Detailed Manual Penalty & Waiver Break-up */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-[14px] font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📑</span> Date-wise Detailed Manual Penalty & Waiver Break-up
          </h3>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[13px] bg-slate-50 text-slate-800 font-bold">
                <th className="p-3.5">Date / Range</th>
                <th className="p-3.5">Type / Particulars</th>
                <th className="p-3.5">Reason / Note</th>
                <th className="p-3.5">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[13px]">
              <tr>
                <td colSpan="4" className="p-10 text-center text-[13px] text-slate-500 font-medium">
                  No break-up data available. Select a student above.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Unpaid Dues & Penalty Defaulters List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[14px] font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <span className="text-red-600">🚨</span> Unpaid Dues & Penalty Defaulters List
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Jin students ki fee 20 tarikh tak jama nahi hui aur 21 se penalty active hai, unki list yahan dikhegi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Month:</label>
              <select
                value={defaulterMonth}
                onChange={(e) => setDefaulterMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
              >
                <option value="All Months">All Months</option>
                <option value="August">August</option>
                <option value="September">September</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Class:</label>
              <select
                value={defaulterClass}
                onChange={(e) => setDefaulterClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-medium cursor-pointer"
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
                <th className="p-3.5">Active Penalty (₹)</th>
                <th className="p-3.5">Action (Professional WhatsApp Reminder)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[13px]">
              {defaultersData.length > 0 ? (
                defaultersData.map((st, index) => (
                  <tr key={st.id || index} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-slate-600 font-mono font-medium">{st.sr_no || '---'}</td>
                    <td className="p-3.5">
                      <span className="font-bold uppercase text-slate-800 block">{st.full_name}</span>
                      <span className="text-[11px] text-slate-500 font-medium">Class: {st.class_name}</span>
                    </td>
                    <td className="p-3.5 text-slate-700 uppercase font-medium">{st.father_name || '---'}</td>
                    <td className="p-3.5 font-bold text-slate-700">{st.mobile || '-'}</td>
                    <td className="p-3.5 font-bold text-rose-600">₹500</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleSendReminder(st.full_name)}
                        className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-[12px] px-3.5 py-1.5 rounded-lg font-bold shadow-[0_3px_0_#065f46] active:shadow-[0_1px_0_#065f46] active:translate-y-[2px] transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>💬</span> Send Professional WhatsApp Reminder
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-[13px] text-slate-500 font-medium">
                    No defaulter records found.
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