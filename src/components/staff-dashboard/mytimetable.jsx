'use client';

import React from 'react';

export default function TimetableView() {
  // Period Timings Header Definition (8 Periods + Recess Break)
  const periodHeaders = [
    { num: 'P1', time: '08:00 - 08:40' },
    { num: 'P2', time: '08:40 - 09:20' },
    { num: 'P3', time: '09:20 - 10:00' },
    { num: 'P4', time: '10:00 - 10:40' },
    { num: 'RECESS', time: '10:40 - 11:10' },
    { num: 'P5', time: '11:10 - 11:50' },
    { num: 'P6', time: '11:50 - 12:30' },
    { num: 'P7', time: '12:30 - 01:10' },
    { num: 'P8', time: '01:10 - 01:50' },
  ];

  // Comprehensive Monday to Saturday Schedule for Teacher
  const weeklySchedule = [
    {
      day: 'Monday',
      periods: [
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'Mathematics', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'EVS', class: 'Fifth', room: 'R-105', type: 'class' },
        { subject: 'LUNCH BREAK', class: 'All', room: 'Cafeteria', type: 'break' },
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'EVS', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'Class Teacher Hour', class: 'Fourth', room: 'R-101', type: 'special' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
      ],
    },
    {
      day: 'Tuesday',
      periods: [
        { subject: 'EVS', class: 'Fifth', room: 'R-105', type: 'class' },
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'Mathematics', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'LUNCH BREAK', class: 'All', room: 'Cafeteria', type: 'break' },
        { subject: 'Science Lab', class: 'Fifth', room: 'Lab-2', type: 'special' },
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'EVS', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
      ],
    },
    {
      day: 'Wednesday',
      periods: [
        { subject: 'Mathematics', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'EVS', class: 'Fifth', room: 'R-105', type: 'class' },
        { subject: 'LUNCH BREAK', class: 'All', room: 'Cafeteria', type: 'break' },
        { subject: 'EVS', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'Vedic Maths', class: 'Fourth', room: 'R-101', type: 'special' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'Library Duty', class: 'All', room: 'Library', type: 'special' },
      ],
    },
    {
      day: 'Thursday',
      periods: [
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'EVS', class: 'Fifth', room: 'R-105', type: 'class' },
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'Mathematics', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'LUNCH BREAK', class: 'All', room: 'Cafeteria', type: 'break' },
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'EVS', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'EVS Lab', class: 'Fifth', room: 'Lab-1', type: 'special' },
      ],
    },
    {
      day: 'Friday',
      periods: [
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'Mathematics', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'EVS', class: 'Fifth', room: 'R-105', type: 'class' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'LUNCH BREAK', class: 'All', room: 'Cafeteria', type: 'break' },
        { subject: 'Sports & Games', class: 'Fourth', room: 'Ground', type: 'special' },
        { subject: 'EVS', class: 'Third', room: 'R-102', type: 'class' },
        { subject: 'Mathematics', class: 'Fourth', room: 'R-101', type: 'class' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
      ],
    },
    {
      day: 'Saturday',
      periods: [
        { subject: 'Weekly Assessment', class: 'Fourth', room: 'R-101', type: 'special' },
        { subject: 'Weekly Assessment', class: 'Third', room: 'R-102', type: 'special' },
        { subject: 'Remedial Class', class: 'Fifth', room: 'R-105', type: 'special' },
        { subject: 'Co-Curricular Activity', class: 'Fourth', room: 'Hall-A', type: 'special' },
        { subject: 'LUNCH BREAK', class: 'All', room: 'Cafeteria', type: 'break' },
        { subject: 'Staff Meeting', class: 'Staff', room: 'Conf. Room', type: 'special' },
        { subject: 'Lesson Planning', class: '-', room: 'Staff Room', type: 'free' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
        { subject: 'Free Period', class: '-', room: '-', type: 'free' },
      ],
    },
  ];

  const getCellStyles = (type) => {
    switch (type) {
      case 'class':
        return 'bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] border-[#2F6690]/30 text-[#1A2332] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#2F6690] hover:-translate-y-0.5';
      case 'special':
        return 'bg-gradient-to-b from-[#FFFDF5] to-[#FEF3C7]/40 border-[#C6952C]/40 text-[#8A6512] font-bold shadow-[0_2px_6px_rgba(198,149,44,0.1)] hover:-translate-y-0.5';
      case 'break':
        return 'bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0] border-[#CBD5E1] text-[#5C6B7A] font-extrabold uppercase text-[10px] tracking-wider';
      case 'free':
      default:
        return 'bg-[#F5F7FA] border-[#E2E7EE] text-[#5C6B7A]/70 italic hover:bg-[#EEF2F6]';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E7EE] rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 space-y-6 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E7EE]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#1B3A6B] to-[#2F6690] flex items-center gap-2">
            <span>📅</span> Weekly Teaching Timetable
          </h2>
          <p className="text-xs font-semibold text-[#5C6B7A] mt-1">
            Official 6-Day (Monday – Saturday) teaching schedule & period allocations
          </p>
        </div>

        {/* Legend Badges */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-[#2F6690]/30 text-[#1B3A6B] shadow-xs">
            📘 Regular Class
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#FFFDF5] border border-[#C6952C]/40 text-[#8A6512]">
            ⭐ Special / Lab / Duty
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#F5F7FA] border border-[#E2E7EE] text-[#5C6B7A]">
            ☕ Break / Free
          </span>
        </div>
      </div>

      {/* Timetable Table Wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-[#E2E7EE] shadow-sm bg-[#F5F7FA]/30 p-1">
        <table className="w-full text-center border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#1B3A6B] to-[#2F6690] text-white text-xs font-black uppercase tracking-wider rounded-xl">
              <th className="py-4 px-4 text-left border-r border-white/10 w-32 sticky left-0 z-10 bg-[#1B3A6B] shadow-md rounded-tl-xl">
                Day / Time
              </th>
              {periodHeaders.map((header, idx) => (
                <th key={idx} className="py-3 px-2 border-r border-white/10 min-w-[105px] last:rounded-tr-xl">
                  <div className="text-xs font-black text-[#FFD700]">{header.num}</div>
                  <div className="text-[10px] font-semibold text-slate-100/90">{header.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E7EE] text-xs">
            {weeklySchedule.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-blue-50/20 transition-colors">
                
                {/* Day Header Column */}
                <td className="py-3.5 px-4 font-black text-[#1B3A6B] bg-[#F5F7FA] border-r border-[#E2E7EE] text-left sticky left-0 z-10 shadow-xs">
                  {row.day}
                </td>

                {/* Period Cells */}
                {row.periods.map((period, pIdx) => (
                  <td key={pIdx} className="p-1.5 border-r border-[#E2E7EE]/80 align-middle">
                    <div
                      className={`p-2.5 rounded-xl border flex flex-col justify-center items-center h-20 transition-all duration-200 ${getCellStyles(
                        period.type
                      )}`}
                    >
                      <span className="font-extrabold text-[12px] leading-tight line-clamp-1">
                        {period.subject}
                      </span>
                      {period.class !== '-' && (
                        <span className="text-[10.5px] font-bold text-[#2F6690] mt-1">
                          Class: {period.class}
                        </span>
                      )}
                      {period.room !== '-' && (
                        <span className="text-[9.5px] font-medium text-[#5C6B7A] mt-0.5">
                          📍 {period.room}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}