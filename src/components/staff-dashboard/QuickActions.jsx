'use client';
import React from 'react';
import { UserCheck, CheckSquare, FileText, ChevronRight } from 'lucide-react';

export default function QuickActions({ setActiveTab }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
        <span>Quick Action Panel</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setActiveTab('attendance')}
          className="group relative p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-left font-semibold text-white shadow-[0_6px_0_#1d4ed8] active:shadow-none active:translate-y-1.5 transition-all duration-150 flex flex-col justify-between h-36"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-bold">Mark Attendance</h4>
          </div>
          <div className="flex items-center text-xs text-blue-200 group-hover:translate-x-1 transition-transform">
            <span>Open attendance portal</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('homework')}
          className="group relative p-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-left font-semibold text-white shadow-[0_6px_0_#6d28d9] active:shadow-none active:translate-y-1.5 transition-all duration-150 flex flex-col justify-between h-36"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-bold">Upload Daily Homework</h4>
          </div>
          <div className="flex items-center text-xs text-purple-200 group-hover:translate-x-1 transition-transform">
            <span>Add assignments</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('timetable')}
          className="group relative p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-left font-semibold text-white shadow-[0_6px_0_#047857] active:shadow-none active:translate-y-1.5 transition-all duration-150 flex flex-col justify-between h-36"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-bold">Timetable & Schedule</h4>
          </div>
          <div className="flex items-center text-xs text-emerald-200 group-hover:translate-x-1 transition-transform">
            <span>View periods</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </button>
      </div>
    </div>
  );
}