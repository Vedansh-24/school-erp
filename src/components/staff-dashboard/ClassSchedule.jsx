'use client';
import React from 'react';

export default function ClassSchedule() {
  const schedule = [
    { time: '09:00 AM - 09:45 AM', subject: 'Mathematics (Class 10-A)', room: 'Room 204' },
    { time: '10:00 AM - 10:45 AM', subject: 'Science (Class 9-B)', room: 'Lab 02' },
    { time: '11:15 AM - 12:00 PM', subject: 'Algebra (Class 10-B)', room: 'Room 204' },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
      <h3 className="text-lg font-bold text-white mb-4">Today's Class Schedule</h3>
      <div className="space-y-3">
        {schedule.map((cls, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div>
              <p className="font-semibold text-white text-sm">{cls.subject}</p>
              <p className="text-xs text-slate-400">{cls.time}</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {cls.room}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}