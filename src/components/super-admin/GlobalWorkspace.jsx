'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Building2, Users, TrendingUp, Server } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Reusable StatCard Component
const StatCard = ({ title, value, icon: Icon, trend, boxColor, iconColor, border }) => (
  <div className={`p-5 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] flex flex-col hover:-translate-y-0.5 transition-transform border-t-4 ${border}`}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#5C6B7A]">{title}</h3>
      <div 
        className="p-2.5 rounded-xl shadow-md flex items-center justify-center"
        style={{ backgroundColor: boxColor }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
    </div>
    <div className="mt-auto">
      <h2 className="text-2xl font-black text-[#1A2332]">{value}</h2>
      <p className="text-[10px] font-bold text-[#5C6B7A] mt-1 uppercase tracking-wide">{trend}</p>
    </div>
  </div>
);

export default function GlobalWorkspace() {
  const [stats, setStats] = useState({
    activeBranches: 0,
    totalUsers: 0,
    totalMRR: '₹0',
    serverLoad: '42%'
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      const { data: schools, error } = await supabase
        .from('schools')
        .select('*');

      if (error) throw error;

      const schoolList = schools || [];

      // 1. Active Branches Count
      const activeCount = schoolList.length;

      // 2. Total Users Sum
      const totalUsersSum = schoolList.reduce((acc, school) => acc + (Number(school.users) || 350), 0);

      // 3. Estimated MRR Calculation
      let calculatedMRR = 0;
      schoolList.forEach((school) => {
        const plan = (school.plan || '').toLowerCase();
        if (plan.includes('enterprise')) calculatedMRR += 45000;
        else if (plan.includes('pro')) calculatedMRR += 25000;
        else calculatedMRR += 10000;
      });

      let formattedMRR = `₹${(calculatedMRR / 100000).toFixed(1)}M`;
      if (calculatedMRR < 100000) {
        formattedMRR = `₹${(calculatedMRR / 1000).toFixed(1)}K`;
      }

      setStats({
        activeBranches: activeCount,
        totalUsers: totalUsersSum.toLocaleString(),
        totalMRR: formattedMRR,
        serverLoad: '42%'
      });

      // 4. Map recent activities
      const activities = schoolList.slice(0, 5).map((school, index) => ({
        id: school.id || index,
        name: school.school_name || school.name || 'Unknown School',
        action: school.status === 'approved' ? 'Branch Verified & Active' : 'New Registration Pending',
        time: 'Recently',
        status: school.status === 'approved' ? 'Success' : 'Pending'
      }));

      setRecentActivities(activities);

    } catch (err) {
      console.error('Error fetching global workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  // --- CSV Export Functionality ---
  const handleExportCSV = () => {
    if (recentActivities.length === 0) {
      alert('No data available to export!');
      return;
    }

    const headers = ['Branch/School Name', 'Action', 'Date & Time', 'Status'];
    const csvRows = [
      headers.join(','),
      ...recentActivities.map(item => `"${item.name}","${item.action}","${item.time}","${item.status}"`)
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `saas_ecosystem_activity_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CSV Import Functionality ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          alert('CSV file is empty or invalid format.');
          return;
        }

        // CSV parsing (assuming format: school_name, school_code, plan, users, status)
        let insertedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(val => val.replace(/(^"|"$)/g, '').trim());
          if (cols.length >= 2) {
            const schoolName = cols[0];
            const schoolCode = cols[1] || `SCH-${Math.floor(100 + Math.random() * 900)}`;
            const plan = cols[2] || 'Enterprise';
            const users = Number(cols[3]) || 350;
            const status = cols[4] || 'approved';

            const { error } = await supabase.from('schools').insert([
              {
                school_name: schoolName,
                school_code: schoolCode,
                plan: plan,
                users: users,
                status: status,
                domain: `${schoolCode.toLowerCase()}.saaserp.com`
              }
            ]);

            if (!error) insertedCount++;
          }
        }

        alert(`Successfully imported ${insertedCount} schools into Supabase!`);
        fetchWorkspaceData(); // Refresh data
      } catch (err) {
        console.error('Error importing CSV:', err);
        alert('Failed to parse or import CSV file.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1B3A6B] uppercase tracking-wide">Global Workspace</h1>
        <p className="text-sm font-semibold text-[#5C6B7A] mt-1">Overview of your entire Enterprise SaaS ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Active Branches" value={loading ? '...' : stats.activeBranches} icon={Building2} trend="Live from Database" boxColor="#ED1C24" iconColor="#ffffff" border="border-t-[#1B3A6B]" />
        <StatCard title="Total Students / Users" value={loading ? '...' : stats.totalUsers} icon={Users} trend="Active ecosystem users" boxColor="#00A99D" iconColor="#ffffff" border="border-t-[#2F6690]" />
        <StatCard title="Total MRR (₹)" value={loading ? '...' : stats.totalMRR} icon={TrendingUp} trend="Estimated monthly revenue" boxColor="#EC1E79" iconColor="#ffffff" border="border-t-[#2E7D4F]" />
        <StatCard title="Server Load" value={stats.serverLoad} icon={Server} trend="Healthy Supabase Node" boxColor="#FFD400" iconColor="#1A2332" border="border-t-[#C6952C]" />
      </div>

      <div className="rounded-xl shadow-sm p-6 mt-6 border border-[#E2E8F0] bg-[#FFFFFF]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-black text-lg text-[#1B3A6B] tracking-wide uppercase">Recent SaaS Activity</h3>
          <div className="flex items-center gap-2">
            {/* Hidden File Input for CSV Import */}
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#00AEEF] text-white text-xs font-bold px-3 py-1.5 rounded-lg border-b-4 border-[#0077a3] active:border-b-0 active:translate-y-1 transition-all shadow-sm cursor-pointer"
            >
              Import
            </button>
            <button 
              onClick={handleExportCSV}
              className="bg-[#ED1C24] text-white text-xs font-bold px-3 py-1.5 rounded-lg border-b-4 border-[#a31217] active:border-b-0 active:translate-y-1 transition-all shadow-sm cursor-pointer"
            >
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center text-xs font-bold text-[#5C6B7A]">Loading live ecosystem activity...</div>
          ) : recentActivities.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-[#5C6B7A]">No recent activity found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#1B3A6B] border-b border-[#E2E8F0] uppercase font-bold text-[11px] tracking-wider">
                  <th className="pb-3 px-3">Branch/School Name</th>
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Date & Time</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1A2332]">
                {recentActivities.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F7FA] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#1A2332]">{item.name}</td>
                    <td className="py-3 px-3 font-semibold text-[#5C6B7A]">{item.action}</td>
                    <td className="py-3 px-3 font-semibold text-[#5C6B7A]">{item.time}</td>
                    <td className="py-3 px-3">
                      {item.status === 'Success' ? (
                        <span className="px-2.5 py-1 bg-[#2E7D4F]/15 text-[#2E7D4F] border border-[#2E7D4F]/30 rounded text-[10px] font-bold uppercase shadow-sm">Success</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-[#FFD400]/20 text-[#D49000] border border-[#FFD400]/50 rounded text-[10px] font-bold uppercase shadow-sm">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}