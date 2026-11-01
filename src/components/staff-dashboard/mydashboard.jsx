'use client';

import React from 'react';

const cardStyle = { background: '#FFFFFF', border: '1px solid #E2E7EE' };

const StatCard = ({ label, value, accent, valueColor = '#1A2332' }) => (
  <div
    className="p-4 rounded-md border-l-4 shadow-sm"
    style={{ ...cardStyle, borderLeftColor: accent }}
  >
    <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>
      {label}
    </span>
    <div className="text-2xl font-black mt-1" style={{ color: valueColor }}>
      {value}
    </div>
  </div>
);

export default function MyDashboardView({
  stats = [
    { label: 'MY CLASSES TODAY', value: '5', accent: '#1B3A6B' },
    { label: 'STUDENTS IN MY CLASS', value: '32', accent: '#2F6690' },
    { label: 'ATTENDANCE MARKED', value: '3 / 5', accent: '#C6952C' },
    { label: 'HOMEWORK TO CHECK', value: '18', accent: '#2F6690' },
    { label: 'LEAVE BALANCE', value: '7 days', accent: '#1B3A6B' },
    { label: 'SALARY (THIS MONTH)', value: 'Processing', accent: '#C6952C', valueColor: '#8A6512' },
  ],
  timetable = [
    { time: '08:00 – 08:40', cls: 'Fourth', subject: 'Mathematics', done: true },
    { time: '08:40 – 09:20', cls: 'Third', subject: 'Mathematics', done: true },
    { time: '09:40 – 10:20', cls: 'Fifth', subject: 'EVS', done: true },
    { time: '10:20 – 11:00', cls: 'Fourth', subject: 'Mathematics', done: false },
    { time: '11:20 – 12:00', cls: 'Third', subject: 'EVS', done: false },
  ],
  tasks = [
    'Check Class Fourth Maths homework (18 pending)',
    'Enter Unit Test marks – Class Third',
    'Reply to 2 parent messages',
    'Submit monthly attendance report',
  ],
  notices = [
    { title: 'PTM scheduled for Class 3–5', when: 'Today' },
    { title: 'Annual sports day — duty roster out', when: 'Yesterday' },
    { title: 'Diwali break circular', when: '2 days ago' },
  ]
}) {
  return (
    <div className="space-y-5 font-sans" style={{ background: '#F5F7FA', color: '#1A2332' }}>
      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Timetable & Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Today's Timetable */}
        <div className="lg:col-span-2 rounded-lg shadow-sm" style={cardStyle}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>
              TODAY'S TIMETABLE
            </h3>
          </div>
          <ul>
            {timetable.map((t, i) => (
              <li
                key={t.time}
                className="px-5 py-3 flex items-center justify-between"
                style={{
                  borderTop: i ? '1px solid #E2E7EE' : 'none',
                  background: i % 2 ? '#FAFBFC' : 'transparent'
                }}
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1A2332' }}>
                    {t.subject} — Class {t.cls}
                  </div>
                  <div className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>
                    {t.time}
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{
                    background: t.done ? '#EAF4EE' : '#FBF1DE',
                    color: t.done ? '#2E7D4F' : '#8A6512',
                  }}
                >
                  {t.done ? 'Completed' : 'Upcoming'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Tasks */}
        <div className="rounded-lg shadow-sm" style={cardStyle}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>
              PENDING TASKS
            </h3>
          </div>
          <ul className="p-5 space-y-3">
            {tasks.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm font-semibold" style={{ color: '#1A2332' }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C6952C' }} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Notices Block */}
      <div className="rounded-lg p-5 shadow-sm" style={cardStyle}>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#8A6512' }}>
          📢 NOTICES
        </h3>
        <div className="space-y-2">
          {notices.map((n) => (
            <div
              key={n.title}
              className="flex items-center justify-between p-3.5 rounded-md"
              style={{ background: '#F5F7FA', border: '1px solid #E2E7EE' }}
            >
              <span className="text-sm font-bold" style={{ color: '#1A2332' }}>
                {n.title}
              </span>
              <span className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>
                {n.when}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}