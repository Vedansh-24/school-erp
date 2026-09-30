'use client';

import React, { useState } from 'react';
import { 
  Globe, Building2, ShieldCheck, Settings, CreditCard, 
  Database, Bell, Search, User, Menu, TrendingUp, Users, Server 
} from 'lucide-react';

// --- Menu Items Array ---
const menuItems = [
  { id: 'workspace', name: 'Global Workspace', icon: Globe, color: 'text-sky-500' },
  { id: 'branch', name: 'Branch Manager', icon: Building2, color: 'text-indigo-500' },
  { id: 'access', name: 'Access Control', icon: ShieldCheck, color: 'text-rose-500' },
  { id: 'config', name: 'System Config', icon: Settings, color: 'text-amber-500' },
  { id: 'billing', name: 'SaaS Billing', icon: CreditCard, color: 'text-emerald-500' },
  { id: 'security', name: 'Security & Backup', icon: Database, color: 'text-pink-500' },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Render Content Based on Active Tab ---
  const renderContent = () => {
    switch (activeTab) {
      case 'workspace':
        return <GlobalWorkspace />;
      case 'branch':
        return <Placeholder title="Branch & Franchise Manager" desc="Add, edit, or impersonate school branches here." />;
      case 'access':
        return <Placeholder title="Role & Access Control" desc="Manage RBAC and permissions across the SaaS." />;
      case 'config':
        return <Placeholder title="Global System Configurations" desc="Manage API keys, white-labeling, and master settings." />;
      case 'billing':
        return <Placeholder title="SaaS Billing & Invoicing" desc="Manage client subscriptions and payment history." />;
      case 'security':
        return <Placeholder title="Security & Database" desc="View audit logs and manage database backups." />;
      default:
        return <GlobalWorkspace />;
    }
  };

  return (
    <div 
      className="flex h-screen font-sans relative overflow-hidden text-slate-800"
      style={{
        background: 'linear-gradient(135deg, #FFB6C1 0%, #FFFACD 33%, #D3D3D3 66%, #87CEEB 100%)'
      }}
    >
      {/* Background Glow Orbs */}
      <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-yellow-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-400/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/30 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"></div>

      {/* --- Sidebar (Glassmorphism Light Theme) --- */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col z-10`}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
        }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/50">
          {isSidebarOpen && (
            <span className="font-black text-sm uppercase tracking-wide text-[#004D61] drop-shadow-sm">
              Super Admin <span className="text-pink-500">Dashboard</span>
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/80 rounded-lg text-[#004D61] transition">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 font-bold ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-pink-100 to-cyan-100 border-l-4 border-pink-400 text-[#004D61] shadow-sm' 
                  : 'hover:bg-white/60 text-slate-600 hover:text-[#004D61]'
              }`}
            >
              <item.icon size={20} className={`${item.color} min-w-[20px] drop-shadow-sm`} />
              {isSidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>
        
        {/* User Profile Snippet */}
        <div className="p-4 border-t border-white/50 flex items-center bg-white/30">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-amber-300 shadow-md flex items-center justify-center text-white">
            <User size={18} />
          </div>
          {isSidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-black text-[#004D61]">Super Admin</p>
              <p className="text-xs text-slate-500 font-bold">System Owner</p>
            </div>
          )}
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden z-10">
        
        {/* Header (Glassmorphism) */}
        <header 
          className="h-16 flex items-center justify-between px-6 z-10"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <div className="flex items-center bg-white/70 border border-white/80 shadow-sm px-3 py-2 rounded-xl w-96">
            <Search size={18} className="text-pink-500" />
            <input 
              type="text" 
              placeholder="Search branches, users, or settings..." 
              className="bg-transparent border-none outline-none ml-2 w-full text-sm font-semibold text-[#004D61] placeholder-slate-400"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-[#004D61] hover:bg-white/60 rounded-full transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 shadow-md border-2 border-white"></div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          {renderContent()}
        </div>

      </main>
    </div>
  );
}

// --- Global Workspace Component (Overview) ---
const GlobalWorkspace = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#004D61] drop-shadow-sm uppercase tracking-wide">Global Workspace</h1>
        <p className="text-sm font-semibold text-slate-600 mt-1">Overview of your entire Enterprise SaaS ecosystem.</p>
      </div>

      {/* Stats Cards - Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Active Branches" value="124" icon={Building2} trend="+12 this month" color="text-sky-600 bg-sky-100" border="border-t-sky-400" />
        <StatCard title="Total Students" value="84,590" icon={Users} trend="+5.2% from last year" color="text-indigo-600 bg-indigo-100" border="border-t-indigo-400" />
        <StatCard title="Total MRR (₹)" value="₹1.2M" icon={TrendingUp} trend="+15% growth" color="text-emerald-600 bg-emerald-100" border="border-t-emerald-400" />
        <StatCard title="Server Load" value="42%" icon={Server} trend="Healthy" color="text-pink-600 bg-pink-100" border="border-t-pink-400" />
      </div>

      {/* Recent Activity Table (Glassmorphism) */}
      <div 
        className="rounded-2xl shadow-xl p-6 mt-6 border border-white/60"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <h3 className="font-black text-lg text-[#004D61] mb-4 tracking-wide uppercase">Recent SaaS Activity</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-white/60">
              <th className="pb-3 font-bold uppercase text-[11px] tracking-wider">Branch/School Name</th>
              <th className="pb-3 font-bold uppercase text-[11px] tracking-wider">Action</th>
              <th className="pb-3 font-bold uppercase text-[11px] tracking-wider">Date & Time</th>
              <th className="pb-3 font-bold uppercase text-[11px] tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/40 hover:bg-white/40 transition-colors">
              <td className="py-3 font-bold text-[#004D61]">Delhi Public School, RJ</td>
              <td className="py-3 font-semibold text-slate-600">Subscription Renewed</td>
              <td className="py-3 font-semibold text-slate-500">Today, 10:24 AM</td>
              <td className="py-3"><span className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full text-[10px] font-black uppercase shadow-sm">Success</span></td>
            </tr>
            <tr className="hover:bg-white/40 transition-colors">
              <td className="py-3 font-bold text-[#004D61]">St. Xavier's, Mumbai</td>
              <td className="py-3 font-semibold text-slate-600">Database Backup Created</td>
              <td className="py-3 font-semibold text-slate-500">Yesterday, 11:45 PM</td>
              <td className="py-3"><span className="px-3 py-1 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full text-[10px] font-black uppercase shadow-sm">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Reusable Components (Cards) ---
const StatCard = ({ title, value, icon: Icon, trend, color, border }) => (
  <div 
    className={`p-6 rounded-2xl shadow-lg border border-white/60 flex flex-col hover:-translate-y-1 transition-transform border-t-4 ${border}`}
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</h3>
      <div className={`p-2.5 rounded-xl shadow-inner ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-auto">
      <h2 className="text-3xl font-black text-[#004D61] drop-shadow-sm">{value}</h2>
      <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wide">{trend}</p>
    </div>
  </div>
);

const Placeholder = ({ title, desc }) => (
  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
    <div className="w-20 h-20 bg-white/60 rounded-2xl shadow-lg flex items-center justify-center mb-2 border border-white/80 animate-pulse">
      <Settings size={36} className="text-pink-400 animate-spin-slow" />
    </div>
    <h2 className="text-3xl font-black text-[#004D61] drop-shadow-sm uppercase tracking-wide">{title}</h2>
    <p className="text-slate-600 font-semibold max-w-md">{desc}</p>
    <button 
      className="mt-6 px-6 py-3 rounded-xl font-black text-xs text-white tracking-wider shadow-[0_8px_20px_rgba(255,107,139,0.35)] hover:opacity-95 transition-all uppercase"
      style={{ background: 'linear-gradient(90deg, #FF6B8B 0%, #FF8E53 50%, #00C9A7 100%)' }}
    >
      Load Module
    </button>
  </div>
);