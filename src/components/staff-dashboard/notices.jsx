'use client';

import { useState } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F | Warning-tone #8A6512

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };

const CATEGORY_STYLE = {
  Exam: { background: '#E8EEF7', color: '#1B3A6B' },
  Event: { background: '#FBF1DE', color: '#8A6512' },
  Holiday: { background: '#EAF4EE', color: '#2E7D4F' },
  Meeting: { background: '#E8EEF7', color: '#2F6690' },
  General: { background: '#F5F7FA', color: '#5C6B7A' },
};

const FILTERS = ['All', 'Unread', 'Exam', 'Event', 'Holiday', 'Meeting', 'General'];

// Sample data (replace with API data)
const INITIAL = [
  {
    id: 1, pinned: true, read: false, category: 'Event', date: '2026-11-01', by: 'Principal',
    title: 'PTM scheduled for Class 3–5',
    body: 'The parent-teacher meeting for Classes 3 to 5 will be held on Saturday, 21 November, from 9:00 AM to 12:00 PM. Class teachers should keep progress sheets ready by Friday.',
  },
  {
    id: 2, pinned: true, read: false, category: 'Exam', date: '2026-10-30', by: 'Exam cell',
    title: 'Half-yearly exam datesheet released',
    body: 'The half-yearly examinations begin on 1 December. Question papers must be submitted to the exam cell by 20 November.',
  },
  {
    id: 3, pinned: false, read: false, category: 'Holiday', date: '2026-10-29', by: 'Office',
    title: 'Diwali break circular',
    body: 'The school will remain closed from 7 to 11 November for Diwali. Classes resume on Thursday, 12 November.',
  },
  {
    id: 4, pinned: false, read: true, category: 'Event', date: '2026-10-31', by: 'Sports department',
    title: 'Annual sports day duty roster',
    body: 'The duty roster for the annual sports day is out. Check your assigned field and report by 7:30 AM on the day.',
  },
  {
    id: 5, pinned: false, read: true, category: 'Meeting', date: '2026-10-28', by: 'Principal',
    title: 'Staff meeting on Monday',
    body: 'All teaching staff should attend the staff meeting in the library at 2:30 PM on Monday, 2 November. Agenda: half-yearly exam duties and syllabus completion.',
  },
  {
    id: 6, pinned: false, read: true, category: 'General', date: '2026-10-26', by: 'Office',
    title: 'Submit monthly attendance report',
    body: "Class teachers should submit October's attendance report to the office by 3 November.",
  },
];

const when = (iso) => {
  const diff = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(`${iso}T00:00:00`)) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return iso.split('-').reverse().join('/');
};

export default function StaffNotices() {
  const [notices, setNotices] = useState(INITIAL);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const unread = notices.filter((n) => !n.read).length;
  const pinned = notices.filter((n) => n.pinned).length;

  const visible = notices
    .filter((n) => (filter === 'All' ? true : filter === 'Unread' ? !n.read : n.category === filter))
    .filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (b.pinned - a.pinned) || b.date.localeCompare(a.date));

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
    setNotices((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => setNotices((list) => list.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          { label: 'TOTAL NOTICES', value: notices.length, accent: '#1B3A6B' },
          { label: 'UNREAD', value: unread, accent: '#C6952C' },
          { label: 'PINNED', value: pinned, accent: '#2F6690' },
        ].map((c) => (
          <div key={c.label} className="p-4 rounded-md border-l-4 shadow-sm" style={{ ...card, borderLeftColor: c.accent }}>
            <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{c.label}</span>
            <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="rounded-lg shadow-sm p-3 flex flex-wrap items-center justify-between gap-3" style={card}>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all duration-200 ${
                filter === f
                  ? 'bg-gradient-to-r from-[#00C9A7] to-[#0D9488] text-white shadow-md'
                  : 'bg-[#F5F7FA] text-slate-600 hover:bg-[#E2E7EE]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs" style={{ color: '#5C6B7A' }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notices"
              className="text-xs sm:text-sm font-semibold pl-9 pr-3 py-2 rounded-md w-48 outline-none"
              style={{ background: '#F5F7FA', color: '#1A2332', border: '1px solid #E2E7EE' }}
            />
          </div>
          <button
            onClick={markAllRead}
            className="bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md whitespace-nowrap"
          >
            ✓ Mark all as read
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-lg shadow-sm" style={card}>
        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm font-semibold" style={{ color: '#5C6B7A' }}>
            No notices match your filter.
          </div>
        ) : (
          <ul>
            {visible.map((n, i) => {
              const open = openId === n.id;
              return (
                <li key={n.id} style={{ borderTop: i ? '1px solid #E2E7EE' : 'none' }}>
                  <button onClick={() => toggle(n.id)} className="w-full text-left px-5 py-4 flex items-start gap-3">
                    <span
                      className="mt-2 w-2 h-2 rounded-full shrink-0"
                      style={{ background: n.read ? 'transparent' : '#C6952C' }}
                      aria-label={n.read ? 'Read' : 'Unread'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm ${n.read ? 'font-bold' : 'font-black'}`} style={{ color: '#1A2332' }}>
                          {n.title}
                        </span>
                        {n.pinned && (
                          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#8A6512' }}>📌 Pinned</span>
                        )}
                      </div>
                      <div className="text-xs font-semibold mt-0.5" style={{ color: '#5C6B7A' }}>
                        {n.by} · {when(n.date)}
                      </div>
                      {open ? (
                        <p className="text-sm mt-2 leading-relaxed" style={{ color: '#1A2332' }}>{n.body}</p>
                      ) : (
                        <p className="text-sm mt-1 truncate" style={{ color: '#5C6B7A' }}>{n.body}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-sm text-xs font-bold shrink-0" style={CATEGORY_STYLE[n.category]}>
                      {n.category}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
