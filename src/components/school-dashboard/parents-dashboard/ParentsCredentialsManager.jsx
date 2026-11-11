// Filename: ParentsPortalCredentialsManager.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Download, RefreshCw, ShieldCheck, Filter, UserCheck, Loader2 } from 'lucide-react';

export default function ParentsPortalCredentialsManager() {
  const classOptions = [
    'PP.3+', 'PP.4+', 'PP.5+', 'First', 'Second', 'Third', 'Fourth', 'Fifth',
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    'Eleventh(Arts)', 'Eleventh(Commerce)', 'Eleventh(Science)',
    'Twelfth(Arts)', 'Twelfth(Commerce)', 'Twelfth(Science)',
  ];

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState('All Classes');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      let query = supabase.from('students').select('*');
      if (filterClass !== 'All Classes') {
        query = query.eq('class_name', filterClass);
      }
      const { data: studentsData, error: studentError } = await query;

      if (studentError) throw studentError;

      if (studentsData) {
        const { data: credsData } = await supabase.from('parent_credentials').select('*');
        const { data: mappingData } = await supabase.from('parent_student_mapping').select('*');

        const mergedData = studentsData.map((st) => {
          const activeIdentifier = st.student_id ? String(st.student_id).trim() : String(st.sr_no || '').trim();

          const mappedRow = mappingData?.find(m => 
            (st.student_id && String(m.student_id) === String(st.student_id)) ||
            (st.sr_no && String(m.sr_no) === String(st.sr_no))
          );

          let cred = null;
          if (mappedRow) {
            cred = credsData?.find(c => String(c.id) === String(mappedRow.parent_credential_id));
          }

          if (!cred) {
            cred = credsData?.find((c) => 
              (c.student_id && String(c.student_id).trim() === String(st.student_id || '').trim()) ||
              (c.sr_no && String(c.sr_no).trim() === String(st.sr_no || '').trim()) ||
              (c.mobile_number && st.mobile_number && String(c.mobile_number).trim() === String(st.mobile_number).trim())
            );
          }

          return {
            id: st.id,
            student_id: st.student_id || '',
            srNo: st.sr_no || 'N/A',
            name: st.student_full_name || 'Unknown',
            className: st.class_name || 'Unassigned',
            fatherName: st.father_name || 'N/A',
            mobile: st.mobile_number || st.whatsapp_number || 'N/A',
            whatsapp: st.whatsapp_number || st.mobile_number || 'N/A',
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

  const handleInputChange = (id, field, value) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  const handleSave = async (student) => {
    try {
      const payload = {
        portal_login_id: student.loginId,
        password: student.password,
        mobile_number: student.mobile !== 'N/A' ? student.mobile : null,
        whatsapp_number: student.whatsapp !== 'N/A' ? student.whatsapp : null,
        updated_at: new Date()
      };

      let parentCredUuid = student.credId;

      if (parentCredUuid) {
        const { error } = await supabase
          .from('parent_credentials')
          .update(payload)
          .eq('id', parentCredUuid);

        if (error) throw error;
      } else {
        const { data: existingCred } = await supabase
          .from('parent_credentials')
          .select('id')
          .eq('portal_login_id', student.loginId)
          .limit(1);

        if (existingCred && existingCred.length > 0) {
          parentCredUuid = existingCred[0].id;
        } else {
          const { data, error } = await supabase
            .from('parent_credentials')
            .insert([payload])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            parentCredUuid = data[0].id;
          }
        }
      }

      if (parentCredUuid) {
        const finalStudentId = student.student_id ? String(student.student_id).trim() : null;
        const finalSrNo = student.srNo && student.srNo !== 'N/A' ? String(student.srNo).trim() : null;

        const { data: existingMap } = await supabase
          .from('parent_student_mapping')
          .select('id')
          .eq('parent_credential_id', parentCredUuid)
          .or(`student_id.eq.${finalStudentId},sr_no.eq.${finalSrNo}`);

        if (!existingMap || existingMap.length === 0) {
          await supabase
            .from('parent_student_mapping')
            .insert([{
              parent_credential_id: parentCredUuid,
              student_id: finalStudentId,
              sr_no: finalSrNo
            }]);
        }
      }

      setSuccessMsg(`✅ ${student.name} ke Credentials & Mapping successfully save ho gaye!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchStudentsData();
    } catch (error) {
      alert('Error saving credentials: ' + error.message);
    }
  };

  const inputTheme = "w-full bg-[#F4F7F9] border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-inner";
  const tableInputTheme = "w-full min-w-[120px] bg-[#F4F7F9] border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-inner";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2">
          <ShieldCheck size={20} /> {successMsg}
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 p-6 md:p-8 rounded-3xl shadow-xl mb-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
              <UserCheck className="text-sky-300" size={32} />
              Parents Portal Credentials Manager
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
              Yahan se aap har class ke students ke Parents Portal Login ID aur Passwords manage kar sakte hain.
            </p>
          </div>
          <button 
            onClick={() => { setFilterClass('All Classes'); fetchStudentsData(); }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Reset
          </button>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4">
          <label className="text-xs font-black uppercase text-indigo-100 flex items-center gap-2">
            <Filter size={16} className="text-sky-300" /> Filter By Class:
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className={`${inputTheme} max-w-md text-slate-900 cursor-pointer`}
          >
            <option value="All Classes">All Classes</option>
            {classOptions.map((cls, index) => (
              <option key={index} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[11px] font-black uppercase border-b-2 border-slate-200">
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
                    <Loader2 className="animate-spin inline mr-2 text-indigo-600" size={24} /> Loading records...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-sm font-bold text-slate-600">
                      <div><span>SR: {student.srNo}</span></div>
                      {student.student_id && <div className="text-[11px] text-emerald-600 font-extrabold">ID: {student.student_id}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-black text-slate-800">{student.name}</div>
                      <div className="text-xs text-indigo-600 font-extrabold">Class: {student.className}</div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-600 uppercase">{student.fatherName}</td>
                    <td className="p-4 text-sm font-bold text-slate-500 text-center">{student.mobile}</td>
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
                    <td className="p-4 pr-6 text-center">
                      <button 
                        onClick={() => handleSave(student)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2 rounded-xl text-[12px] uppercase shadow-md cursor-pointer"
                      >
                        <Save size={15} className="inline mr-1" /> Save
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="p-12 text-center text-slate-400 font-bold">Koi student nahi mila.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}