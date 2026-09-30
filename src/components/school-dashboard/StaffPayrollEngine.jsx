'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StaffPayrollEngine() {
  const [loading, setLoading] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [staffName, setStaffName] = useState('');
  const [mobile, setMobile] = useState('');
  const [salary, setSalary] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [permissions, setPermissions] = useState({
    studentReg: true,
    attendance: false,
    feeCollection: false,
    expenses: false,
    homework: false,
    parentsComm: false,
    penalty: false,
    questionBank: false,
  });

  // Upper Input Box State
  const [currentClass, setCurrentClass] = useState('');
  const [currentSubject, setCurrentSubject] = useState('');

  // Mappings List State
  const [mappings, setMappings] = useState([
    { id: 1, class: 'Fourth', subject: 'hindi' }
  ]);

  const [staffList, setStaffList] = useState([]);

  // Modal States
  const [summaryModalStaff, setSummaryModalStaff] = useState(null);
  const [payModalStaff, setPayModalStaff] = useState(null);
  const [payAmountInput, setPayAmountInput] = useState('');
  const [payDateInput, setPayDateInput] = useState('');

  // Load data from Supabase on component mount
  useEffect(() => {
    fetchStaffList();
    const today = new Date().toISOString().split('T')[0];
    setPayDateInput(today);
  }, []);

  const fetchStaffList = async () => {
    setLoading(true);
    try {
      const { data: staffData, error: staffErr } = await supabase
        .from('staff')
        .select(`
          *,
          staff_class_subjects (*),
          staff_payments (*)
        `)
        .order('created_at', { ascending: false });

      if (staffErr) throw staffErr;

      const { data: attData } = await supabase
        .from('staff_attendance')
        .select('staff_id, status');

      const attendanceMap = {};
      if (attData) {
        attData.forEach((item) => {
          if (!attendanceMap[item.staff_id]) {
            attendanceMap[item.staff_id] = { present: 0, absent: 0 };
          }
          if (item.status === 'Present') attendanceMap[item.staff_id].present += 1;
          if (item.status === 'Absent') attendanceMap[item.staff_id].absent += 1;
        });
      }

      const formatted = (staffData || []).map((s) => {
        const totalPaid = (s.staff_payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const att = attendanceMap[s.id] || { present: 0, absent: 0 };

        const perDaySalary = (Number(s.monthly_salary) || 0) / 30;
        const earnedSalary = Math.round((att.present || 0) * perDaySalary);
        const dueSalary = Math.max(0, earnedSalary - totalPaid);

        const classGroup = {};
        (s.staff_class_subjects || []).forEach((m) => {
          if (!classGroup[m.class_name]) classGroup[m.class_name] = [];
          classGroup[m.class_name].push(m.subject_name);
        });

        const classes = Object.keys(classGroup).map((cls) => ({
          class: cls,
          subjects: classGroup[cls].join(', ')
        }));

        return {
          id: s.id,
          name: s.full_name,
          user: s.username || 'N/A',
          password: s.password || '',
          mobile: s.mobile || '',
          salary: s.monthly_salary || 0,
          presentAbsent: `${att.present}P / ${att.absent}A`,
          presentCount: att.present || 0,
          absentCount: att.absent || 0,
          dueSalary: dueSalary,
          totalPaid: totalPaid,
          classes: classes,
          permissions: s.permissions || {},
          rawMappings: s.staff_class_subjects || [],
          payments: s.staff_payments || []
        };
      });

      setStaffList(formatted);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (key) => {
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  const handleAddMapping = () => {
    if (!currentClass && !currentSubject.trim()) {
      alert('Kripya Class chune ya Subject darj karein!');
      return;
    }

    setMappings([
      ...mappings,
      { id: Date.now(), class: currentClass || 'Fourth', subject: currentSubject.trim() || 'hindi' }
    ]);

    setCurrentClass('');
    setCurrentSubject('');
  };

  const handleRemoveMapping = (id) => {
    setMappings(mappings.filter((item) => item.id !== id));
  };

  const handleUpdateMappingField = (id, field, value) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !mobile || !salary) {
      alert('Kripya Staff Name, Mobile aur Monthly Salary bharein!');
      return;
    }

    setLoading(true);
    try {
      let staffId = editingStaffId;

      if (editingStaffId) {
        const { error: updateErr } = await supabase
          .from('staff')
          .update({
            full_name: staffName,
            mobile: mobile,
            monthly_salary: Number(salary),
            username: username || staffName.toLowerCase().slice(0, 4),
            password: password || '123456',
            permissions: permissions
          })
          .eq('id', editingStaffId);

        if (updateErr) throw updateErr;

        await supabase.from('staff_class_subjects').delete().eq('staff_id', editingStaffId);
      } else {
        const { data: newStaff, error: insertErr } = await supabase
          .from('staff')
          .insert([
            {
              full_name: staffName,
              mobile: mobile,
              monthly_salary: Number(salary),
              username: username || staffName.toLowerCase().slice(0, 4),
              password: password || '123456',
              permissions: permissions
            }
          ])
          .select()
          .single();

        if (insertErr) throw insertErr;
        staffId = newStaff.id;
      }

      if (mappings.length > 0 && staffId) {
        const mappingRows = mappings.map((m) => ({
          staff_id: staffId,
          class_name: m.class,
          subject_name: m.subject,
          session: '2026-2027'
        }));

        const { error: mapErr } = await supabase.from('staff_class_subjects').insert(mappingRows);
        if (mapErr) console.error('Mapping Insert Error:', mapErr);
      }

      alert(editingStaffId ? 'Staff jankari update kar di gayi hai!' : 'Staff safalpurvak save kar liya gaya hai!');

      handleCancelEdit();
      fetchStaffList();
    } catch (err) {
      alert('Error saving staff: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setStaffName('');
    setMobile('');
    setSalary('');
    setUsername('');
    setPassword('');
    setMappings([{ id: 1, class: 'Fourth', subject: 'hindi' }]);
  };

  const handleDelete = async (id) => {
    if (confirm('Kya aap is staff record ko hatana chahte hain?')) {
      try {
        const { error } = await supabase.from('staff').delete().eq('id', id);
        if (error) throw error;
        setStaffList(staffList.filter((item) => item.id !== id));
        alert('Staff record hata diya gaya hai!');
      } catch (err) {
        alert('Delete Error: ' + err.message);
      }
    }
  };

  const handleEdit = (staff) => {
    setEditingStaffId(staff.id);
    setStaffName(staff.name);
    setMobile(staff.mobile);
    setSalary(staff.salary.toString());
    setUsername(staff.user);
    setPassword(staff.password || '');
    if (staff.permissions) setPermissions(staff.permissions);

    const formattedMappings = staff.rawMappings.length > 0 
      ? staff.rawMappings.map((m) => ({ id: m.id, class: m.class_name, subject: m.subject_name }))
      : [{ id: 1, class: 'Fourth', subject: 'hindi' }];
    
    setMappings(formattedMappings);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPay = (staff) => {
    setPayModalStaff(staff);
    setPayAmountInput(staff.dueSalary ? staff.dueSalary.toString() : '');
    const today = new Date().toISOString().split('T')[0];
    setPayDateInput(today);
  };

  const handleConfirmPay = async () => {
    if (!payModalStaff || !payAmountInput || isNaN(payAmountInput) || Number(payAmountInput) <= 0) {
      alert('Kripya sahi Payment Amount darj karein!');
      return;
    }

    try {
      const { error } = await supabase.from('staff_payments').insert([
        {
          staff_id: payModalStaff.id,
          amount: Number(payAmountInput),
          payment_mode: 'Cash',
          remarks: 'Salary Payment',
          session: '2026-2027'
        }
      ]);

      if (error) throw error;
      alert(`₹${payAmountInput} ka bhugtan safalpurvak darj ho gaya hai!`);
      setPayModalStaff(null);
      fetchStaffList();
    } catch (err) {
      alert('Payment save error: ' + err.message);
    }
  };

  const handleSummary = (staff) => {
    setSummaryModalStaff(staff);
  };

  const handleWhatsApp = (staff) => {
    if (!staff.mobile) {
      alert('Mobile number uplabdh nahi hai!');
      return;
    }
    const msg = encodeURIComponent(
      `*Blue Heaven Kids Academy*\n` +
      `----------------------------------\n` +
      `*STAFF SALARY STATEMENT*\n` +
      `Staff Name: ${staff.name}\n` +
      `Monthly Salary: ₹${staff.salary}\n` +
      `----------------------------------\n` +
      `Total Present Days: ${staff.presentCount} | Absent: ${staff.absentCount}\n` +
      `Total Gross Earned Salary: ₹${Math.round(staff.presentCount * (staff.salary / 30))}\n` +
      `Total Paid Amount So Far: ₹${staff.totalPaid}\n` +
      `*Net Due Balance (C/F): ₹${staff.dueSalary}*\n` +
      `----------------------------------\n` +
      `Thank you!`
    );
    window.open(`https://wa.me/91${staff.mobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-900 font-sans flex flex-col h-full relative">
      
      {/* Top Section: Staff Registration & Portal Access Controls */}
      <div className={`bg-white border rounded-xl p-6 shadow-sm space-y-5 transition-all ${editingStaffId ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/20' : 'border-slate-300'}`}>
        
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-sky-800 tracking-wide flex items-center gap-2">
            {editingStaffId ? (
              <span className="bg-amber-600 text-white text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                ⚠️ Edit Mode Active (Staff ID: {editingStaffId})
              </span>
            ) : (
              'Staff Registration & Portal Access Controls'
            )}
          </h2>
          {editingStaffId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-[12px] bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-3 py-1 rounded-lg transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveStaff} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-800 mb-1">Staff Full Name</label>
              <input
                type="text"
                placeholder="Staff Name"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-800 mb-1">Mobile Number</label>
              <input
                type="text"
                placeholder="Mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-800 mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-800 mb-1">Login Username</label>
              <input
                type="text"
                placeholder="e.g. rahul_teacher"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-800 mb-1">Login Password (Visible)</label>
              <input
                type="text"
                placeholder="Passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm placeholder:text-slate-400 font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h3 className="text-[13px] font-bold text-sky-800 tracking-wide">
              🔑 Module Access Permissions & Homework Allotment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { key: 'studentReg', label: 'Allow Student Registration' },
                { key: 'attendance', label: 'Allow Attendance' },
                { key: 'feeCollection', label: 'Allow Fee Collection' },
                { key: 'expenses', label: 'Allow Expenses' },
                { key: 'homework', label: 'Allow Homework Publishing' },
                { key: 'parentsComm', label: 'Allow Parents Communication' },
                { key: 'penalty', label: 'Allow Penalty Management' },
                { key: 'questionBank', label: 'Allow Question Bank' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-[12px] text-slate-800 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions[item.key]}
                    onChange={() => handleCheckboxChange(item.key)}
                    className="accent-sky-700 w-4 h-4 rounded cursor-pointer"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="bg-slate-100 p-4 border border-slate-300 rounded-xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4 lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Select Class
                  </label>
                  <select
                    value={currentClass}
                    onChange={(e) => setCurrentClass(e.target.value)}
                    className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm cursor-pointer font-bold"
                  >
                    <option value="" className="text-slate-400">-- Choose Class --</option>
                    <option value="PP.3+">PP.3+</option>
                    <option value="PP.4+">PP.4+</option>
                    <option value="PP.5+">PP.5+</option>
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                    <option value="Third">Third</option>
                    <option value="Fourth">Fourth</option>
                    <option value="Fifth">Fifth</option>
                    <option value="Sixth">Sixth</option>
                    <option value="Seventh">Seventh</option>
                    <option value="Eighth">Eighth</option>
                    <option value="Ninth">Ninth</option>
                    <option value="Tenth">Tenth</option>
                    <option value="Eleventh(Arts)">Eleventh(Arts)</option>
                    <option value="Eleventh(Commerce)">Eleventh(Commerce)</option>
                    <option value="Eleventh(Science)">Eleventh(Science)</option>
                    <option value="Twelth(Arts)">Twelth(Arts)</option>
                    <option value="Twelth (Commerce)">Twelth (Commerce)</option>
                    <option value="Twelth (Science)">Twelth (Science)</option>
                  </select>
                </div>

                <div className="md:col-span-4 lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Allotted Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Hindi, Science"
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="md:col-span-4 lg:col-span-4">
                  <button
                    type="button"
                    onClick={handleAddMapping}
                    className="w-full bg-gradient-to-b from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-[12px] font-bold py-2.5 px-3 rounded-xl shadow-[0_4px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[3px] transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    + Add Classes & Subject Mapping
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {mappings.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Allowed Classes
                    </label>
                    <select
                      value={item.class}
                      onChange={(e) => handleUpdateMappingField(item.id, 'class', e.target.value)}
                      className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm cursor-pointer font-bold"
                    >
                      <option value="" className="text-slate-400">-- Choose Class --</option>
                      <option value="PP.3+">PP.3+</option>
                      <option value="PP.4+">PP.4+</option>
                      <option value="PP.5+">PP.5+</option>
                      <option value="First">First</option>
                      <option value="Second">Second</option>
                      <option value="Third">Third</option>
                      <option value="Fourth">Fourth</option>
                      <option value="Fifth">Fifth</option>
                      <option value="Sixth">Sixth</option>
                      <option value="Seventh">Seventh</option>
                      <option value="Eighth">Eighth</option>
                      <option value="Ninth">Ninth</option>
                      <option value="Tenth">Tenth</option>
                      <option value="Eleventh(Arts)">Eleventh(Arts)</option>
                      <option value="Eleventh(Commerce)">Eleventh(Commerce)</option>
                      <option value="Eleventh(Science)">Eleventh(Science)</option>
                      <option value="Twelth(Arts)">Twelth(Arts)</option>
                      <option value="Twelth (Commerce)">Twelth (Commerce)</option>
                      <option value="Twelth (Science)">Twelth (Science)</option>
                    </select>
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Allowed Subjects
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics, Hindi, Science"
                      value={item.subject}
                      onChange={(e) => handleUpdateMappingField(item.id, 'subject', e.target.value)}
                      className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveMapping(item.id)}
                      className="w-full bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-[13px] font-bold py-2.5 rounded-xl shadow-[0_3px_0_#9f1239] active:shadow-[0_1px_0_#9f1239] active:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🗑</span> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`font-bold text-[13px] px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 text-white ${
                editingStaffId 
                  ? 'bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-[0_4px_0_#b45309] active:shadow-[0_1px_0_#b45309]' 
                  : 'bg-gradient-to-b from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-[0_4px_0_#0369a1] active:shadow-[0_1px_0_#0369a1]'
              } active:translate-y-[3px]`}
            >
              {loading ? 'Saving...' : editingStaffId ? 'Update Staff Record' : 'Save Staff'}
            </button>
            {editingStaffId && (
              <span className="text-[12px] text-amber-800 font-bold">Editing Staff ID: {editingStaffId}</span>
            )}
          </div>
        </form>
      </div>

      {/* Bottom Section: Staff Summary & Session-wise Month View */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-[16px] font-bold text-sky-800 tracking-wide">
          Staff Summary & Session-wise Month View
        </h2>

        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-slate-400 text-[13px] text-white font-bold bg-slate-800">
                  <th className="px-4 py-3.5 border-r border-slate-600">Staff Name & Password</th>
                  <th className="px-4 py-3.5 border-r border-slate-600">Mobile</th>
                  <th className="px-4 py-3.5 border-r border-slate-600">Monthly Salary</th>
                  <th className="px-4 py-3.5 border-r border-slate-600">Present / Absent</th>
                  <th className="px-4 py-3.5 border-r border-slate-600">Due / Payable Salary</th>
                  <th className="px-4 py-3.5 border-r border-slate-600">Total Paid</th>
                  <th className="px-4 py-3.5">Action (Summary / Pay / WhatsApp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[13px] font-medium text-slate-900">
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-slate-500 italic">
                      {loading ? 'Loading staff records...' : 'Koi staff record uplabdh nahi hai.'}
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => (
                    <tr key={staff.id} className={`transition ${editingStaffId === staff.id ? 'bg-amber-100/70' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {staff.name}
                          {editingStaffId === staff.id && (
                            <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Editing</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span>User: <strong className="text-slate-800">{staff.user}</strong></span>
                          <span>|</span>
                          <span>Password: <strong className="text-emerald-800">{staff.password || '123456'}</strong></span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {staff.classes.map((cls, idx) => (
                            <span key={idx} className="bg-slate-200 border border-slate-300 text-slate-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                              {cls.class}: {cls.subjects}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-mono border-r border-slate-200">{staff.mobile}</td>
                      <td className="px-4 py-3.5 text-slate-900 font-bold border-r border-slate-200">₹{staff.salary}</td>
                      <td className="px-4 py-3.5 text-emerald-800 font-bold border-r border-slate-200">{staff.presentAbsent}</td>
                      <td className="px-4 py-3.5 font-bold text-rose-700 border-r border-slate-200">₹{staff.dueSalary}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700 border-r border-slate-200">₹{staff.totalPaid}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => handleEdit(staff)} className={`text-[13px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer text-white ${editingStaffId === staff.id ? 'bg-amber-700 shadow-[0_3px_0_#b45309]' : 'bg-gradient-to-b from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-[0_3px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[2px]'}`}>
                            {editingStaffId === staff.id ? 'Editing...' : 'Edit'}
                          </button>
                          <button onClick={() => handleDelete(staff.id)} className="bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-[13px] font-bold px-3 py-1.5 rounded-lg shadow-[0_3px_0_#9f1239] active:shadow-[0_1px_0_#9f1239] active:translate-y-[2px] transition-all cursor-pointer">
                            Delete
                          </button>
                          <button onClick={() => handleSummary(staff)} className="bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-[13px] px-3 py-1.5 rounded-lg shadow-[0_3px_0_#d97706] active:shadow-[0_1px_0_#d97706] active:translate-y-[2px] transition-all cursor-pointer">
                            Summary
                          </button>
                          <button onClick={() => handleOpenPay(staff)} className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-[13px] font-bold px-3 py-1.5 rounded-lg shadow-[0_3px_0_#047857] active:shadow-[0_1px_0_#047857] active:translate-y-[2px] transition-all cursor-pointer">
                            Pay
                          </button>
                          <button onClick={() => handleWhatsApp(staff)} className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-[13px] font-bold px-3 py-1.5 rounded-lg shadow-[0_3px_0_#047857] active:shadow-[0_1px_0_#047857] active:translate-y-[2px] transition-all cursor-pointer">
                            WhatsApp
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SUMMARY MODAL POPUP (Table Format & Dark Headings - BLUE HEAVEN KIDS ACADEMY) */}
      {summaryModalStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border-2 border-slate-400 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            <div className="p-6 overflow-y-auto space-y-6 font-sans">
              
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-300 pb-4">
                <h1 className="text-[22px] font-extrabold tracking-wider text-sky-800">
                  BLUE HEAVEN KIDS ACADEMY
                </h1>
                <h2 className="text-[14px] font-bold text-slate-900">
                  STAFF APRIL TO MARCH MONTH-WISE SALARY STATEMENT
                </h2>
                <p className="text-[12px] text-slate-600 font-semibold">Academic Session: 2026-2027</p>
              </div>

              {/* Staff Info Table */}
              <div className="border-2 border-slate-400 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold border-b-2 border-slate-400">
                      <th className="px-4 py-2.5 border-r border-slate-600">Staff Name</th>
                      <th className="px-4 py-2.5 border-r border-slate-600">Mobile Number</th>
                      <th className="px-4 py-2.5">Monthly Fixed Base Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="px-4 py-3 border-r border-slate-300">{summaryModalStaff.name}</td>
                      <td className="px-4 py-3 border-r border-slate-300 font-mono">{summaryModalStaff.mobile || 'N/A'}</td>
                      <td className="px-4 py-3 text-sky-800">₹{summaryModalStaff.salary}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Month-wise Accrual Table */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-bold text-white bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <span>📅</span> Month-wise Salary Accrual (April to March)
                </h3>
                <div className="border-2 border-slate-400 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead>
                      <tr className="bg-slate-800 text-white border-b-2 border-slate-400 font-bold">
                        <th className="px-4 py-3 border-r border-slate-600">Month</th>
                        <th className="px-4 py-3 border-r border-slate-600">Opening C/F</th>
                        <th className="px-4 py-3 border-r border-slate-600">Earned Salary (+)</th>
                        <th className="px-4 py-3">Closing Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-300 text-slate-900 font-medium">
                      {[
                        { month: 'April 2026', p: 0, a: 0, amt: 0 },
                        { month: 'May 2026', p: 0, a: 0, amt: 0 },
                        { month: 'June 2026', p: 0, a: 0, amt: 0 },
                        { month: 'July 2026', p: 0, a: 0, amt: 0 },
                        { month: 'August 2026', p: summaryModalStaff.presentCount, a: summaryModalStaff.absentCount, amt: Math.round(summaryModalStaff.presentCount * (summaryModalStaff.salary / 30)) },
                        { month: 'September 2026', p: 0, a: 0, amt: 0 },
                        { month: 'October 2026', p: 0, a: 0, amt: 0 },
                        { month: 'November 2026', p: 0, a: 0, amt: 0 },
                        { month: 'December 2026', p: 0, a: 0, amt: 0 },
                        { month: 'January 2027', p: 0, a: 0, amt: 0 },
                        { month: 'February 2027', p: 0, a: 0, amt: 0 },
                        { month: 'March 2027', p: 0, a: 0, amt: 0 },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900 border-r border-slate-300">{row.month}</td>
                          <td className="px-4 py-2.5 border-r border-slate-300 font-semibold">₹0</td>
                          <td className="px-4 py-2.5 text-emerald-800 font-bold border-r border-slate-300">+₹{row.amt} (P:{row.p}, A:{row.a})</td>
                          <td className="px-4 py-2.5 font-extrabold text-slate-900">{row.amt > 0 ? `₹${row.amt}` : '₹0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions History Table */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-bold text-white bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <span>💸</span> Date-wise Salary Disbursal Transactions History
                </h3>
                <div className="border-2 border-slate-400 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead>
                      <tr className="bg-slate-800 text-white border-b-2 border-slate-400 font-bold">
                        <th className="px-4 py-3 border-r border-slate-600">Date</th>
                        <th className="px-4 py-3 border-r border-slate-600">Payment Mode</th>
                        <th className="px-4 py-3 border-r border-slate-600">Paid Amount (₹)</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-300 text-slate-900 font-medium">
                      {summaryModalStaff.payments.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-slate-500 italic">
                            No salary disbursements recorded yet.
                          </td>
                        </tr>
                      ) : (
                        summaryModalStaff.payments.map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 border-r border-slate-300 font-bold">{new Date(p.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-2.5 border-r border-slate-300 font-semibold">{p.payment_mode || 'Cash'}</td>
                            <td className="px-4 py-2.5 text-emerald-800 font-extrabold border-r border-slate-300">₹{p.amount}</td>
                            <td className="px-4 py-2.5 text-emerald-800 font-bold">Success</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary Table */}
              <div className="border-2 border-slate-400 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                <table className="w-full text-left border-collapse text-[13px] font-bold">
                  <thead>
                    <tr className="bg-slate-800 text-white border-b-2 border-slate-400">
                      <th className="px-4 py-3 border-r border-slate-600">Total Earned (Year)</th>
                      <th className="px-4 py-3 border-r border-slate-600">Total Paid (Year)</th>
                      <th className="px-4 py-3">Net Balance Due (C/F)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-900 text-[14px]">
                      <td className="px-4 py-3.5 text-emerald-800 border-r border-slate-300">₹{Math.round(summaryModalStaff.presentCount * (summaryModalStaff.salary / 30))}</td>
                      <td className="px-4 py-3.5 text-sky-800 border-r border-slate-300">₹{summaryModalStaff.totalPaid}</td>
                      <td className="px-4 py-3.5 text-rose-700 font-extrabold">₹{summaryModalStaff.dueSalary}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="bg-slate-200 border-t-2 border-slate-400 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="bg-slate-300 hover:bg-slate-400 text-slate-900 text-[13px] font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-400 shadow-sm"
              >
                <span>🖨️</span> Print Statement
              </button>
              <button
                onClick={() => setSummaryModalStaff(null)}
                className="bg-rose-700 hover:bg-rose-800 text-white text-[13px] font-bold px-6 py-2 rounded-xl transition cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PAY MODAL POPUP */}
      {payModalStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border-2 border-slate-400 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-6 space-y-5">
              
              <div className="space-y-1">
                <h2 className="text-[16px] font-bold text-sky-800 flex items-center gap-2">
                  <span>💳</span> Disburse Salary Payment
                </h2>
                <p className="text-[12px] text-slate-700 font-medium">
                  Staff Name: <strong className="text-slate-900">{payModalStaff.name}</strong> | Monthly Base: <strong className="text-slate-900">₹{payModalStaff.salary}</strong>
                </p>
              </div>

              {/* Stats pill list */}
              <div className="text-[12px] text-slate-800 space-y-1 bg-slate-100 p-3 rounded-xl border border-slate-300 font-semibold">
                <div>• Total Earned Gross Salary: <span className="text-slate-900 font-bold">₹{Math.round(payModalStaff.presentCount * (payModalStaff.salary / 30))}</span></div>
                <div>• Total Salary Paid So Far: <span className="text-emerald-800 font-bold">₹{payModalStaff.totalPaid}</span></div>
                <div>• Net Balance Due Payable: <span className="text-rose-700 font-bold">₹{payModalStaff.dueSalary}</span></div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmountInput}
                    onChange={(e) => setPayAmountInput(e.target.value)}
                    className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1">Payment Mode</label>
                  <select
                    className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm cursor-pointer font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1">Date</label>
                  <input
                    type="date"
                    value={payDateInput}
                    onChange={(e) => setPayDateInput(e.target.value)}
                    className="w-full bg-white text-slate-900 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-600 transition shadow-sm font-bold"
                  />
                </div>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="bg-slate-200 border-t-2 border-slate-400 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setPayModalStaff(null)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-[13px] px-5 py-2 rounded-xl transition cursor-pointer border border-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-[13px] px-5 py-2 rounded-xl shadow-[0_3px_0_#047857] active:shadow-[0_1px_0_#047857] active:translate-y-[2px] transition-all cursor-pointer"
              >
                Confirm & Save Payment
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}