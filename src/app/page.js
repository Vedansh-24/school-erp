// Filename: LoginPage.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
        alert('Galat Super Admin Credentials! (Demo ID: ADMIN-101 ya BHKA-101 / Pass: 123456)');
      }
      return;
    }

    // 🏫 2. School Dashboard Login
    if (selectedRole === 'School Dashboard') {
      try {
        const { data: school, error } = await supabase
          .from('schools')
          .select('*')
          .eq('username', username)
          .single();

        if (error || !school) {
          alert('Galat Username ya yah school register nahi hai!');
          return;
        }

        if (school.password !== password) {
          alert('Galat Password!');
          return;
        }

        if (school.status !== 'approved') {
          alert('⚠️ Aapka school registration abhi pending hai ya reject ho gaya hai. Kripya Super Admin ke approval ka intezaar kare.');
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

    // 👨‍💼 3. Staff Dashboard Login
    if (selectedRole === 'Staff Dashboard') {
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (staffError || !staffData) {
          alert('Galat Staff Username ya Password hai! Kripya dobara koshish kare.');
          return;
        }

        localStorage.setItem('userRole', 'staff');
        localStorage.setItem('staffInfo', JSON.stringify(staffData));
        router.push('/staff-dashboard');
      } catch (err) {
        alert('Staff Login Error: ' + err.message);
      }
      return;
    }

    // 👨‍👩‍👧 4. Parents Dashboard Login (Supports portal_login_id, mobile_number, sr_no, student_id)
    if (selectedRole === 'Parents Dashboard') {
      try {
        const cleanInput = username.trim();

        // Step A: Check in parent_credentials by portal_login_id or mobile_number
        let { data: parentData, error: parentError } = await supabase
          .from('parent_credentials')
          .select('*')
          .or(`portal_login_id.eq.${cleanInput},mobile_number.eq.${cleanInput}`)
          .single();

        // Step B: If not found directly, check via parent_student_mapping using student's sr_no or student_id
        if (parentError || !parentData) {
          const { data: mapData } = await supabase
            .from('parent_student_mapping')
            .select('parent_credential_id')
            .or(`sr_no.eq.${cleanInput},student_id.eq.${cleanInput}`)
            .limit(1);

          if (mapData && mapData.length > 0) {
            const { data: credByMap } = await supabase
              .from('parent_credentials')
              .select('*')
              .eq('id', mapData[0].parent_credential_id)
              .single();

            if (credByMap) {
              parentData = credByMap;
            }
          }
        }

        if (!parentData || parentData.password !== password) {
          alert('Galat Parents Portal Login ID, Mobile No., SR No. ya Password hai!');
          return;
        }

        localStorage.setItem('userRole', 'parent');
        localStorage.setItem('parentInfo', JSON.stringify(parentData));
        localStorage.setItem('parent_login_id', parentData.portal_login_id || parentData.mobile_number);

        router.push('/parents-dashboard');
      } catch (err) {
        alert('Parents Login Error: ' + err.message);
      }
      return;
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedLogoUrl = null;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${regData.schoolCode}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('school-logos')
          .upload(fileName, logoFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('school-logos')
            .getPublicUrl(fileName);
          
          uploadedLogoUrl = publicUrlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase
        .from('schools')
        .insert([
          {
            school_code: regData.schoolCode,
            school_name: regData.schoolName,
            address: regData.schoolAddress,
            phone: regData.contactNumber,
            logo_url: uploadedLogoUrl,
            username: regData.username,
            password: regData.password,
            status: 'pending'
          }
        ]);

      if (insertError) throw insertError;

      alert(`School "${regData.schoolName}" ka registration safaltapoorvak submit ho gaya hai! (Approval Pending)`);
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
      className="min-h-screen flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(135deg, #FFB6C1 0%, #FFFACD 33%, #D3D3D3 66%, #87CEEB 100%)'
      }}
    >
      <div className="absolute -top-20 -left-20 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-yellow-300/70 rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-pink-400/60 rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px]"></div>

      <div 
        className="w-full max-w-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] relative z-10 overflow-hidden flex flex-col justify-between backdrop-blur-3xl my-auto shadow-2xl"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.85)', 
          borderTop: '5px solid #FF6B8B',
          borderRight: '5px solid #00C9A7',
          borderBottom: '5px solid #FFB800',
          borderLeft: '5px solid #9D4EDD',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(255, 107, 139, 0.2), inset 0 0 35px rgba(255, 255, 255, 0.95)',
        }}
      >
        <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4 flex-1 flex flex-col justify-center">
          
          <div className="flex justify-center mb-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400 p-0.5 shadow-xl flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#004D61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow sm:w-8 sm:h-8">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1 mb-1 sm:mb-2">
            <h1 className="text-lg sm:text-2xl font-black tracking-wider sm:tracking-widest uppercase font-serif text-[#004D61]">
              SCHOOL ERP SYSTEM
            </h1>
            <h2 className="text-xs sm:text-base font-extrabold tracking-wide text-[#003B46]">
              Portal Access Gateway
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium">Select your workspace context to continue</p>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Select Dashboard
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#004D61] bg-white/95 border-2 border-pink-300/80 outline-none appearance-none cursor-pointer shadow-sm pr-8"
              >
                <option value="School Dashboard">🏫 School Admin Dashboard</option>
                <option value="Super Admin Dashboard">👑 Super Admin Dashboard</option>
                <option value="Staff Dashboard">👨‍💼 Staff Dashboard</option>
                <option value="Parents Dashboard">👨‍👩‍👧 Parents Dashboard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Username / Portal ID / S.R. No. / Mobile
            </label>
            <input
              type="text"
              value={username}
              placeholder="Enter ID, SR No. or Mobile"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-3 rounded-xl text-xs sm:text-sm text-slate-900 bg-white/90 border-2 border-pink-300/80 outline-none font-bold shadow-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Password / Passcode
            </label>
            <input
              type="password"
              value={password}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 rounded-xl text-xs sm:text-sm text-slate-900 bg-white/90 border-2 border-cyan-300/80 outline-none font-bold shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm text-white tracking-wider shadow-lg uppercase"
            style={{ background: 'linear-gradient(90deg, #FF6B8B 0%, #FF8E53 50%, #00C9A7 100%)' }}
          >
            Login to Dashboard
          </button>
        </form>

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

      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-md">
          <div className="w-full max-w-md p-5 sm:p-8 rounded-[2rem] relative z-20 overflow-y-auto max-h-[90vh] bg-white/95 shadow-2xl">
            <h2 className="text-base sm:text-xl font-black text-[#004D61] uppercase mb-4 text-center">School Registration</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <input type="text" required placeholder="School Code" className="w-full p-2.5 border rounded-xl text-xs" onChange={(e) => setRegData({ ...regData, schoolCode: e.target.value })} />
              <input type="text" required placeholder="School Name" className="w-full p-2.5 border rounded-xl text-xs" onChange={(e) => setRegData({ ...regData, schoolName: e.target.value })} />
              <input type="text" placeholder="Address" className="w-full p-2.5 border rounded-xl text-xs" onChange={(e) => setRegData({ ...regData, schoolAddress: e.target.value })} />
              <input type="tel" required placeholder="Contact Number" className="w-full p-2.5 border rounded-xl text-xs" onChange={(e) => setRegData({ ...regData, contactNumber: e.target.value })} />
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="w-full text-xs" />
              <input type="text" required placeholder="Username" className="w-full p-2.5 border rounded-xl text-xs" onChange={(e) => setRegData({ ...regData, username: e.target.value })} />
              <input type="password" required placeholder="Password" className="w-full p-2.5 border rounded-xl text-xs" onChange={(e) => setRegData({ ...regData, password: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase">Submit</button>
                <button type="button" onClick={() => setIsRegisterOpen(false)} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}