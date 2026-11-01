'use client';

import React from 'react';

export default function ClassSchedule() {
  // Full 8 Periods Schedule for Today
  const schedule = [
    { period: 'Period 1', time: '08:00 AM - 08:40 AM', subject: 'Mathematics (Class Fourth)', room: 'Room 101', type: 'class', status: 'Completed' },
    { period: 'Period 2', time: '08:40 AM - 09:20 AM', subject: 'Mathematics (Class Third)', room: 'Room 102', type: 'class', status: 'Completed' },
    { period: 'Period 3', time: '09:20 AM - 10:00 AM', subject: 'Free Period / Planning', room: 'Staff Room', type: 'free', status: 'Completed' },
    { period: 'Period 4', time: '10:00 AM - 10:40 AM', subject: 'EVS (Class Fifth)', room: 'Room 105', type: 'class', status: 'Ongoing' },
    { period: 'Break', time: '10:40 AM - 11:10 AM', subject: 'RECESS / LUNCH BREAK', room: 'Cafeteria', type: 'break', status: 'Upcoming' },
    { period: 'Period 5', time: '11:10 AM - 11:50 AM', subject: 'Mathematics (Class Fourth)', room: 'Room 101', type: 'class', status: 'Upcoming' },
    { period: 'Period 6', time: '11:50 AM - 12:30 PM', subject: 'EVS (Class Third)', room: 'Room 102', type: 'class', status: 'Upcoming' },
    { period: 'Period 7', time: '12:30 PM - 01:10 PM', subject: 'Class Teacher Hour', room: 'Room 101', type: 'special', status: 'Upcoming' },
    { period: 'Period 8', time: '01:10 PM - 01:50 PM', subject: 'Free Period / Doubts Session', room: 'Staff Room', type: 'free', status: 'Upcoming' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#2E7D4F]/10 text-[#2E7D4F] border-[#2E7D4F]/30';
      case 'Ongoing':
        return 'bg-[#C6952C]/10 text-[#8A6512] border-[#C6952C]/40 animate-pulse font-bold';
      case 'Upcoming':
      default:
        return 'bg-[#2F6690]/10 text-[#2F6690] border-[#2F6690]/30';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E7EE] rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E7EE]">
        <div>
          <h3 className="text-xl font-black text-[#1B3A6B] tracking-tight flex items-center gap-2">
            <span>⏰</span> Today's Class Schedule (8 Periods)
          </h3>
          <p className="text-xs font-semibold text-[#5C6B7A] mt-0.5">
            Real-time daily timeline & period allocations for Mrs. Sunita Sharma
          </p>
        </div>

        {/* Status Count Summary */}
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="px-3 py-1 rounded-lg bg-[#2E7D4F]/10 text-[#2E7D4F] border border-[#2E7D4F]/30">
            ✓ 3 Completed
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#C6952C]/10 text-[#8A6512] border border-[#C6952C]/40">
            ⚡ 1 Active
          </span>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {schedule.map((cls, idx) => (
          <div 
            key={idx} 
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#F5F7FA] to-[#FFFFFF] border border-[#E2E7EE] hover:border-[#2F6690]/50 hover:shadow-md transition-all duration-200 gap-3"
          >
            <div className="flex items-start sm:items-center gap-3">
              {/* Period Number Tag */}
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#1B3A6B] text-white shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                {cls.period}
              </span>

              <div>
                <p className="font-extrabold text-[#1A2332] text-sm sm:text-base leading-snug">
                  {cls.subject}
                </p>
                <p className="text-xs font-semibold text-[#5C6B7A] mt-0.5 flex items-center gap-2">
                  <span>🕒 {cls.time}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Status Badge */}
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(cls.status)}`}>
                {cls.status}
              </span>

              {/* Room Location Tag */}
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#FFFFFF] text-[#2F6690] border border-[#2F6690]/30 shadow-2xs">
                📍 {cls.room}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}