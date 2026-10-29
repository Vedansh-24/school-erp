'use client';

import { useState } from 'react';

const classOptions = [
  "PP3+", "PP4+", "PP5+", "First", "Second", "Third", "Fourth", "Fifth", 
  "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", 
  "Eleventh (Arts)", "Eleventh (Commerce)", "Eleventh (Science)", 
  "Twelfth (Arts)", "Twelfth (Commerce)", "Twelfth (Science)"
];

const sessionOptions = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];

export default function GatePass({ defaultClass = 'Fourth', defaultSession = '2026-27' }) {
  const [srNo, setSrNo] = useState('BSKA/2026/001');
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [selectedSession, setSelectedSession] = useState(defaultSession);
  
  const [studentName, setStudentName] = useState('RAHUL SHARMA');
  const [fatherName, setFatherName] = useState('MR. SURESH SHARMA');
  const [visitorName, setVisitorName] = useState('MR. ANIL SHARMA (UNCLE)');
  const [reason, setReason] = useState('Urgent Medical Checkup / Early Leave');
  const [exitTime, setExitTime] = useState('11:30 AM');
  const [issueDate, setIssueDate] = useState('04-09-2026');

  const handleWhatsAppShare = () => {
    const text = `*BLUE HEAVEN KIDS ACADEMY*\n*OFFICIAL GATE PASS*\n\nS.R. No: ${srNo}\nStudent Name: ${studentName}\nClass: ${selectedClass}\nVisitor Name: ${visitorName}\nReason: ${reason}\nExit Time: ${exitTime}\nDate: ${issueDate}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* प्रिंट के दौरान केवल गेट पास दिखाने और बाकी सब छिपाने के लिए CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-gate-pass, #printable-gate-pass * {
            visibility: visible;
          }
          #printable-gate-pass {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
            box-shadow: none !important;
            border: none !important;
          }
        }
      ` }} />

      {/* Light Theme Elite Control Bar */}
      <div className="bg-white/90 p-5 rounded-2xl border border-slate-200/90 shadow-xl flex flex-wrap items-center justify-between gap-5 print:hidden backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-4 flex-1">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-700 flex items-center gap-1.5">
              <span>🎓</span> SELECT CLASS
            </label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 text-emerald-700 text-xs font-bold px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition shadow-sm cursor-pointer"
            >
              {classOptions.map((cls, idx) => <option key={idx} value={cls}>{cls}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-extrabold text-amber-700 flex items-center gap-1.5">
              <span>📅</span> SESSION
            </label>
            <select 
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-slate-50 text-amber-700 text-xs font-bold px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition shadow-sm cursor-pointer"
            >
              {sessionOptions.map((sess, idx) => <option key={idx} value={sess}>{sess}</option>)}
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

      {/* डिटेल्स एडिटर पैनल (Live Form Editor) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 print:hidden space-y-4">
        <h4 className="font-black text-slate-800 text-sm">Gate Pass Details Editor:</h4>
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
            <label className="block font-bold text-slate-700 mb-1">Visitor / Guardian Name:</label>
            <input 
              type="text" 
              value={visitorName} 
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Exit Time:</label>
            <input 
              type="text" 
              value={exitTime} 
              onChange={(e) => setExitTime(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Reason for Leaving:</label>
            <input 
              type="text" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Date:</label>
            <input 
              type="text" 
              value={issueDate} 
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 🌟 Ultra-Colorful & Vibrant Master Gate Pass Layout */}
      <div id="printable-gate-pass" className="bg-gradient-to-br from-white via-indigo-50/40 to-amber-50/30 text-slate-900 rounded-3xl shadow-2xl p-8 sm:p-10 max-w-[850px] mx-auto relative print:m-0 print:shadow-none overflow-hidden border-4 border-indigo-900">
        
        {/* Top Colorful Decorative Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#FF6B8B] via-[#9D4EDD] via-[#00C9A7] to-[#FFB800]"></div>

        {/* Background Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[220px] font-black uppercase tracking-widest text-indigo-900">BHKA</span>
        </div>

        {/* Decorative Corner Borders */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-indigo-600 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-amber-500 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-emerald-600 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-purple-600 rounded-br-lg pointer-events-none"></div>

        {/* Header Section */}
        <div className="text-center border-b-2 border-indigo-200 pb-5 mb-5 relative">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-3xl animate-bounce">🚪</span>
            <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-800 tracking-wider uppercase drop-shadow-sm">
              Blue Heaven Kids Academy
            </h2>
            <span className="text-3xl animate-bounce">🛡️</span>
          </div>
          <p className="text-xs font-bold text-slate-600 tracking-widest uppercase">
            Affiliated to State Board &bull; Recognized Institution Code: BSKA-9921
          </p>
          <p className="text-xs font-bold text-emerald-700 mt-1">
            Campus: Main Educational Hub, City Center &bull; Helpline: +91-9876543210
          </p>
          
          {/* Vibrant Gate Pass Title Badge */}
          <div className="mt-4 inline-block bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-black text-sm tracking-widest px-10 py-2 rounded-full shadow-xl uppercase border-2 border-amber-300">
            ✨ Official Gate Pass / Exit Authorization ✨
          </div>
        </div>

        {/* Colorful Info Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs font-bold px-6 py-3 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-emerald-900/10 rounded-2xl border border-indigo-200 mb-6 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-blue-900 font-extrabold uppercase">S.R. Number:</span>
            <span className="text-indigo-950 font-black text-sm bg-white px-3 py-1 rounded-lg border border-blue-300 shadow-sm">{srNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-900 font-extrabold uppercase">Exit Time:</span>
            <span className="text-red-700 font-black text-sm bg-white px-3 py-1 rounded-lg border border-red-300 shadow-sm">{exitTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-900 font-extrabold uppercase">Date:</span>
            <span className="text-amber-700 font-black text-sm bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-sm">{issueDate}</span>
          </div>
        </div>

        {/* Student & Visitor Details Box */}
        <div className="bg-white/90 p-5 rounded-2xl border border-indigo-100 shadow-sm mb-6 space-y-3 text-xs sm:text-sm font-semibold text-slate-800">
          <div className="grid grid-cols-3 border-b border-indigo-100 pb-2">
            <span className="text-slate-500 font-bold uppercase">Student Name:</span>
            <span className="col-span-2 font-black text-indigo-950 uppercase text-base">{studentName}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-indigo-100 pb-2">
            <span className="text-slate-500 font-bold uppercase">Father's Name:</span>
            <span className="col-span-2 font-black text-slate-900 uppercase">{fatherName}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-indigo-100 pb-2">
            <span className="text-slate-500 font-bold uppercase">Class & Session:</span>
            <span className="col-span-2 font-black text-emerald-700 uppercase">{selectedClass} &bull; <span className="text-purple-800">{selectedSession}</span></span>
          </div>
          <div className="grid grid-cols-3 border-b border-indigo-100 pb-2">
            <span className="text-slate-500 font-bold uppercase">Visitor / Guardian:</span>
            <span className="col-span-2 font-black text-blue-900 uppercase">{visitorName}</span>
          </div>
          <div className="grid grid-cols-3 pb-1">
            <span className="text-slate-500 font-bold uppercase">Reason for Exit:</span>
            <span className="col-span-2 font-black text-red-600 bg-red-50 p-1.5 rounded border border-red-200">{reason}</span>
          </div>
        </div>

        {/* Security Note / Instructions */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-8 text-xs text-amber-900">
          <p className="font-black uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
            <span>⚠️</span> Security Instruction:
          </p>
          <p className="font-medium text-amber-900/90 leading-relaxed">
            This pass is valid only for the date and time mentioned above. Security guards are requested to verify the visitor's identity before permitting exit from the school premises.
          </p>
        </div>

        {/* Signatures & Footer Section */}
        <div className="flex justify-between items-end pt-4 px-2 border-t-2 border-indigo-200">
          <div className="text-center">
            <div className="w-32 h-8 border-b-2 border-slate-700 mb-1"></div>
            <p className="text-xs font-black text-indigo-950 uppercase tracking-wide">Security Guard Sign</p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="w-20 h-20 mb-1 border-2 border-dashed border-indigo-400 rounded-full flex items-center justify-center bg-indigo-50/80 text-[9px] font-bold text-indigo-600 uppercase tracking-tighter shadow-md">
              School Seal & Stamp
            </div>
          </div>

          <div className="text-center">
            <div className="w-32 h-8 border-b-2 border-slate-700 mb-1"></div>
            <p className="text-xs font-black text-indigo-950 uppercase tracking-wide">Authorized Signatory</p>
          </div>
        </div>

      </div>

    </div>
  );
}