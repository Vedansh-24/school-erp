// Filename: ParentsPortalCredentialsManager.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Download, RefreshCw, ShieldCheck, Filter, UserCheck, Loader2 } from 'lucide-react';

export default function ParentsPortalCredentialsManager() {
  const classOptions = [
    'PP.3+',
    'PP.4+',
    'PP.5+',
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth',
    'Eleventh(Arts)',
    'Eleventh(Commerce)',
    'Eleventh(Science)',
    'Twelfth(Arts)',
    'Twelfth(Commerce)',
    'Twelfth(Science)',
  ];

  // State Management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState('All Classes');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Students and Credentials from Supabase
  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      // Fetch students list
      let query = supabase.from('students').select('*');
      if (filterClass !== 'All Classes') {
        query = query.eq('class_name', filterClass);
      }
      const { data: studentsData, error: studentError } = await query;

      if (studentError) throw studentError;

      if (studentsData) {
        // Fetch parent credentials
        const { data: credsData, error: credsError } = await supabase.from('parent_credentials').select('*');
        if (credsError) throw credsError;

        // Map credentials with respective students based on Student ID (if present) else SR No
        const mergedData = studentsData.map((st) => {
          const hasStudentId = st.student_id && String(st.student_id).trim() !== '';
          const activeIdentifier = hasStudentId ? st.student_id : st.sr_no;

          // Find credential matching student_id or sr_no
          const cred = credsData?.find((c) => 
            String(c.student_id) === String(st.id) || 
            String(c.student_id) === String(activeIdentifier) ||
            String(c.student_id) === String(st.student_id) ||
            String(c.student_id) === String(st.sr_no) ||
            String(c.sr_no) === String(st.sr_no)
          );

          return {
            id: st.id,
            student_id: st.student_id || '',
            srNo: st.sr_no || 'N/A',
            name: st.student_full_name || 'Unknown',
            className: st.class_name || 'Unassigned',
            fatherName: st.father_name || 'N/A',
            mobile: st.mobile_number || st.whatsapp_number || 'N/A',
            loginId: cred ? cred.portal_login_id : (activeIdentifier || ''),
            password: cred ? cred.password : '123456',
            credId: cred ? cred.id : null,
          };
        });

        setStudents(mergedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, [filterClass]);

  // Input Change Handler
  const handleInputChange = (id, field, value) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  // Save Handler - Includes sr_no and student_id to satisfy database constraints
  const handleSave = async (student) => {
    try {
      const targetIdentifier = (student.student_id && String(student.student_id).trim() !== '') 
        ? student.student_id 
        : student.srNo;

      if (student.credId) {
        // Update existing record
        const { error } = await supabase
          .from('parent_credentials')
          .update({
            student_id: targetIdentifier,
            sr_no: student.srNo,
            portal_login_id: student.loginId,
            password: student.password,
            updated_at: new Date()
          })
          .eq('id', student.credId);

        if (error) throw error;
      } else {
        // Insert new record passing both sr_no and student_id
        const { data, error } = await supabase
          .from('parent_credentials')
          .insert([
            {
              student_id: student.student_id || null,
              sr_no: student.srNo,
              portal_login_id: student.loginId,
              password: student.password
            }
          ])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          student.credId = data[0].id;
        }
      }

      setSuccessMsg(`✅ ${student.name} (Class: ${student.className}) ke Credentials successfully update ho gaye!`);
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (error) {
      alert('Error saving credentials: ' + error.message);
    }
  };

  const handleExport = () => {
    setSuccessMsg(`📄 ${filterClass} ke credentials report export ho rahi hai...`);
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  // Themes
  const inputTheme = "w-full bg-[#F4F7F9] border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 shadow-inner transition-all duration-200";
  const tableInputTheme = "w-full min-w-[120px] bg-[#F4F7F9] border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 shadow-inner transition-all duration-200";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      
      {/* Toast Notification for Success */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl border-t border-emerald-300 border-b-[4px] border-emerald-900 animate-bounce flex items-center gap-2">
          <ShieldCheck size={20} /> {successMsg}
        </div>
      )}

      {/* Top Header & Action Controls Section */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-400/30 mb-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wide text-white flex items-center gap-3">
              <UserCheck className="text-sky-300" size={32} />
              Parents Portal Credentials Manager
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-indigo-100/90 mt-1">
              Yahan से aap har class ke students ke Parents Portal Login ID aur Passwords edit/update kar sakte hain.
            </p>
          </div>

          {/* Header 3D Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* 🌊 3D Sky-Blue Export Button */}
            <button 
              onClick={handleExport}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 hover:from-sky-300 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-t border-sky-200 border-b-[4px] border-blue-950 shadow-[0_0_15px_rgba(56,189,248,0.35)] active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <Download size={16} className="stroke-[3]" /> Export List
            </button>

            {/* 🔮 3D Purple Refresh Button */}
            <button 
              onClick={() => { setFilterClass('All Classes'); fetchStudentsData(); }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-fuchsia-600 to-pink-600 hover:from-purple-400 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-t border-purple-200 border-b-[4px] border-purple-950 shadow-md active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={`stroke-[3] ${loading ? 'animate-spin' : ''}`} /> Reset
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center gap-4">
          <label className="text-xs font-black uppercase tracking-wider text-indigo-100 flex items-center gap-2 whitespace-nowrap">
            <Filter size={16} className="text-sky-300" /> Filter By Class:
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className={`${inputTheme} max-w-md cursor-pointer`}
          >
            <option value="All Classes">All Classes</option>
            {classOptions.map((cls, index) => (
              <option key={index} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider border-b-2 border-slate-200">
                <th className="p-4 pl-6">SR No / ID</th>
                <th className="p-4">Student Name & Class</th>
                <th className="p-4">Father Name</th>
                <th className="p-4 text-center">Mobile No.</th>
                <th className="p-4">Portal Login ID</th>
                <th className="p-4">Password</th>
                <th className="p-4 text-center pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-indigo-600" size={24} />
                      Loading database records...
                    </div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 text-sm font-bold text-slate-600">
                      <div className="flex flex-col">
                        <span>SR: {student.srNo}</span>
                        {student.student_id && (
                          <span className="text-[11px] font-extrabold text-emerald-600">ID: {student.student_id}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">{student.name}</span>
                        <span className="text-xs font-extrabold text-indigo-600 mt-0.5">Class: {student.className}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-600 uppercase">
                      {student.fatherName}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-500 text-center">
                      {student.mobile}
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={student.loginId} 
                        onChange={(e) => handleInputChange(student.id, 'loginId', e.target.value)}
                        className={tableInputTheme} 
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={student.password} 
                        onChange={(e) => handleInputChange(student.id, 'password', e.target.value)}
                        className={tableInputTheme} 
                      />
                    </td>
                    <td className="p-4 pr-6 text-center align-middle">
                      {/* ❇️ 3D EMERALD GRADIENT SAVE BUTTON WITH DABNE WALA EFFECT */}
                      <button 
                        onClick={() => handleSave(student)}
                        className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-400 hover:to-teal-600 text-white font-black px-5 py-2 rounded-xl text-[12px] uppercase tracking-wider border-t border-emerald-300 border-b-[4px] border-emerald-950 shadow-md active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all cursor-pointer w-full md:w-auto"
                      >
                        <Save size={15} className="stroke-[3]" /> Save
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400 font-bold">
                    Is class ke liye koi student nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Space */}
        <div className="bg-slate-50 p-4 border-t-2 border-slate-100 text-center text-xs font-black text-slate-500 uppercase tracking-wider rounded-b-3xl">
          Showing {students.length} Students from Database
        </div>
      </div>
      
    </div>
  );
}