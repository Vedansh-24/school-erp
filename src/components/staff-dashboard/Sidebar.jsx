'use client';
import React from 'react';
import { BookOpen, Calendar, CheckSquare, FileText, UserCheck, Award, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: BookOpen },
    { id: 'attendance', label: 'Mark Attendance', icon: UserCheck },
    { id: 'homework', label: 'Daily Homework', icon: CheckSquare },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'reports', label: 'Student Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 p-6 hidden md:flex flex-col justify-between shadow-2xl">
      <div>
        <div className="flex items-center space-x-3 mb-10 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_4px_14px_rgba(59,130,246,0.5)]">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              School ERP
            </h1>
            <p className="text-xs text-blue-400 font-medium">Staff Portal</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:translate-y-1 transition-all duration-150 shadow-[0_4px_0_#9f1239] active:shadow-none">
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}