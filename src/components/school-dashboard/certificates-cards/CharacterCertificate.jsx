'use client';

import { useState } from 'react';

const classOptions = [
  "PP3+", "PP4+", "PP5+", "First", "Second", "Third", "Fourth", "Fifth", 
  "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", 
  "Eleventh (Arts)", "Eleventh (Commerce)", "Eleventh (Science)", 
  "Twelfth (Arts)", "Twelfth (Commerce)", "Twelfth (Science)"
];

const sessionOptions = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];

export default function CharacterCertificate({ defaultClass = 'Fourth', defaultSession = '2026-27' }) {
  const [srNo, setSrNo] = useState('BSKA/2026/001');
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [selectedSession, setSelectedSession] = useState(defaultSession);
  
  const [studentName, setStudentName] = useState('RAHUL SHARMA');
  const [fatherName, setFatherName] = useState('MR. SURESH SHARMA');
  const [motherName, setMotherName] = useState('MRS. SUNITA SHARMA');
  const [conduct, setConduct] = useState('Good and Exemplary');
  const [issueDate, setIssueDate] = useState('04-09-2026');

  const handleWhatsAppShare = () => {
    const text = `*BLUE HEAVEN KIDS ACADEMY*\n*CHARACTER CERTIFICATE*\n\nS.R. No: ${srNo}\nStudent Name: ${studentName}\nFather's Name: ${fatherName}\nMother's Name: ${motherName}\nClass: ${selectedClass}\nSession: ${selectedSession}\nConduct: ${conduct}\nIssue Date: ${issueDate}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full">
      
      {/* प्रिंट के दौरान केवल सर्टिफिकेट दिखाने और बाकी सब छिपाने के लिए CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
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

      {/* Elite Control Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 print:hidden shadow-sm">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
              <span>🔍</span> SEARCH S.R. NO.
            </label>
            <input 
              type="text" 
              value={srNo}
              onChange={(e) => setSrNo(e.target.value)}
              className="bg-slate-50 text-slate-800 text-[14px] font-medium px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-sky-500 outline-none w-40 transition shadow-sm"
              placeholder="Enter S.R. No."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
              <span>🎓</span> SELECT CLASS
            </label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 text-slate-800 text-[14px] font-semibold px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-sky-500 outline-none transition shadow-sm cursor-pointer"
            >
              {classOptions.map((cls, idx) => <option key={idx} value={cls}>{cls}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
              <span>📅</span> SESSION
            </label>
            <select 
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-slate-50 text-slate-800 text-[14px] font-semibold px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-sky-500 outline-none transition shadow-sm cursor-pointer"
            >
              {sessionOptions.map((sess, idx) => <option key={idx} value={sess}>{sess}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleWhatsAppShare} 
            className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-[13px] font-bold px-4 py-2.5 rounded-lg shadow-[0_2px_0_#047857] active:shadow-[0_0_0_#047857] active:translate-y-[2px] transition cursor-pointer flex items-center gap-1.5"
          >
            <span>💬</span> WhatsApp
          </button>
          
          <button 
            onClick={() => window.print()} 
            className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-[13px] font-bold px-4 py-2.5 rounded-lg shadow-[0_2px_0_#0369a1] active:shadow-[0_0_0_#0369a1] active:translate-y-[2px] transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🖨️</span> Print / PDF
          </button>
        </div>
      </div>

      {/* डिटेल्स एडिटर पैनल (Live Form Editor) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden space-y-4">
        <h4 className="font-bold text-slate-800 text-[15px]">Character Certificate Details Editor:</h4>
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
            <label className="block font-bold text-slate-700 mb-1">Conduct / Character:</label>
            <input 
              type="text" 
              value={conduct} 
              onChange={(e) => setConduct(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Issue Date:</label>
            <input 
              type="text" 
              value={issueDate} 
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 🌟 Ultra-Colorful & Vibrant Master Certificate Layout */}
      <div id="printable-certificate" className="bg-white text-slate-900 rounded-xl shadow-sm p-10 sm:p-12 max-w-[850px] mx-auto relative print:m-0 print:shadow-none overflow-hidden border border-slate-200">
        
        {/* Top Colorful Decorative Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"></div>

        {/* Background Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-[220px] font-black uppercase tracking-widest text-slate-900">BHKA</span>
        </div>

        {/* Decorative Corner Borders */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-slate-300 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-slate-300 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-slate-300 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-slate-300 rounded-br-lg pointer-events-none"></div>

        {/* Header Section */}
        <div className="text-center border-b border-slate-200 pb-6 mb-6 relative">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-2xl">🎓</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wider uppercase">
              Blue Heaven Kids Academy
            </h2>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-[12px] font-semibold text-slate-500 tracking-widest uppercase">
            Affiliated to State Board &bull; Recognized Institution Code: BSKA-9921
          </p>
          <p className="text-[12px] font-semibold text-emerald-600 mt-1">
            Campus: Main Educational Hub, City Center &bull; Helpline: +91-9876543210
          </p>
          
          {/* Vibrant Certificate Title Badge */}
          <div className="mt-5 inline-block bg-sky-50 text-sky-800 font-bold text-[13px] tracking-wider px-6 py-2 rounded-lg shadow-sm uppercase border border-sky-200">
            ✨ Character Certificate ✨
          </div>
        </div>

        {/* Colorful Info Bar */}
        <div className="flex justify-between items-center text-[13px] font-bold px-6 py-3 bg-slate-50 rounded-xl border border-slate-200 mb-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[12px]">S.R. Number:</span>
            <span className="text-slate-800 font-bold text-[13px] bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">{srNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[12px]">Academic Session:</span>
            <span className="text-sky-700 font-bold text-[13px] bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">{selectedSession}</span>
          </div>
        </div>

        {/* Certificate Body Text */}
        <div className="space-y-6 text-[14px] sm:text-[15px] font-normal leading-relaxed text-slate-700 px-6 text-justify">
          <p>
            This is to certify that Master / Kumari <strong className="text-slate-900 font-bold uppercase underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{studentName}</strong>, son/daughter of Shri <strong className="text-slate-900 font-bold uppercase underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{fatherName}</strong> and Shrimati <strong className="text-slate-900 font-bold uppercase underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{motherName}</strong>, is a regular bonafide student of this institution enrolled in Class <strong className="text-slate-900 font-bold underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{selectedClass}</strong> during the academic session <span className="font-bold text-slate-900">{selectedSession}</span>.
          </p>
          <p>
            During the period spent in this academy, his/her conduct and moral character have been found to be <strong className="text-emerald-700 font-bold uppercase bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 shadow-sm inline-block">{conduct}</strong>. To the best of our knowledge and official school records, he/she bears a spotless moral character and has never been reported for any breach of discipline.
          </p>
          <p>
            We wish him/her grand success in all future academic pursuits, career endeavors, and walks of life.
          </p>
        </div>

        {/* Signatures & Footer Section */}
        <div className="mt-16 flex justify-between items-end pt-6 px-6 border-t border-slate-200">
          <div>
            <p className="text-[12px] font-semibold text-slate-500">Date of Issue: <span className="text-slate-800 font-bold">{issueDate}</span></p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Verified Digital Certificate Code: BHKA-CERT-98214</p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="w-20 h-20 mb-1 border border-dashed border-slate-300 rounded-full flex items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter shadow-sm">
              School Seal & Stamp
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-36 h-8 border-b border-slate-300 mb-1"></div>
            <p className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Principal Signature & Seal</p>
          </div>
        </div>

      </div>

    </div>
  );
}