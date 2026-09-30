'use client';

import { useState } from 'react';

const classOptions = [
  "PP3+", "PP4+", "PP5+", "First", "Second", "Third", "Fourth", "Fifth", 
  "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", 
  "Eleventh (Arts)", "Eleventh (Commerce)", "Eleventh (Science)", 
  "Twelfth (Arts)", "Twelfth (Commerce)", "Twelfth (Science)"
];

const sessionOptions = [
  "2024-25", "2025-26", "2026-2027","2027-2028","2028-2029","2029-2030"
];

export default function BonafideCertificate({ defaultClass = 'Fourth', defaultSession = '2025-26' }) {
  const [srNo, setSrNo] = useState('BSKA/2026/001');
  const [className, setClassName] = useState(defaultClass);
  const [session, setSession] = useState(defaultSession);
  const [studentName, setStudentName] = useState('ROHIT KUMAR');
  const [fatherName, setFatherName] = useState('MR. ANIL KUMAR');
  const [motherName, setMotherName] = useState('MRS. SUNITA DEVI');
  const [dob, setDob] = useState('15-05-2015');
  const [issueDate, setIssueDate] = useState('04-09-2026');

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*BLUE HEAVEN KIDS ACADEMY*\n*BONAFIDE CERTIFICATE*\n\nSR No: ${srNo}\nStudent Name: ${studentName}\nFather's Name: ${fatherName}\nMother's Name: ${motherName}\nClass: ${className}\nSession: ${session}\nDate of Birth: ${dob}\nIssue Date: ${issueDate}`;
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
              value={className} 
              onChange={(e) => setClassName(e.target.value)}
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
              value={session} 
              onChange={(e) => setSession(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold focus:outline-none focus:border-sky-500 w-32 cursor-pointer shadow-sm"
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
            onClick={handlePrint}
            className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold px-4 py-2.5 rounded-lg text-[13px] shadow-[0_2px_0_#0369a1] active:shadow-[0_0_0_#0369a1] active:translate-y-[2px] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️</span> Print / PDF
          </button>
        </div>
      </div>

      {/* डिटेल्स एडिटर पैनल */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden space-y-4">
        <h4 className="font-bold text-slate-800 text-[15px]">Bonafide Certificate Details Editor:</h4>
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
            <label className="block font-bold text-slate-700 mb-1">SR No:</label>
            <input 
              type="text" 
              value={srNo} 
              onChange={(e) => setSrNo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Class:</label>
            <select 
              value={className} 
              onChange={(e) => setClassName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm"
            >
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Session:</label>
            <select 
              value={session} 
              onChange={(e) => setSession(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm"
            >
              {sessionOptions.map((sess) => (
                <option key={sess} value={sess}>{sess}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* सर्टिफिकेट फॉर्मेट (id="printable-certificate" की वजह से प्रिंट में अब केवल यही आएगा) */}
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

        <div className="p-6 sm:p-8 bg-white text-slate-900 relative">
          
          {/* स्कूल हेडर */}
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-800 uppercase">
              BLUE HEAVEN KIDS ACADEMY
            </h2>
            <p className="text-[12px] sm:text-[13px] font-semibold text-slate-500 mt-1 uppercase tracking-wide">
              Recognized Institution &bull; Academic Session: {session}
            </p>
            <div className="mt-5 inline-block bg-sky-50 text-sky-800 px-6 py-2 rounded-lg font-bold text-[13px] tracking-wider uppercase shadow-sm border border-sky-200">
              ✨ BONAFIDE CERTIFICATE ✨
            </div>
          </div>

          {/* सर्टिफिकेट रेफरेंस और डेट */}
          <div className="flex justify-between items-center text-[13px] font-bold px-6 py-3 bg-slate-50 rounded-xl border border-slate-200 mb-8 shadow-sm">
            <div>SR No. <span className="text-slate-800 font-bold underline ml-1">{srNo}</span></div>
            <div>Date: <span className="text-slate-800 font-bold underline ml-1">{issueDate}</span></div>
          </div>

          {/* मुख्य विवरण */}
          <div className="space-y-6 text-[14px] sm:text-[15px] leading-relaxed text-slate-700 font-normal px-6 text-justify">
            <p className="text-center">
              This is to certify that <span className="font-bold text-slate-900 text-base underline decoration-sky-400 decoration-2 underline-offset-4 uppercase px-1">{studentName}</span>, 
              Son / Daughter of <span className="font-bold text-slate-900 uppercase underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{fatherName}</span> and <span className="font-bold text-slate-900 uppercase underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{motherName}</span>, 
              is a regular and bonafide student of this institution.
            </p>

            <p className="text-center">
              He / She is studying in Class <span className="font-bold text-slate-900 uppercase underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{className}</span> during the academic session <span className="font-bold text-slate-900 uppercase underline decoration-sky-400 decoration-2 underline-offset-4 px-1">{session}</span>.
            </p>

            <p className="text-center text-[13px] sm:text-[14px] text-slate-500">
              To the best of my knowledge, his / her date of birth as per school records is <span className="font-bold text-slate-800">{dob}</span> and his / her conduct is good.
            </p>
          </div>

          {/* नीचे के सिग्नेचर और मुहर क्षेत्र */}
          <div className="mt-16 flex justify-between items-end pt-6 px-6 border-t border-slate-200">
            <div className="text-center">
              <div className="w-32 border-b border-slate-300 mb-1"></div>
              <span className="text-[12px] font-bold text-slate-700 uppercase">Class Teacher</span>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-1 border border-dashed border-slate-300 rounded-full flex items-center justify-center bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-tighter shadow-sm">
                School Stamp
              </div>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-300 mb-1"></div>
              <span className="text-[12px] font-bold text-slate-700 uppercase">Principal / Director</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}