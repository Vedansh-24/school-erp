'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CustomDatePicker = ({ value, onChange, label, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dateObj = value ? new Date(value) : new Date();

  const [currentYear, setCurrentYear] = useState(isNaN(dateObj.getFullYear()) ? new Date().getFullYear() : dateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(isNaN(dateObj.getMonth()) ? new Date().getMonth() : dateObj.getMonth());
  const [showYearList, setShowYearList] = useState(false);
  const containerRef = useRef(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 40 }, (_, i) => 1990 + i);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowYearList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${currentYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
    setShowYearList(false);
  };

  const handleTodayClick = () => {
    const todayStr = getTodayDate();
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onChange(todayStr);
    setIsOpen(false);
    setShowYearList(false);
  };

  const formattedDisplayDate = () => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = (getFirstDayOfMonth(currentYear, currentMonth) + 6) % 7;

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          readOnly
          required={required}
          value={formattedDisplayDate()}
          onClick={() => setIsOpen(!isOpen)}
          placeholder="DD/MM/YYYY"
          className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] placeholder-slate-400 focus:border-[#2F6690] outline-none shadow-sm font-medium cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-base cursor-pointer"
        >
          📅
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl p-3 w-72 text-xs select-none">
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-md mb-2">
            <button
              type="button"
              className="px-2 py-1 font-bold bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear((prev) => prev - 1);
                } else {
                  setCurrentMonth((prev) => prev - 1);
                }
              }}
            >
              &lt;
            </button>

            <div className="flex items-center gap-1 font-bold text-slate-700">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs outline-none cursor-pointer"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowYearList(!showYearList)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs hover:bg-slate-50 cursor-pointer"
              >
                {currentYear} ▾
              </button>
            </div>

            <button
              type="button"
              className="px-2 py-1 font-bold bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear((prev) => prev + 1);
                } else {
                  setCurrentMonth((prev) => prev + 1);
                }
              }}
            >
              &gt;
            </button>
          </div>

          {showYearList ? (
            <div className="h-48 overflow-y-auto grid grid-cols-3 gap-1 p-1 bg-slate-50 border rounded-md">
              {years.map((y) => (
                <button
                  type="button"
                  key={y}
                  onClick={() => {
                    setCurrentYear(y);
                    setShowYearList(false);
                  }}
                  className={`py-1.5 rounded text-center font-semibold text-xs cursor-pointer ${
                    y === currentYear
                      ? 'bg-[#2F6690] text-white'
                      : 'hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 text-center font-bold text-slate-500 mb-1">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDay }).map((_, idx) => (
                  <div key={`empty-${idx}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const formattedDay = String(day).padStart(2, '0');
                  const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                  const fullDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
                  const isSelected = value === fullDateStr;

                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleSelectDay(day)}
                      className={`p-1.5 rounded font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0284C7] text-white font-bold'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t text-center">
                <button
                  type="button"
                  onClick={handleTodayClick}
                  className="text-[#0284C7] font-bold hover:underline cursor-pointer"
                >
                  Today: {fullMonths[new Date().getMonth()].slice(0, 3)} {new Date().getDate()}, {new Date().getFullYear()}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function StudentRegistration() {
  const todayDate = getTodayDate();
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchSrNo, setSearchSrNo] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    studentName: '',
    studyingInClass: 'PP.3+',
    srNo: '',
    motherName: '',
    fatherName: '',
    mobileNumber: '',
    email: '',
    habitationOrLocality: '',
    mediumOfInstruction: 'Hindi',
    socialCategory: 'General (सामान्य)',
    gender: 'Boy (छात्र)',
    dob: todayDate,
    religion: 'Hindu',
    aadhaarNo: '',
    rteStatus: 'Not Applicable',
    admissionType: 'New Admission (नया प्रवेश)',
    dateOfAdmission: todayDate,
    annualFees: '',
    bplStatus: 'No',
    minorityStatus: 'No',
    previousClass: '',
    previousPercentage: '',
    cwsnType: 'Not Applicable',
    transportFacility: 'No',
    hostelFacility: 'No',
    session: '2026-27',
  });

  const classesList = [
    'PP.3+', 'PP.4+', 'PP.5+', 
    'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eight', 'Ninth', 'Tenth',
    'Eleventh (Arts)', 'Eleventh (Commerce)', 'Eleventh (Science)',
    'Twelth (Arts)', 'Twelth (Commerce)', 'Twelth (Science)'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const startCamera = async () => {
    try {
      setErrorMsg('');
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorMsg('Camera open nahi ho paya: ' + err.message);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(capturedFile);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleDownloadSampleExcel = () => {
    const headers = [
      "student_full_name", "class_name", "sr_no", "mother_name", "father_name", 
      "mobile_number", "email", "address", "medium_of_instruction", "category", 
      "gender", "dob", "religion", "aadhaar_no", "rte_status", 
      "admission_type", "admission_date", "annual_fees", "bpl_status", 
      "minority_status", "previous_class", "previous_percentage", "cwsn_type", 
      "transport_facility", "hostel_facility", "session"
    ];

    const sampleRow = [
      "Rahul Kumar", "First", "1001", "Sunita Devi", "Rajesh Kumar", 
      "9876543210", "rahul@email.com", "Jaipur", "Hindi", "General (सामान्य)", 
      "Boy (छात्र)", "2018-05-12", "Hindu", "", "Not Applicable", 
      "New Admission (नया प्रवेश)", "2026-04-01", "5000", "No", 
      "No", "PP.5+", "85%", "Not Applicable", "No", "No", "2026-27"
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sampleRow.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_sample_format.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');

        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          throw new Error('CSV file mein data nahi hai ya format galat hai.');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const studentsToUpsert = [];

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
          if (currentLine.length !== headers.length) continue;

          const studentObj = {};
          headers.forEach((header, index) => {
            studentObj[header] = currentLine[index] || '';
          });

          if (studentObj.sr_no) {
            studentsToUpsert.push(studentObj);
          }
        }

        if (studentsToUpsert.length === 0) {
          throw new Error('Koi valid student record nahi mila CSV file mein.');
        }

        const { error } = await supabase
          .from('students')
          .upsert(studentsToUpsert, { onConflict: 'sr_no' });

        if (error) throw error;

        setSuccessMsg(`Safaltapoorvak ${studentsToUpsert.length} students ka bulk upload ho gaya! 🎉`);
      } catch (err) {
        setErrorMsg('Bulk upload fail ho gaya: ' + err.message);
      } finally {
        setSubmitting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleFetchStudent = async () => {
    if (!searchSrNo.trim()) {
      setErrorMsg('Kripya SR Number enter karein fetch karne ke liye.');
      return;
    }

    setFetching(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('sr_no', searchSrNo.trim())
        .single();

      if (error) throw error;

      if (data) {
        setFormData(prev => ({
          ...prev,
          studentName: data.student_full_name || '',
          studyingInClass: data.class_name || 'PP.3+',
          srNo: data.sr_no || '',
          motherName: data.mother_name || '',
          fatherName: data.father_name || '',
          mobileNumber: data.mobile_number || '',
          email: data.email || '',
          habitationOrLocality: data.address || '',
          mediumOfInstruction: data.medium_of_instruction || 'Hindi',
          socialCategory: data.category || 'General (सामान्य)',
          gender: data.gender || 'Boy (छात्र)',
          dob: data.dob || todayDate,
          religion: data.religion || 'Hindu',
          aadhaarNo: data.aadhaar_no || '',
          rteStatus: data.rte_status || 'Not Applicable',
          admissionType: data.admission_type || 'New Admission (नया प्रवेश)',
          dateOfAdmission: data.admission_date || todayDate,
          annualFees: data.annual_fees || '',
          bplStatus: data.bpl_status || 'No',
          minorityStatus: data.minority_status || 'No',
          previousClass: data.previous_class || '',
          previousPercentage: data.previous_percentage || '',
          cwsnType: data.cwsn_type || 'Not Applicable',
          transportFacility: data.transport_facility || 'No',
          hostelFacility: data.hostel_facility || 'No',
          session: data.session || '2026-27',
        }));

        if (data.photo_url) {
          setPhotoPreview(data.photo_url);
        }

        setSuccessMsg(`SR No: ${searchSrNo} ka data safaltapoorvak load ho gaya hai! 🎉`);
      }
    } catch (error) {
      setErrorMsg('Data fetch nahi ho saka: ' + error.message);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, dateStr) => {
    setFormData((prev) => ({ ...prev, [name]: dateStr }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let photoUrl = photoPreview;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${formData.srNo || 'student'}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, photoFile, { upsert: true });

        if (uploadError) {
          console.warn('Photo upload warning:', uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('student-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('students')
        .upsert([
          {
            student_full_name: formData.studentName,
            class_name: formData.studyingInClass,
            sr_no: formData.srNo,
            mother_name: formData.motherName,
            father_name: formData.fatherName,
            mobile_number: formData.mobileNumber,
            email: formData.email,
            address: formData.habitationOrLocality,
            medium_of_instruction: formData.mediumOfInstruction,
            category: formData.socialCategory,
            gender: formData.gender,
            dob: formData.dob,
            photo_url: photoUrl,
            religion: formData.religion,
            aadhaar_no: formData.aadhaarNo,
            rte_status: formData.rteStatus,
            admission_type: formData.admissionType,
            admission_date: formData.dateOfAdmission,
            annual_fees: formData.annualFees,
            bpl_status: formData.bplStatus,
            minority_status: formData.minorityStatus,
            previous_class: formData.previousClass,
            previous_percentage: formData.previousPercentage,
            cwsn_type: formData.cwsnType,
            transport_facility: formData.transportFacility,
            hostel_facility: formData.hostelFacility,
            session: formData.session
          },
        ], { onConflict: 'sr_no' });

      if (error) throw error;

      setSuccessMsg('Student registration database me safaltapoorvak save ho gaya! 🎉');
      
    } catch (error) {
      setErrorMsg('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-[#1A2332] font-sans">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#1A2332] tracking-wide">
            Student Registration Form
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kripya छात्र की सभी आवश्यक जानकारी दर्ज करें। (<span className="text-red-500 font-bold">*</span> वाले फ़ील्ड्स अनिवार्य हैं)
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-300">
            <input
              type="text"
              value={searchSrNo}
              onChange={(e) => setSearchSrNo(e.target.value)}
              placeholder="Search SR No..."
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none w-28 font-semibold"
            />
            <button
              type="button"
              onClick={handleFetchStudent}
              disabled={fetching}
              className="bg-[#2F6690] hover:bg-[#1a415e] text-white px-3 py-1 rounded text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {fetching ? 'Fetching...' : '🔍 Fetch Data'}
            </button>
          </div>

          <button 
            type="button" 
            onClick={handleDownloadSampleExcel} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Download Sample Excel Format
          </button>
          
          <input
            type="file"
            ref={bulkFileInputRef}
            onChange={handleBulkUpload}
            accept=".csv"
            className="hidden"
          />

          <button 
            type="button" 
            onClick={() => bulkFileInputRef.current?.click()} 
            className="flex items-center gap-2 bg-[#2F6690] hover:bg-[#1a415e] text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Bulk Upload Students (Excel/CSV)
          </button>

          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
            Blue Heaven Kids Academy
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-bold shadow-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-bold shadow-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* Photo Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="w-24 h-28 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs text-center bg-white shadow-sm overflow-hidden relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Student Photo" className="w-full h-full object-cover" />
            ) : (
              <span>No Photo</span>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800">Student Passport Photo</h4>
            <p className="text-xs text-slate-500 font-medium">
              Upload image from gallery or capture live photo using camera.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-sm px-3.5 py-2 rounded-lg font-bold transition shadow-sm cursor-pointer"
              >
                📁 Upload Photo
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-sm px-3.5 py-2 rounded-lg font-bold transition shadow-sm cursor-pointer"
              >
                📷 Live Camera
              </button>
            </div>
          </div>
        </div>

        {isCameraActive && (
          <div className="p-4 bg-black/90 rounded-xl flex flex-col items-center gap-3">
            <video ref={videoRef} autoPlay playsInline className="w-64 h-48 rounded-lg bg-black object-cover border border-slate-700" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                📸 Capture Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                ❌ Close Camera
              </button>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="studentName" required value={formData.studentName} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Class <span className="text-red-500">*</span>
            </label>
            <select name="studyingInClass" required value={formData.studyingInClass} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              {classesList.map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              SR. No. <span className="text-red-500">*</span>
            </label>
            <input type="text" name="srNo" required value={formData.srNo} onChange={handleInputChange} placeholder="SR Number" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Mother Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="motherName" required value={formData.motherName} onChange={handleInputChange} placeholder="Mother Name" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Father Name</label>
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father Name" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              WhatsApp / Mobile <span className="text-red-500">*</span>
            </label>
            <input type="text" name="mobileNumber" required value={formData.mobileNumber} onChange={handleInputChange} placeholder="Mobile Number" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="student@email.com" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Residential Address (स्थाई पता)</label>
            <input type="text" name="habitationOrLocality" value={formData.habitationOrLocality} onChange={handleInputChange} placeholder="Enter House No., Street, Address" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Medium <span className="text-red-500">*</span></label>
            <select name="mediumOfInstruction" required value={formData.mediumOfInstruction} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
            <select name="socialCategory" required value={formData.socialCategory} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="General (सामान्य)">General (सामान्य)</option>
              <option value="OBC (अन्य पिछड़ा वर्ग)">OBC (अन्य पिछड़ा वर्ग)</option>
              <option value="SC (अनुसूचित जाति)">SC (अनुसूचित जाति)</option>
              <option value="ST (अनुसूचित जनजाति)">ST (अनुसूचित जनजाति)</option>
              <option value="MBC (एमबीसी)">MBC (एमबीसी)</option>
              <option value="EWS (ईडब्ल्यूएस)">EWS (ईडब्ल्यूएस)</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
            <select name="gender" required value={formData.gender} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="Boy (छात्र)">Boy (छात्र)</option>
              <option value="Girl (छात्रा)">Girl (छात्रा)</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <CustomDatePicker label="DOB (जन्म तिथि)" required={true} value={formData.dob} onChange={(dateStr) => handleDateChange('dob', dateStr)} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Religion</label>
            <select name="religion" value={formData.religion} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Sikh">Sikh</option>
              <option value="Christian">Christian</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Aadhaar No</label>
            <input type="text" name="aadhaarNo" value={formData.aadhaarNo} onChange={handleInputChange} placeholder="Aadhaar Number" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">RTE Status</label>
            <select name="rteStatus" value={formData.rteStatus} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="Not Applicable">Not Applicable</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Admission Type</label>
            <select name="admissionType" value={formData.admissionType} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="New Admission (नया प्रवेश)">New Admission (नया प्रवेश)</option>
              <option value="Promoted">Promoted</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <CustomDatePicker label="Admission Date" value={formData.dateOfAdmission} onChange={(dateStr) => handleDateChange('dateOfAdmission', dateStr)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Annual Fees</label>
            <input type="number" name="annualFees" value={formData.annualFees} onChange={handleInputChange} placeholder="₹ Amount" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">BPL Status</label>
            <select name="bplStatus" value={formData.bplStatus} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Minority Status</label>
            <select name="minorityStatus" value={formData.minorityStatus} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Previous Class</label>
            <input type="text" name="previousClass" value={formData.previousClass} onChange={handleInputChange} placeholder="e.g. PP.2" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Previous %</label>
            <input type="text" name="previousPercentage" value={formData.previousPercentage} onChange={handleInputChange} placeholder="e.g. 85%" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">CWSN Type</label>
            <select name="cwsnType" value={formData.cwsnType} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="Not Applicable">Not Applicable</option>
              <option value="Blindness">Blindness</option>
              <option value="Hearing Impairment">Hearing Impairment</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Transport Facility</label>
            <select name="transportFacility" value={formData.transportFacility} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Hostel Facility</label>
            <select name="hostelFacility" value={formData.hostelFacility} onChange={handleInputChange} className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-semibold">
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Session</label>
            <input type="text" name="session" value={formData.session} onChange={handleInputChange} placeholder="e.g. 2026-27" className="w-full bg-[#F5F7FA] border border-slate-300 rounded-lg p-3 text-sm text-[#1A2332] outline-none shadow-sm font-medium" />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2F6690] hover:bg-[#1a415e] text-white px-8 py-3 rounded-xl font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Saving Registration...' : 'Submit & Save Student'}
          </button>
        </div>

      </form>
    </div>
  );
}