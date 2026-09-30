'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // 👈 पाथ सही कर दिया गया है

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('School Dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 🏫 Register School Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  const [regData, setRegData] = useState({
    schoolCode: '',
    schoolName: '',
    schoolAddress: '',
    contactNumber: '',
    username: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    // 👑 1. Super Admin Login Logic
    if (selectedRole === 'Super Admin Dashboard') {
      if ((username === 'ADMIN-101' || username === 'BHKA-101') && password === '123456') {
        localStorage.setItem('userRole', 'super_admin');
        router.push('/super-admin-dashboard'); 
      } else {
        alert('गलत Super Admin Credentials! (Demo ID: ADMIN-101 या BHKA-101 / Pass: 123456)');
      }
      return;
    }

    // 🏫 2. School Dashboard Login (Database Verified & Approval Check)
    if (selectedRole === 'School Dashboard') {
      try {
        const { data: school, error } = await supabase
          .from('schools')
          .select('*')
          .eq('username', username)
          .single();

        if (error || !school) {
          alert('गलत Username या यह स्कूल रजिस्टर नहीं है!');
          return;
        }

        if (school.password !== password) {
          alert('गलत Password!');
          return;
        }

        if (school.status !== 'approved') {
          alert('⚠️ आपका स्कूल रजिस्ट्रेशन अभी पेंडिंग (Pending) है या रिजेक्ट हो गया है। कृपया Super Admin के अप्रूवल का इंतज़ार करें।');
          return;
        }

        localStorage.setItem('userRole', 'school_admin');
        localStorage.setItem('schoolCode', school.school_code);
        localStorage.setItem('schoolName', school.school_name);
        router.push('/school-dashboard');
      } catch (err) {
        alert('Login Error: ' + err.message);
      }
      return;
    }

    // 👨‍💼 Staff & Parents Demo Login
    if (username === 'BHKA-101' && password === '123456') {
      if (selectedRole === 'Staff Dashboard') {
        localStorage.setItem('userRole', 'staff');
        router.push('/staff-dashboard');
      } else if (selectedRole === 'Parents Dashboard') {
        localStorage.setItem('userRole', 'parent');
        router.push('/parents-dashboard');
      }
    } else {
      alert('गलत ID या Password!');
    }
  };

  // 🚀 Supabase में Username और Password के साथ Data Save करने का Logic
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedLogoUrl = null;

      // 1. अगर लोगो अपलोड किया है तो Storage Bucket में सेव करें
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${regData.schoolCode}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('school-logos')
          .upload(fileName, logoFile);

        if (uploadError) {
          console.error("Storage Error:", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('school-logos')
            .getPublicUrl(fileName);
          
          uploadedLogoUrl = publicUrlData.publicUrl;
        }
      }

      // 2. Supabase की 'schools' टेबल में Username और Password के साथ डाटा सेव करें
      const { error: insertError } = await supabase
        .from('schools')
        .insert([
          {
            school_code: regData.schoolCode,
            school_name: regData.schoolName,
            address: regData.schoolAddress,
            phone: regData.contactNumber,
            logo_url: uploadedLogoUrl,
            username: regData.username,    // 👈 अब यहाँ सेव होगा
            password: regData.password,    // 👈 अब यहाँ सेव होगा
            status: 'pending'
          }
        ]);

      if (insertError) throw insertError;

      alert(`स्कूल "${regData.schoolName}" का रजिस्ट्रेशन सफ़लतापूर्वक सबमिट हो गया है! (Approval Pending)`);
      setIsRegisterOpen(false);
      setLogoFile(null);
    } catch (err) {
      alert("Registration Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(135deg, #FFB6C1 0%, #FFFACD 33%, #D3D3D3 66%, #87CEEB 100%)'
      }}
    >
      {/* Background Glow Orbs */}
      <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-yellow-300/70 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-pink-400/60 rounded-full mix-blend-multiply filter blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/50 rounded-full mix-blend-multiply filter blur-[120px]"></div>

      {/* Main Glassmorphism Card */}
      <div 
        className="w-full max-w-md p-8 md:p-10 rounded-[2.5rem] relative z-10 overflow-hidden flex flex-col justify-between backdrop-blur-3xl"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.75)', 
          borderTop: '5px solid #FF6B8B',
          borderRight: '5px solid #00C9A7',
          borderBottom: '5px solid #FFB800',
          borderLeft: '5px solid #9D4EDD',
          boxShadow: '0 40px 90px rgba(0, 0, 0, 0.2), 0 0 40px rgba(255, 107, 139, 0.25), inset 0 0 35px rgba(255, 255, 255, 0.95), inset 0 0 10px rgba(255, 255, 255, 1)',
          minHeight: '680px',
          transform: 'perspective(1000px) rotateX(2deg)'
        }}
      >
        <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col justify-center">
          
          {/* Educator / Graduation Cap Icon */}
          <div className="flex justify-center mb-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400 p-0.5 shadow-xl flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#004D61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Top Stars */}
          <div className="flex justify-center items-center gap-2.5 mb-1">
            <span className="text-xl text-rose-500 drop-shadow-md">★</span>
            <span className="text-2xl text-amber-500 drop-shadow-md">★</span>
            <span className="text-xl text-sky-500 drop-shadow-md">★</span>
          </div>

          {/* Header Titles */}
          <div className="text-center space-y-1 mb-2">
            <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase font-serif text-[#004D61] drop-shadow-sm">
              SCHOOL ERP SYSTEM
            </h1>
            <h2 className="text-sm md:text-base font-extrabold tracking-wide text-[#003B46]">
              Portal Access Gateway
            </h2>
            <p className="text-xs text-slate-600 font-medium">Select your workspace context to continue</p>
          </div>

          {/* Portal Selection Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Select Dashboard
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-xs font-bold text-[#004D61] bg-white/90 border-2 border-pink-300/80 outline-none appearance-none cursor-pointer shadow-sm focus:border-cyan-500 focus:bg-white transition-all"
              >
                <option value="School Dashboard">🏫 School Admin Dashboard</option>
                <option value="Super Admin Dashboard">👑 Super Admin Dashboard</option>
                <option value="Staff Dashboard">👨‍💼 Staff Dashboard</option>
                <option value="Parents Dashboard">👨‍👩‍👧 Parents Dashboard</option>
              </select>

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Username / ID Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Username / Account ID / S.R. No. / Mobile
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <input
                type="text"
                value={username}
                placeholder="Enter Username"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-pink-300/80 outline-none font-bold shadow-sm focus:border-rose-400 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Password / Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input
                type="password"
                value={password}
                placeholder="Enter Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-cyan-300/80 outline-none font-bold shadow-sm focus:border-cyan-400 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Secure Cloud Session & Forgot Password Row */}
          <div className="flex items-center justify-between text-[11px] pt-1 px-1 font-medium">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Secure Cloud Session</span>
            </div>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent.'); }} className="text-[#005B60] hover:underline font-extrabold">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-black text-xs text-white tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 uppercase"
            style={{ 
              background: 'linear-gradient(90deg, #FF6B8B 0%, #FF8E53 50%, #00C9A7 100%)',
              boxShadow: '0 8px 20px rgba(255, 107, 139, 0.35)'
            }}
          >
            Login to Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </form>

        {/* Bottom Register Link */}
        <div className="text-center pt-3 border-t border-slate-300/60 mt-2">
          <button 
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="text-xs font-black text-[#004D61] hover:underline block w-full text-center"
          >
            Register New School Online
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏫 REGISTER NEW SCHOOL MODAL */}
      {/* ========================================================================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
          <div 
            className="w-full max-w-md p-6 md:p-8 rounded-[2.5rem] relative z-20 overflow-y-auto max-h-[90vh] backdrop-blur-3xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.75)', 
              borderTop: '5px solid #FF6B8B',
              borderRight: '5px solid #00C9A7',
              borderBottom: '5px solid #FFB800',
              borderLeft: '5px solid #9D4EDD',
              boxShadow: '0 40px 90px rgba(0, 0, 0, 0.2), 0 0 40px rgba(255, 107, 139, 0.25), inset 0 0 35px rgba(255, 255, 255, 0.95), inset 0 0 10px rgba(255, 255, 255, 1)',
              transform: 'perspective(1000px) rotateX(2deg)'
            }}
          >
            <div className="text-center mb-4">
              <h2 className="text-lg md:text-xl font-black text-[#004D61] uppercase tracking-wider font-serif">
                School Online Registration
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">Fill details to register your institution</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* School Code */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1">
                  School Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SCH-101"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-pink-300/80 outline-none font-bold shadow-sm focus:border-rose-400 focus:bg-white transition-all"
                  onChange={(e) => setRegData({ ...regData, schoolCode: e.target.value })}
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter School Name"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-pink-300/80 outline-none font-bold shadow-sm focus:border-rose-400 focus:bg-white transition-all"
                  onChange={(e) => setRegData({ ...regData, schoolName: e.target.value })}
                />
              </div>

              {/* School Address */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1">
                  School Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Address"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-pink-300/80 outline-none font-bold shadow-sm focus:border-rose-400 focus:bg-white transition-all"
                  onChange={(e) => setRegData({ ...regData, schoolAddress: e.target.value })}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter Contact Number"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-pink-300/80 outline-none font-bold shadow-sm focus:border-rose-400 focus:bg-white transition-all"
                  onChange={(e) => setRegData({ ...regData, contactNumber: e.target.value })}
                />
              </div>

              {/* Upload Logo */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-700 font-bold file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-pink-100 file:text-pink-700 file:font-black hover:file:bg-pink-200 cursor-pointer"
                />
              </div>

              {/* Username / Email */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1">
                  Username (e.g. bhka-101)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bhka-101 (No spaces)"
                  value={regData.username}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-cyan-300/80 outline-none font-bold shadow-sm focus:border-cyan-400 focus:bg-white transition-all"
                  // 👇 यह ऑटोमैटिक स्पेस हटा देगा और छोटे अक्षर कर देगा
                  onChange={(e) => setRegData({ ...regData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-900 bg-white/90 border-2 border-cyan-300/80 outline-none font-bold shadow-sm focus:border-cyan-400 focus:bg-white transition-all"
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-black text-xs text-white tracking-wider shadow-lg hover:opacity-95 transition-all uppercase disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(90deg, #FF6B8B 0%, #FF8E53 50%, #00C9A7 100%)',
                    boxShadow: '0 8px 20px rgba(255, 107, 139, 0.35)'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="flex-1 py-3 rounded-xl font-black text-xs text-white tracking-wider shadow-lg hover:opacity-95 transition-all uppercase"
                  style={{ 
                    background: 'linear-gradient(90deg, #FF4D4D 0%, #DC2626 100%)',
                    boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}