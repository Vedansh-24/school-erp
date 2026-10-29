'use client';

import { useState } from 'react';

const classOptions = [
  "PP3+", "PP4+", "PP5+", "First", "Second", "Third", "Fourth", "Fifth", 
  "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", 
  "Eleventh (Arts)", "Eleventh (Commerce)", "Eleventh (Science)", 
  "Twelfth (Arts)", "Twelfth (Commerce)", "Twelfth (Science)"
];

const sessionOptions = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];

export default function IdCard({ defaultClass = 'Fourth', defaultSession = '2026-27' }) {
  const [srNo, setSrNo] = useState('BSKA/2026/001');
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [selectedSession, setSelectedSession] = useState(defaultSession);
  
  const [studentName, setStudentName] = useState('RAHUL SHARMA');
  const [fatherName, setFatherName] = useState('MR. SURESH SHARMA');
  const [motherName, setMotherName] = useState('MRS. SUNITA SHARMA');
  const [dob, setDob] = useState('12-05-2016');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [contactNo, setContactNo] = useState('+91-9876543210');
  const [address, setAddress] = useState('Main Market, City Center, Jaipur');
  const [issueDate, setIssueDate] = useState('04-09-2026');

  const handleWhatsAppShare = () => {
    const text = `*BLUE HEAVEN KIDS ACADEMY*\n*STUDENT IDENTITY CARD*\n\nS.R. No: ${srNo}\nStudent Name: ${studentName}\nFather's Name: ${fatherName}\nClass: ${selectedClass}\nSession: ${selectedSession}\nBlood Group: ${bloodGroup}\nContact: ${contactNo}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full">
      
      {/* प्रिंट के दौरान केवल आईडी कार्ड दिखाने और बाकी सब छिपाने के लिए CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-id-card, #printable-id-card * {
            visibility: visible;
          }
          #printable-id-card {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 380px;
            margin: 0;
            padding: 5px;
            box-shadow: none !important;
            border: 2px solid #cbd5e1 !important;
          }
        }
      ` }} />

      {/* टॉप कंट्रोल बार */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 print:hidden shadow-sm">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          
          {/* Search S.R. No. */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase flex items-center gap-1.5">
              🔍 SEARCH S.R. NO.
            </label>
            <input 
              type="text" 
              value={srNo} 
              onChange={(e) => setSrNo(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-lg text-[14px] font-medium focus:outline-none focus:border-sky-500 w-36 shadow-sm"
              placeholder="Enter S.R. No."
            />
          </div>

          {/* Select Class */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase flex items-center gap-1.5">
              🎓 SELECT CLASS
            </label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold focus:outline-none focus:border-sky-500 w-48 cursor-pointer shadow-sm"
            >
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase flex items-center gap-1.5">
              📅 SESSION
            </label>
            <select 
              value={selectedSession} 
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold focus:outline-none focus:border-sky-500 w-36 cursor-pointer shadow-sm"
            >
              {sessionOptions.map((sess) => (
                <option key={sess} value={sess}>{sess}</option>
              ))}
            </select>
          </div>
        </div>

        {/* WhatsApp & Print/PDF Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleWhatsAppShare}
            className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg text-[13px] shadow-[0_2px_0_#047857] active:shadow-[0_0_0_#047857] active:translate-y-[2px] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>💬</span> WhatsApp
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold px-4 py-2.5 rounded-lg text-[13px] shadow-[0_2px_0_#0369a1] active:shadow-[0_0_0_#0369a1] active:translate-y-[2px] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️</span> Print / PDF
          </button>
        </div>
      </div>

      {/* डिटेल्स एडिटर पैनल */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden space-y-4">
        <h4 className="font-bold text-slate-800 text-[15px]">Identity Card Details Editor:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Student Name:</label>
            <input 
              type="text" 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Father's Name:</label>
            <input 
              type="text" 
              value={fatherName} 
              onChange={(e) => setFatherName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mother's Name:</label>
            <input 
              type="text" 
              value={motherName} 
              onChange={(e) => setMotherName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Date of Birth (DOB):</label>
            <input 
              type="text" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Blood Group:</label>
            <input 
              type="text" 
              value={bloodGroup} 
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Number:</label>
            <input 
              type="text" 
              value={contactNo} 
              onChange={(e) => setContactNo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Residential Address:</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* आईडी कार्ड फॉर्मेट */}
      <div className="flex justify-center my-6">
        <div id="printable-id-card" className="bg-white text-slate-900 rounded-2xl shadow-sm w-full max-w-[380px] relative print:m-0 print:shadow-none overflow-hidden border border-slate-200">
          
          {/* Top Colorful Decorative Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"></div>

          {/* Background Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <span className="text-[140px] font-black uppercase tracking-widest text-slate-900">BHKA</span>
          </div>

          {/* Decorative Corner Borders */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-300 rounded-tl-md pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-300 rounded-tr-md pointer-events-none"></div>

          {/* Header Section */}
          <div className="text-center bg-white pt-6 pb-4 px-4 relative border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-800">
              Blue Heaven Kids Academy
            </h2>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">
              Recognized Institution &bull; Session: {selectedSession}
            </p>
            <div className="mt-3 inline-block bg-sky-50 text-sky-800 px-5 py-1 rounded-lg font-bold text-[11px] tracking-wider uppercase shadow-sm border border-sky-200">
              ✨ IDENTITY CARD ✨
            </div>
          </div>

          {/* Student Photo & Core Info */}
          <div className="p-5 relative z-10 flex flex-col items-center">
            
            {/* Photo Box */}
            <div className="w-24 h-28 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl shadow-sm flex flex-col items-center justify-center text-center p-1 mb-3 relative overflow-hidden">
              <span className="text-2xl mb-1">📷</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Passport Photo</span>
            </div>

            {/* Student Name */}
            <h3 className="text-base font-bold text-slate-900 uppercase text-center tracking-wide mb-1 underline decoration-sky-400 decoration-2 underline-offset-4">
              {studentName}
            </h3>
            
            <span className="bg-sky-50 text-sky-800 border border-sky-200 font-bold text-xs px-3 py-0.5 rounded-full uppercase shadow-sm mb-4">
              Class: {selectedClass}
            </span>

            {/* Detailed Info Box */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs shadow-sm">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">S.R. Number:</span>
                <span className="font-bold text-slate-800">{srNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Father's Name:</span>
                <span className="font-bold text-slate-800 uppercase text-[11px]">{fatherName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Date of Birth:</span>
                <span className="font-bold text-slate-800">{dob}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Blood Group:</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">{bloodGroup}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Contact No:</span>
                <span className="font-bold text-slate-800">{contactNo}</span>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Address:</span>
                <span className="font-medium text-slate-700 text-[11px] leading-snug">{address}</span>
              </div>
            </div>

          </div>

          {/* Footer Signatures & Stamp */}
          <div className="bg-slate-50 text-slate-700 px-5 py-3.5 flex justify-between items-center text-center mt-2 border-t border-slate-200">
            <div>
              <div className="w-20 border-b border-slate-300 mb-1 mx-auto"></div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Authorized</span>
            </div>
            
            <div className="w-12 h-12 bg-white rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase shadow-sm">
              SEAL
            </div>

            <div>
              <div className="w-20 border-b border-slate-300 mb-1 mx-auto"></div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Principal</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}