'use client';
import React from 'react';
import { Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome, Staff Member</h2>
        <p className="text-xs text-slate-400">Manage your classes, homework, and student performance.</p>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white active:scale-95 transition-transform shadow-md">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
            ST
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">Teacher Panel</p>
            <p className="text-xs text-emerald-400 font-medium">● Active Session</p>
          </div>
        </div>
      </div>
    </header>
  );
}