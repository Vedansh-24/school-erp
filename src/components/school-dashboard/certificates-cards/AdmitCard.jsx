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
    <div className="max-w-4xl mx-auto space-y-6">
      
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
            border: 2px solid #312e81 !important;
          }
        }
      ` }} />

      {/* Light Theme Elite Control Bar */}
      <div className="bg-white/90 p-5 rounded-2xl border border-slate-200/90 shadow-xl flex flex-wrap items-center justify-between gap-5 print:hidden backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          
          {/* Search S.R. No. */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-700 flex items-center gap-1.5">
              <span>🔍</span> SEARCH S.R. NO.
            </label>
            <input 
              type="text" 
              value={srNo} 
              onChange={(e) => setSrNo(e.target.value)}
              className="bg-slate-50 text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none w-40 transition shadow-sm"
              placeholder="Enter S.R. No."
            />
          </div>

          {/* Select Class */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-700 flex items-center gap-1.5">
              <span>🎓</span> SELECT CLASS
            </label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 text-emerald-700 text-xs font-bold px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition shadow-sm cursor-pointer"
            >
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-extrabold text-amber-700 flex items-center gap-1.5">
              <span>📅</span> SESSION
            </label>
            <select 
              value={selectedSession} 
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-slate-50 text-amber-700 text-xs font-bold px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition shadow-sm cursor-pointer"
            >
              {sessionOptions.map((sess) => (
                <option key={sess} value={sess}>{sess}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3D Embossed Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleWhatsAppShare}
            className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-[0_4px_0_0_#065f46] hover:shadow-[0_2px_0_0_#065f46] active:shadow-[0_0_0_0_#065f46] transition-all transform hover:-translate-y-0.5 active:translate-y-1 flex items-center gap-2 border-t border-emerald-400 cursor-pointer"
          >
            <span className="text-sm">💬</span> WhatsApp
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gradient-to-b from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-[0_4px_0_0_#1e3a8a] hover:shadow-[0_2px_0_0_#1e3a8a] active:shadow-[0_0_0_0_#1e3a8a] transition-all transform hover:-translate-y-0.5 active:translate-y-1 flex items-center gap-2 border-t border-cyan-300 cursor-pointer"
          >
            <span className="text-sm">🖨️</span> Print / PDF
          </button>
        </div>
      </div>

      {/* डिटेल्स एडिटर पैनल (Light Theme) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 print:hidden space-y-4">
        <h4 className="font-black text-slate-800 text-sm">Identity Card Details Editor:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Student Name:</label>
            <input 
              type="text" 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Father's Name:</label>
            <input 
              type="text" 
              value={fatherName} 
              onChange={(e) => setFatherName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mother's Name:</label>
            <input 
              type="text" 
              value={motherName} 
              onChange={(e) => setMotherName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Date of Birth (DOB):</label>
            <input 
              type="text" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Blood Group:</label>
            <input 
              type="text" 
              value={bloodGroup} 
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Number:</label>
            <input 
              type="text" 
              value={contactNo} 
              onChange={(e) => setContactNo(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Residential Address:</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 🌟 Ultra-Colorful & Vibrant ID Card Format */}
      <div className="flex justify-center my-6">
        <div id="printable-id-card" className="bg-gradient-to-br from-white via-indigo-50/40 to-amber-50/30 text-slate-900 rounded-3xl shadow-2xl w-full max-w-[380px] relative print:m-0 print:shadow-none overflow-hidden border-4 border-indigo-900">
          
          {/* Top Colorful Decorative Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#FF6B8B] via-[#9D4EDD] via-[#00C9A7] to-[#FFB800]"></div>

          {/* Background Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="text-[140px] font-black uppercase tracking-widest text-indigo-900">BHKA</span>
          </div>

          {/* Decorative Corner Borders */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-600 rounded-tl-md pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500 rounded-tr-md pointer-events-none"></div>

          {/* Header Section */}
          <div className="text-center bg-white/80 pt-6 pb-4 px-4 relative border-b-2 border-indigo-200">
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-800">
              Blue Heaven Kids Academy
            </h2>
            <p className="text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-wide">
              Recognized Institution &bull; Session: {selectedSession}
            </p>
            <div className="mt-2.5 inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-0.5 rounded-full font-black text-[10px] tracking-widest uppercase shadow-md border border-amber-300">
              ✨ IDENTITY CARD ✨
            </div>
          </div>

          {/* Student Photo & Core Info */}
          <div className="p-5 relative z-10 flex flex-col items-center">
            
            {/* Photo Box */}
            <div className="w-24 h-28 border-2 border-dashed border-indigo-400 bg-indigo-50/60 rounded-xl shadow-inner flex flex-col items-center justify-center text-center p-1 mb-3 relative overflow-hidden">
              <span className="text-2xl mb-1">📷</span>
              <span className="text-[8px] font-bold text-indigo-600 uppercase leading-tight">Passport Photo</span>
            </div>

            {/* Student Name */}
            <h3 className="text-base font-black text-indigo-950 uppercase text-center tracking-wide mb-1 underline decoration-amber-500 decoration-2 underline-offset-4">
              {studentName}
            </h3>
            
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3 py-0.5 rounded-full uppercase shadow-sm mb-4">
              Class: {selectedClass}
            </span>

            {/* Detailed Info Box */}
            <div className="w-full bg-white/90 border border-indigo-100 rounded-2xl p-3.5 space-y-2 text-xs shadow-sm">
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">S.R. Number:</span>
                <span className="font-black text-indigo-950">{srNo}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Father's Name:</span>
                <span className="font-black text-slate-900 uppercase text-[11px]">{fatherName}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Date of Birth:</span>
                <span className="font-bold text-slate-800">{dob}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Blood Group:</span>
                <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">{bloodGroup}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Contact No:</span>
                <span className="font-bold text-slate-800">{contactNo}</span>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Address:</span>
                <span className="font-semibold text-slate-700 text-[11px] leading-snug">{address}</span>
              </div>
            </div>

          </div>

          {/* Footer Signatures & Stamp */}
          <div className="bg-indigo-950/5 text-slate-700 px-5 py-3.5 flex justify-between items-center text-center mt-2 border-t-2 border-indigo-200">
            <div>
              <div className="w-16 border-b-2 border-slate-400 mb-1 mx-auto"></div>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">Authorized</span>
            </div>
            
            <div className="w-12 h-12 bg-white rounded-full border border-dashed border-indigo-400 flex items-center justify-center text-[8px] font-black text-indigo-600 uppercase shadow-sm">
              SEAL
            </div>

            <div>
              <div className="w-16 border-b-2 border-slate-400 mb-1 mx-auto"></div>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">Principal</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}