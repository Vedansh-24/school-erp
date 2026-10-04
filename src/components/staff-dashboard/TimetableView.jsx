'use client';
import React from 'react';

export default function TimetableView() {
  const timetableData = [
    { day: 'Monday', periods: ['Math (10-A)', 'Science (9-B)', 'English (10-A)', 'Break', 'History (8-C)'] },
    { day: 'Tuesday', periods: ['Science (10-A)', 'Math (9-B)', 'Computer (10-B)', 'Break', 'Geography (9-A)'] },
    { day: 'Wednesday', periods: ['English (9-A)', 'Math (10-A)', 'Physics (10-B)', 'Break', 'Sports (All)'] },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Weekly Teaching Timetable</h3>
        <p className="text-xs text-slate-400">Complete schedule of your assigned classes across the week.</p>
      </div>

      <div className="space-y-4">
        {timetableData.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <h4 className="font-bold text-blue-400 mb-3">{item.day}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {item.periods.map((period, pIdx) => (
                <div key={pIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-center text-xs font-semibold text-slate-200">
                  {period}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}