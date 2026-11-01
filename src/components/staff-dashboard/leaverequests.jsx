'use client';

import { useState } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F | Danger #B3432B | Warning-tone #8A6512

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };

// Yearly leave quota per type (replace with school policy / API data)
const QUOTA = { 'Casual leave': 12, 'Earned leave': 15, 'Sick leave': 10 };
const ACCENT = { 'Casual leave': '#1B3A6B', 'Earned leave': '#2F6690', 'Sick leave': '#C6952C' };

const STATUS_STYLE = {
  Approved: { background: '#EAF4EE', color: '#2E7D4F' },
  Pending: { background: '#FBF1DE', color: '#8A6512' },
  Rejected: { background: '#F8E9E5', color: '#B3432B' },
};

// Sample data (replace with API data)
const INITIAL = [
  { id: 5, type: 'Casual leave', from: '2026-11-14', to: '2026-11-14', days: 1, reason: "Relative's wedding", status: 'Pending' },
  { id: 4, type: 'Casual leave', from: '2026-09-15', to: '2026-09-15', days: 1, reason: 'Family function', status: 'Approved' },
  { id: 3, type: 'Earned leave', from: '2026-08-10', to: '2026-08-12', days: 3, reason: 'Out-of-station visit', status: 'Approved' },
  { id: 2, type: 'Sick leave', from: '2026-07-22', to: '2026-07-23', days: 2, reason: 'Medical appointment', status: 'Approved' },
  { id: 1, type: 'Casual leave', from: '2026-06-05', to: '2026-06-05', days: 1, reason: 'Personal work', status: 'Rejected', remark: 'Exam duty that day' },
];

const fmt = (iso) => iso.split('-').reverse().join('/');
const countDays = (from, to) =>
  Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000) + 1;

const inputStyle = { background: '#F5F7FA', color: '#1A2332', border: '1px solid #E2E7EE' };

const FieldWrap = ({ label, error, children }) => (
  <div>
    <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: '#5C6B7A' }}>{label}</span>
    {children}
    {error && <p className="text-xs font-semibold mt-1" style={{ color: '#B3432B' }}>{error}</p>}
  </div>
);

export default function StaffLeaveRequests() {
  const [requests, setRequests] = useState(INITIAL);
  const [form, setForm] = useState({ type: 'Casual leave', from: '', to: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const sum = (type, status) =>
    requests.filter((r) => r.type === type && r.status === status).reduce((s, r) => s + r.days, 0);
  const left = (type) => QUOTA[type] - sum(type, 'Approved');

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: undefined });
    setSent(false);
  };

  const duration =
    form.from && form.to && form.to >= form.from ? countDays(form.from, form.to) : null;

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.from) err.from = 'Choose a start date';
    if (!form.to) err.to = 'Choose an end date';
    if (form.from && form.to && form.to < form.from) err.to = "End date can't be before the start date";
    if (!form.reason.trim()) err.reason = 'Add a short reason';
    if (!err.from && !err.to && duration > left(form.type)) {
      err.to = `Only ${left(form.type)} day(s) of ${form.type.toLowerCase()} left`;
    }
    setErrors(err);
    if (Object.keys(err).length) return;

    setRequests([
      { id: Date.now(), type: form.type, from: form.from, to: form.to, days: duration, reason: form.reason.trim(), status: 'Pending' },
      ...requests,
    ]);
    setForm({ type: form.type, from: '', to: '', reason: '' });
    setSent(true);
  };

  const withdraw = (id) => setRequests(requests.filter((r) => r.id !== id));

  return (
    <div className="space-y-5">

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {Object.keys(QUOTA).map((t) => {
          const pend = sum(t, 'Pending');
          return (
            <div key={t} className="p-4 rounded-md border-l-4 shadow-sm" style={{ ...card, borderLeftColor: ACCENT[t] }}>
              <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{t}</span>
              <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>
                {left(t)} <span className="text-sm font-semibold" style={{ color: '#5C6B7A' }}>of {QUOTA[t]} days left</span>
              </div>
              {pend > 0 && (
                <div className="text-xs font-semibold mt-1" style={{ color: '#8A6512' }}>{pend} day(s) pending approval</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Apply form */}
        <form onSubmit={submit} className="rounded-lg shadow-sm self-start" style={card} noValidate>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Apply for leave</h3>
          </div>
          <div className="p-5 space-y-4">
            <FieldWrap label="Leave type">
              <select value={form.type} onChange={update('type')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                {Object.keys(QUOTA).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FieldWrap>

            <div className="grid grid-cols-2 gap-3">
              <FieldWrap label="From" error={errors.from}>
                <input type="date" value={form.from} onChange={update('from')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
              </FieldWrap>
              <FieldWrap label="To" error={errors.to}>
                <input type="date" value={form.to} onChange={update('to')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
              </FieldWrap>
            </div>

            {duration && (
              <div className="text-sm font-semibold" style={{ color: '#2F6690' }}>
                Duration: {duration} day{duration > 1 ? 's' : ''}
              </div>
            )}

            <FieldWrap label="Reason" error={errors.reason}>
              <textarea
                rows={3}
                value={form.reason}
                onChange={update('reason')}
                placeholder="Briefly explain the reason"
                className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none resize-none"
                style={inputStyle}
              />
            </FieldWrap>

            <button
              type="submit"
              className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-md font-bold transition shadow-md"
            >
              📨 Submit request
            </button>
            {sent && (
              <p className="text-xs font-semibold" style={{ color: '#2E7D4F' }}>
                Request submitted. The principal will review it.
              </p>
            )}
          </div>
        </form>

        {/* History */}
        <div className="lg:col-span-2 rounded-lg shadow-sm" style={card}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>My leave requests</h3>
            <span className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>{requests.length} total</span>
          </div>
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold" style={{ color: '#5C6B7A' }}>No leave requests yet.</div>
          ) : (
            <ul>
              {requests.map((r, i) => (
                <li
                  key={r.id}
                  className="px-5 py-3.5 flex items-start justify-between gap-4"
                  style={{ borderTop: i ? '1px solid #E2E7EE' : 'none', background: i % 2 ? '#FAFBFC' : 'transparent' }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold" style={{ color: '#1A2332' }}>
                      {r.type} · {r.days} day{r.days > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>
                      {r.from === r.to ? fmt(r.from) : `${fmt(r.from)} – ${fmt(r.to)}`}
                    </div>
                    <div className="text-sm mt-1" style={{ color: '#1A2332' }}>{r.reason}</div>
                    {r.remark && (
                      <div className="text-xs mt-1 italic" style={{ color: '#B3432B' }}>Remark: {r.remark}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={STATUS_STYLE[r.status]}>{r.status}</span>
                    {r.status === 'Pending' && (
                      <button
                        onClick={() => withdraw(r.id)}
                        className="bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs px-3 py-1.5 rounded-md font-bold transition shadow-md"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
