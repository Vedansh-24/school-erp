'use client';
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StudentsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const initialFormState = {
    srNo: '',
    name: '',
    dob: '',
    father: '',
    mother: '',
    studentClass: 'PP3+',
    category: 'General (सामान्य)',
    gender: 'Boy (छात्र)',
    mobile: '',
    address: '',
    medium: 'Hindi',
    rte: 'Not Applicable',
    admissionType: 'New Admission (नया प्रवेश)',
    admissionDate: '25/07/2026',
    annualFee: '',
    photo: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [students, setStudents] = useState([]);

  const classList = [
    'PP.3+', 'PP.4+', 'PP.5+',
    'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eight', 'Ninth', 'Tenth',
    'Eleventh (Arts)', 'Eleventh (Commerce)', 'Eleventh (Science)',
    'Twelth (Arts)', 'Twelth (Commerce)', 'Twelth (Science)'
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  // 1. Fetch Students Data from Supabase
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedStudents = data.map((item) => ({
          id: item.id,
          srNo: item.sr_no || '',
          name: item.student_full_name || '',
          dob: item.dob || '-',
          father: item.father_name || '-',
          mother: item.mother_name || '-',
          studentClass: item.class_name || 'PP.3+',
          category: Array.isArray(item.category) ? item.category : [item.category || 'General (सामान्य)'],
          gender: item.gender || 'Boy (छात्र)',
          mobile: item.mobile_number || '-',
          address: item.address || '',
          medium: item.medium_of_instruction || 'Hindi',
          rte: item.rte_status || 'Not Applicable',
          admissionType: item.admission_type || 'New Admission (नया प्रवेश)',
          admissionDate: item.admission_date || '',
          annualFee: item.annual_fees || 0,
          photo: item.photo_url || ''
        }));
        setStudents(formattedStudents);
      }
    } catch (err) {
      console.error('Error fetching students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Camera Handlers
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("कैमरा एक्सेस नहीं मिल पाया। कृपया फाइल अपलोड का उपयोग करें।");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/jpeg');
      setFormData({ ...formData, photo: imageUrl });
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      srNo: student.srNo,
      name: student.name,
      dob: student.dob !== '-' ? student.dob : '',
      father: student.father !== '-' ? student.father : '',
      mother: student.mother !== '-' ? student.mother : '',
      studentClass: student.studentClass,
      category: Array.isArray(student.category) ? student.category[0] : student.category,
      gender: student.gender,
      mobile: student.mobile !== '-' ? student.mobile : '',
      address: student.address,
      medium: student.medium,
      rte: student.rte,
      admissionType: student.admissionType,
      admissionDate: student.admissionDate,
      annualFee: student.annualFee,
      photo: student.photo
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`क्या आप ${name} का रिकॉर्ड हटाना चाहते हैं?`)) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('स्टूडेंट का रिकॉर्ड सफलतापूर्वक हटा दिया गया है!');
      fetchStudents();
    } catch (err) {
      alert('हटाने में त्रुटि: ' + err.message);
    }
  };

  const handleSummary = (student) => {
    alert(`Summary / Passbook for: ${student.name} (SR No: ${student.srNo})\nAnnual Fee: ₹${student.annualFee}`);
  };

  // Save (Add / Update) Student Data
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.srNo) {
      alert('कृपया छात्र का नाम और SR No भरें!');
      return;
    }

    setLoading(true);
    const payload = {
      student_full_name: formData.name.toUpperCase(),
      class_name: formData.studentClass,
      sr_no: formData.srNo,
      mother_name: formData.mother.toUpperCase(),
      father_name: formData.father.toUpperCase(),
      mobile_number: formData.mobile,
      address: formData.address,
      medium_of_instruction: formData.medium,
      category: formData.category,
      gender: formData.gender,
      dob: formData.dob,
      rte_status: formData.rte,
      admission_type: formData.admissionType,
      admission_date: formData.admissionDate,
      annual_fees: formData.annualFee ? parseFloat(formData.annualFee) : 0,
      photo_url: formData.photo
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        alert('स्टूडेंट अपडेट हो गया है!');
      } else {
        const { error } = await supabase
          .from('students')
          .insert([payload]);

        if (error) throw error;
        alert('स्टूडेंट का डेटा सफलतापूर्वक सेव हो गया है!');
      }

      setIsModalOpen(false);
      stopCamera();
      setFormData(initialFormState);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      alert('एरर: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Filter Students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.srNo.includes(searchTerm) ||
      student.mobile.includes(searchTerm);
    
    const matchesClass = selectedClass === '' || student.studentClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  // 2. Classwise Sorting (Small to Large Class) & Alphabetical Name Sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const indexA = classList.indexOf(a.studentClass);
    const indexB = classList.indexOf(b.studentClass);

    const posA = indexA === -1 ? 999 : indexA;
    const posB = indexB === -1 ? 999 : indexB;

    if (posA !== posB) {
      return posA - posB;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6 text-slate-800 font-sans flex flex-col h-full">
      <div className="p-4 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-500 focus-within:bg-white transition-all w-full md:w-72 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search (Name, SR No, Mobile)..." 
              className="bg-transparent text-[14px] text-slate-800 outline-none ml-2 w-full placeholder-slate-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="bg-slate-50/80 border border-slate-200 text-[14px] text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner font-semibold"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classList.map((cls, idx) => (
              <option key={idx} value={cls}>{cls}</option>
            ))}
          </select>

          <button 
            onClick={() => { setSearchTerm(''); setSelectedClass(''); fetchStudents(); }}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-[14px] font-semibold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            Refresh
          </button>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <span className="text-base font-bold">+</span> Add Student
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Photo</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">SR No</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Student Name</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Parents Name</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Class</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Category</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Gender</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Mobile No.</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider border-r border-slate-200">Fee</th>
              <th className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedStudents.length > 0 ? (
              sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 border-r border-slate-100">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
                      {student.photo ? (
                        <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[14px] text-indigo-600 font-bold">{student.name.charAt(0)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[14px] font-medium text-slate-800 border-r border-slate-100">{student.srNo}</td>
                  <td className="px-4 py-3.5 border-r border-slate-100">
                    <div className="font-bold text-[14px] text-slate-900 tracking-wide">{student.name}</div>
                    <div className="text-[12px] text-slate-400 mt-0.5 font-normal">DOB: {student.dob}</div>
                  </td>
                  <td className="px-4 py-3.5 border-r border-slate-100">
                    <div className="text-[13px] text-slate-600 font-normal">F: {student.father}</div>
                    <div className="text-[13px] text-slate-600 mt-0.5 font-normal">M: {student.mother}</div>
                  </td>
                  <td className="px-4 py-3.5 text-[14px] font-semibold text-slate-800 border-r border-slate-100">{student.studentClass}</td>
                  <td className="px-4 py-3.5 border-r border-slate-100">
                    <div className="flex gap-1.5">
                      {student.category.map((tag, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 text-[12px] px-2.5 py-1 rounded-lg font-semibold border border-indigo-100/60 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[14px] font-medium text-slate-700 border-r border-slate-100">{student.gender}</td>
                  <td className="px-4 py-3.5 text-[14px] font-semibold text-slate-800 border-r border-slate-100">{student.mobile}</td>
                  <td className="px-4 py-3.5 text-[14px] font-bold text-slate-900 border-r border-slate-100">₹{student.annualFee}</td>
                  
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2.5">
                      {/* Edit Button with Pencil Icon */}
                      <button 
                        onClick={() => handleEdit(student)}
                        className="bg-gradient-to-b from-sky-400 to-sky-500 hover:brightness-110 text-white font-bold py-1.5 px-3 rounded-lg text-[13px] border border-sky-600 shadow-[0_4px_0_#0284c7] active:shadow-[0_0px_0_#0284c7] active:translate-y-[4px] transition-all duration-75 cursor-pointer flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      {/* Delete Button with Trash Icon */}
                      <button 
                        onClick={() => handleDelete(student.id, student.name)}
                        className="bg-gradient-to-b from-red-500 to-red-600 hover:brightness-110 text-white font-bold py-1.5 px-3 rounded-lg text-[13px] border border-red-700 shadow-[0_4px_0_#b91c1c] active:shadow-[0_0px_0_#b91c1c] active:translate-y-[4px] transition-all duration-75 cursor-pointer flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>

                      {/* Passbook Button with Book Icon */}
                      <button 
                        onClick={() => handleSummary(student)}
                        className="bg-gradient-to-b from-amber-400 to-amber-500 hover:brightness-110 text-slate-900 font-bold py-1.5 px-3 rounded-lg text-[13px] border border-amber-600 shadow-[0_4px_0_#d97706] active:shadow-[0_0px_0_#d97706] active:translate-y-[4px] transition-all duration-75 cursor-pointer flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Passbook</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-10 text-slate-400 text-[14px] font-medium">
                  {loading ? 'डेटा लोड हो रहा है...' : 'कोई छात्र नहीं मिला।'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-6 md:p-8 shadow-2xl text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-[20px] font-bold text-slate-900 tracking-wide">
                {editingId ? 'Edit Student Details' : 'Student Registration Form'}
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsModalOpen(false); stopCamera(); }} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
              </div>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-5">
              <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-2xl shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white flex items-center justify-center shadow-sm shrink-0">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[12px] text-slate-400 text-center px-1 font-medium">No Photo</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-slate-900 mb-0.5">Student Passport Photo</label>
                    <p className="text-[13px] text-slate-500 font-normal">Upload image from gallery or capture live photo.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[13px] px-4 py-2.5 rounded-xl font-semibold text-center cursor-pointer shadow-sm transition">
                    📁 Upload Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button type="button" onClick={startCamera} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[13px] px-4 py-2.5 rounded-xl font-semibold shadow-sm transition cursor-pointer">📷 Live Camera</button>
                </div>
              </div>

              {isCameraActive && (
                <div className="flex flex-col items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-48 h-36 rounded-xl border border-slate-200 object-cover mb-3 shadow-sm" />
                  <div className="flex gap-3">
                    <button type="button" onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] px-4 py-2 rounded-xl font-semibold shadow-sm transition cursor-pointer">Capture</button>
                    <button type="button" onClick={stopCamera} className="bg-rose-600 hover:bg-rose-500 text-white text-[13px] px-4 py-2 rounded-xl font-semibold shadow-sm transition cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input type="text" required placeholder="Full Name" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Class (कक्षा) *</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-semibold cursor-pointer" value={formData.studentClass} onChange={(e) => setFormData({...formData, studentClass: e.target.value})}>
                    {classList.map((cls, idx) => (<option key={idx} value={cls}>{cls}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">SR. No. *</label>
                  <input type="text" required placeholder="SR Number" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.srNo} onChange={(e) => setFormData({...formData, srNo: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Mother Name</label>
                  <input type="text" placeholder="Mother Name" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.mother} onChange={(e) => setFormData({...formData, mother: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Father Name</label>
                  <input type="text" placeholder="Father Name" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.father} onChange={(e) => setFormData({...formData, father: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">WhatsApp / Mobile</label>
                  <input type="text" placeholder="Mobile Number" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Residential Address (स्थाई पता)</label>
                  <input type="text" placeholder="Enter House No., Street, Village/City Address" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Medium</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-semibold cursor-pointer" value={formData.medium} onChange={(e) => setFormData({...formData, medium: e.target.value})}>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Caste / Category (जाति वर्ग)</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-semibold cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="General (सामान्य)">General (सामान्य)</option>
                    <option value="OBC (अन्य पिछड़ा वर्ग)">OBC (अन्य पिछड़ा वर्ग)</option>
                    <option value="SC (अनुसूचित जाति)">SC (अनुसूचित जाति)</option>
                    <option value="ST (अनुसूचित जनजाति)">ST (अनुसूचित जनजाति)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Gender</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-semibold cursor-pointer" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="Boy (छात्र)">Boy (छात्र)</option>
                    <option value="Girl (छात्रा)">Girl (छात्रा)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">DOB (DD/MM/YYYY)</label>
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">RTE Student (आर.टी.ई)</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-semibold cursor-pointer" value={formData.rte} onChange={(e) => setFormData({...formData, rte: e.target.value})}>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Admission Type</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-semibold cursor-pointer" value={formData.admissionType} onChange={(e) => setFormData({...formData, admissionType: e.target.value})}>
                    <option value="New Admission (नया प्रवेश)">New Admission (नया प्रवेश)</option>
                    <option value="Old Admission (पुराना प्रवेश)">Old Admission (पुराना प्रवेश)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Admission Date</label>
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.admissionDate} onChange={(e) => setFormData({...formData, admissionDate: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">Annual Fees (₹)</label>
                  <input type="number" placeholder="Annual Fee" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-[14px] text-slate-800 focus:bg-white focus:border-indigo-500 outline-none shadow-inner font-medium" value={formData.annualFee} onChange={(e) => setFormData({...formData, annualFee: e.target.value})} />
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-7 py-3 rounded-xl text-[14px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50">
                  {loading ? 'Saving...' : editingId ? 'Update Student Details' : 'Save Student Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}