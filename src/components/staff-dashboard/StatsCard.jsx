'use client';
import React from 'react';
import { Users, Calendar, CheckSquare, UserCheck } from 'lucide-react';

export default function StatsCard() {
  const stats = [
    { title: 'Total Students', value: '142', icon: Users, color: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-900/30' },
    { title: 'Classes Today', value: '5 Periods', icon: Calendar, color: 'from-indigo-600 to-violet-600', shadow: 'shadow-indigo-900/30' },
    { title: 'Pending Homework', value: '12 Submissions', icon: CheckSquare, color: 'from-amber-600 to-orange-600', shadow: 'shadow-amber-900/30' },
    { title: 'Attendance Marked', value: '94%', icon: UserCheck, color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-900/30' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-xl border border-white/10 hover:scale-[1.02] transition-transform duration-300 overflow-hidden group`}
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-white/80">{stat.title}</span>
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</h3>
          </div>
        );
      })}
    </div>
  );
}