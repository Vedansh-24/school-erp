'use client';

import { useState } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F | Danger #B3432B | Warning-tone #8A6512

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };
const inputStyle = { background: '#F5F7FA', color: '#1A2332', border: '1px solid #E2E7EE' };

// ---------- Sample data (replace with API data) ----------
const ROSTER = [
  { id: 1021, name: 'Aarav Singh', cls: 'Fourth' }, { id: 1022, name: 'Ananya Sharma', cls: 'Fourth' },
  { id: 1023, name: 'Bhanuj Verma', cls: 'Fourth' }, { id: 1024, name: 'Bhavesh Mehta', cls: 'Fourth' },
  { id: 1025, name: 'Ishita Nair', cls: 'Fourth' }, { id: 1026, name: 'Kabir Khan', cls: 'Fourth' },
  { id: 931, name: 'Aditi Rao', cls: 'Third' }, { id: 932, name: 'Dev Malhotra', cls: 'Third' },
  { id: 935, name: 'Tara Bhatia', cls: 'Third' },
  { id: 1101, name: 'Aryan Kapoor', cls: 'Fifth' }, { id: 1102, name: 'Diya Menon', cls: 'Fifth' },
  { id: 1103, name: 'Rohan Gupta', cls: 'Fifth' },
];
const byId = Object.fromEntries(ROSTER.map((s) => [s.id, s]));
const CLASSES = ['Third', 'Fourth', 'Fifth'];

const MERIT_CATS = ['Academic excellence', 'Sports', 'Helping others', 'Punctuality & discipline', 'Arts & culture'];
const INCIDENT_CATS = ['Late coming', 'Homework not done', 'Disruption in class', 'Uniform / grooming', 'Conflict with a classmate', 'Property damage'];
const PHRASES = ['Participated well in class', 'Homework incomplete', 'Improvement shown today', 'Please practise at home'];

const SEVERITY_STYLE = {
  Minor: { background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' },
  Moderate: { background: '#FBF1DE', color: '#8A6512', border: '1px solid transparent' },
  Serious: { background: '#F8E9E5', color: '#B3432B', border: '1px solid transparent' },
};

const RATING_STYLE = {
  Excellent: { background: '#EAF4EE', color: '#2E7D4F', border: '1px solid #2E7D4F' },
  Good: { background: '#E8EEF7', color: '#1B3A6B', border: '1px solid #1B3A6B' },
  'Needs attention': { background: '#FBF1DE', color: '#8A6512', border: '1px solid #C6952C' },
};
const RATING_OFF = { background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' };

const INITIAL_RECORDS = [
  { id: 1, studentId: 1022, type: 'Merit', category: 'Academic excellence', points: 5, note: 'Scored full marks in Unit Test 1 Mathematics and helped classmates revise.', date: '2026-10-30', notified: true },
  { id: 2, studentId: 1026, type: 'Incident', category: 'Disruption in class', severity: 'Moderate', note: 'Repeatedly talked during the reading period after two reminders.', date: '2026-10-29', notified: true, resolved: false },
  { id: 3, studentId: 1025, type: 'Merit', category: 'Helping others', points: 3, note: 'Guided a new student to the library and the playground.', date: '2026-10-27', notified: false },
  { id: 4, studentId: 1024, type: 'Incident', category: 'Homework not done', severity: 'Minor', note: 'Mathematics homework incomplete for the third day this week.', date: '2026-10-26', notified: true, resolved: true },
  { id: 5, studentId: 1101, type: 'Merit', category: 'Sports', points: 3, note: 'Won the 100 m race at the inter-house practice meet.', date: '2026-10-24', notified: false },
  { id: 6, studentId: 1103, type: 'Incident', category: 'Late coming', severity: 'Minor', note: 'Arrived 20 minutes late on Monday and Tuesday.', date: '2026-10-20', notified: false, resolved: false },
];

// ---------- helpers ----------
const pad = (n) => String(n).padStart(2, '0');
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmt = (iso) => iso.split('-').reverse().join('/');
const daysAgo = (iso) =>
  Math.round((new Date().setHours(0, 0, 0, 0) - new Date(`${iso}T00:00:00`)) / 86400000);
const when = (iso) => {
  const d = daysAgo(iso);
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return fmt(iso);
};

const Err = ({ children }) =>
  children ? <p className="text-xs font-semibold mt-1" style={{ color: '#B3432B' }}>{children}</p> : null;
const Label = ({ children }) => (
  <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: '#5C6B7A' }}>{children}</span>
);

export default function StaffBehaviorLog() {
  const [tab, setTab] = useState('Incident / Merit Tracker');

  // ----- tracker state -----
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ studentId: '', type: 'Merit', category: MERIT_CATS[0], severity: 'Minor', points: '3', note: '', notify: true });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // ----- diary state -----
  const [cls, setCls] = useState('Fourth');
  const [date, setDate] = useState(todayISO());
  const [diary, setDiary] = useState(() => ({
    [`Fourth|${todayISO()}`]: {
      1021: { rating: 'Excellent', text: 'Participated well in class', sent: true },
      1022: { rating: 'Excellent', text: 'Scored full marks in the maths quiz. Well done!', sent: true },
      1023: { rating: 'Good', text: 'Improvement shown today', sent: false },
      1024: { rating: 'Needs attention', text: 'Homework incomplete', sent: false },
    },
  }));
  const [diaryMsg, setDiaryMsg] = useState('');

  // ===== tracker logic =====
  const recent = records.filter((r) => daysAgo(r.date) <= 30);
  const stats = [
    { label: 'MERITS (30 DAYS)', value: recent.filter((r) => r.type === 'Merit').length, accent: '#2E7D4F' },
    { label: 'INCIDENTS (30 DAYS)', value: recent.filter((r) => r.type === 'Incident').length, accent: '#B3432B' },
    { label: 'OPEN FOLLOW-UPS', value: records.filter((r) => r.type === 'Incident' && !r.resolved).length, accent: '#C6952C' },
    { label: 'MERIT POINTS', value: recent.filter((r) => r.type === 'Merit').reduce((s, r) => s + r.points, 0), accent: '#1B3A6B' },
  ];

  const setField = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: undefined });
    setSaved(false);
  };
  const setType = (type) => {
    setForm({ ...form, type, category: type === 'Merit' ? MERIT_CATS[0] : INCIDENT_CATS[0] });
    setSaved(false);
  };

  const saveRecord = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.studentId) err.studentId = 'Choose a student';
    if (!form.note.trim()) err.note = 'Add a short description';
    setErrors(err);
    if (Object.keys(err).length) return;

    const base = {
      id: Date.now(), studentId: Number(form.studentId), type: form.type, category: form.category,
      note: form.note.trim(), date: todayISO(), notified: form.notify,
    };
    setRecords([
      form.type === 'Merit'
        ? { ...base, points: Number(form.points) }
        : { ...base, severity: form.severity, resolved: false },
      ...records,
    ]);
    setForm({ ...form, studentId: '', note: '' });
    setSaved(true);
  };

  const toggleResolved = (id) =>
    setRecords((list) => list.map((r) => (r.id === id ? { ...r, resolved: !r.resolved } : r)));

  const visibleRecords = records
    .filter((r) => (filter === 'All' ? true : filter === 'Open' ? r.type === 'Incident' && !r.resolved : r.type === filter))
    .filter((r) => `${byId[r.studentId].name} ${r.note}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  // ===== diary logic =====
  const dKey = `${cls}|${date}`;
  const entries = diary[dKey] || {};
  const rows = ROSTER.filter((s) => s.cls === cls).map((s) => ({
    ...s, d: { rating: '', text: '', sent: false, ...(entries[s.id] || {}) },
  }));
  const written = rows.filter((r) => r.d.rating || r.d.text.trim()).length;
  const sentCount = rows.filter((r) => r.d.sent).length;
  const pending = rows.filter((r) => !r.d.sent && (r.d.rating || r.d.text.trim()));

  const setD = (id, patch) => {
    setDiary((s) => ({
      ...s,
      [dKey]: { ...(s[dKey] || {}), [id]: { rating: '', text: '', ...((s[dKey] || {})[id] || {}), ...patch, sent: false } },
    }));
    setDiaryMsg('');
  };

  // In a real app, call your API / WhatsApp / SMS service here before marking as sent.
  const sendToParents = () => {
    if (!pending.length) {
      setDiaryMsg('Nothing new to send.');
      return;
    }
    setDiary((s) => ({
      ...s,
      [dKey]: { ...(s[dKey] || {}), ...Object.fromEntries(pending.map((r) => [r.id, { ...r.d, sent: true }])) },
    }));
    setDiaryMsg(`Diary sent to ${pending.length} parent${pending.length > 1 ? 's' : ''} for ${fmt(date)}.`);
  };

  return (
    <div className="space-y-5">

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 p-2 rounded-xl" style={card}>
        {['Incident / Merit Tracker', 'Daily Diary / Remarks'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold transition-all duration-200 ${
              tab === t
                ? 'bg-gradient-to-r from-[#00C9A7] to-[#0D9488] text-white shadow-md'
                : 'bg-[#F5F7FA] text-slate-600 hover:bg-[#E2E7EE]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ================= Incident / Merit Tracker ================= */}
      {tab === 'Incident / Merit Tracker' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {stats.map((c) => (
              <div key={c.label} className="p-4 rounded-md border-l-4 shadow-sm" style={{ ...card, borderLeftColor: c.accent }}>
                <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{c.label}</span>
                <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Add record */}
            <form onSubmit={saveRecord} noValidate className="rounded-lg shadow-sm self-start" style={card}>
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Add a record</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <Label>Student</Label>
                  <select value={form.studentId} onChange={setField('studentId')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                    <option value="">Select student</option>
                    {ROSTER.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.cls}</option>)}
                  </select>
                  <Err>{errors.studentId}</Err>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['Merit', 'Incident'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className="px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition"
                      style={
                        form.type === t
                          ? t === 'Merit'
                            ? { background: '#EAF4EE', color: '#2E7D4F', border: '1px solid #2E7D4F' }
                            : { background: '#F8E9E5', color: '#B3432B', border: '1px solid #B3432B' }
                          : RATING_OFF
                      }
                    >
                      {t === 'Merit' ? '⭐ Merit' : '⚠️ Incident'}
                    </button>
                  ))}
                </div>

                <div>
                  <Label>Category</Label>
                  <select value={form.category} onChange={setField('category')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                    {(form.type === 'Merit' ? MERIT_CATS : INCIDENT_CATS).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <Label>{form.type === 'Merit' ? 'Merit points' : 'Severity'}</Label>
                  {form.type === 'Merit' ? (
                    <select value={form.points} onChange={setField('points')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                      {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>+{p}</option>)}
                    </select>
                  ) : (
                    <select value={form.severity} onChange={setField('severity')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                      {['Minor', 'Moderate', 'Serious'].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  )}
                </div>

                <div>
                  <Label>What happened</Label>
                  <textarea
                    rows={3}
                    value={form.note}
                    onChange={setField('note')}
                    placeholder="Describe briefly and factually"
                    className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none resize-none"
                    style={inputStyle}
                  />
                  <Err>{errors.note}</Err>
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: '#1A2332' }}>
                  <input
                    type="checkbox"
                    checked={form.notify}
                    onChange={(e) => setForm({ ...form, notify: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#1B3A6B' }}
                  />
                  Notify parent
                </label>

                <button type="submit" className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-md font-bold transition shadow-md">
                  💾 Save record
                </button>
                {saved && <p className="text-xs font-semibold" style={{ color: '#2E7D4F' }}>Record saved.</p>}
              </div>
            </form>

            {/* Log */}
            <div className="lg:col-span-2 rounded-lg shadow-sm" style={card}>
              <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid #E2E7EE' }}>
                <div className="flex gap-2">
                  {['All', 'Merit', 'Incident', 'Open'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all duration-200 ${
                        filter === f
                          ? 'bg-gradient-to-r from-[#00C9A7] to-[#0D9488] text-white shadow-md'
                          : 'bg-[#F5F7FA] text-slate-600 hover:bg-[#E2E7EE]'
                      }`}
                    >
                      {f === 'Open' ? 'Open follow-up' : f}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs" style={{ color: '#5C6B7A' }}>🔍</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search student"
                    className="text-xs sm:text-sm font-semibold pl-9 pr-3 py-2 rounded-md w-44 outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {visibleRecords.length === 0 ? (
                <div className="p-10 text-center text-sm font-semibold" style={{ color: '#5C6B7A' }}>No records match your filter.</div>
              ) : (
                <ul>
                  {visibleRecords.map((r, i) => {
                    const s = byId[r.studentId];
                    const merit = r.type === 'Merit';
                    return (
                      <li
                        key={r.id}
                        className="px-5 py-3.5 flex items-start justify-between gap-4"
                        style={{
                          borderTop: i ? '1px solid #E2E7EE' : 'none',
                          borderLeft: `4px solid ${merit ? '#2E7D4F' : r.resolved ? '#E2E7EE' : '#B3432B'}`,
                          opacity: !merit && r.resolved ? 0.8 : 1,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black" style={{ color: '#1A2332' }}>{s.name}</span>
                            <span className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>Class {s.cls}</span>
                          </div>
                          <div className="text-xs font-bold mt-0.5" style={{ color: merit ? '#2E7D4F' : '#B3432B' }}>{r.category}</div>
                          <p className="text-sm mt-1" style={{ color: '#1A2332' }}>{r.note}</p>
                          <div className="text-xs font-semibold mt-1" style={{ color: '#5C6B7A' }}>
                            {when(r.date)} · {r.notified ? 'Parent notified' : 'Parent not notified'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {merit ? (
                            <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={{ background: '#EAF4EE', color: '#2E7D4F' }}>Merit +{r.points}</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={SEVERITY_STYLE[r.severity]}>{r.severity}</span>
                          )}
                          {!merit && (
                            <button
                              onClick={() => toggleResolved(r.id)}
                              className="text-xs px-3 py-1.5 rounded-md font-bold transition"
                              style={
                                r.resolved
                                  ? { background: '#EAF4EE', color: '#2E7D4F', border: '1px solid #2E7D4F' }
                                  : { background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }
                              }
                            >
                              {r.resolved ? '✓ Resolved (undo)' : 'Mark resolved'}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= Daily Diary / Remarks ================= */}
      {tab === 'Daily Diary / Remarks' && (
        <div className="rounded-lg shadow-sm" style={card}>
          <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold" style={{ color: '#1A2332' }}>Class:</span>
                <select
                  value={cls}
                  onChange={(e) => { setCls(e.target.value); setDiaryMsg(''); }}
                  className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer"
                  style={{ ...inputStyle, color: '#2F6690' }}
                >
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold" style={{ color: '#1A2332' }}>Date:</span>
                <input
                  type="date"
                  value={date}
                  max={todayISO()}
                  onChange={(e) => { if (e.target.value) { setDate(e.target.value); setDiaryMsg(''); } }}
                  className="text-xs sm:text-sm font-bold rounded-md px-3 py-1.5 outline-none"
                  style={{ ...inputStyle, color: '#2F6690' }}
                />
              </div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#5C6B7A' }}>
              {written} of {rows.length} written · {sentCount} sent
            </span>
          </div>

          <datalist id="diary-phrases">
            {PHRASES.map((p) => <option key={p} value={p} />)}
          </datalist>

          <ul>
            {rows.map((r, i) => (
              <li
                key={r.id}
                className="px-5 py-3 flex items-center gap-4 flex-wrap"
                style={{ borderTop: i ? '1px solid #E2E7EE' : 'none', background: i % 2 ? '#FAFBFC' : 'transparent' }}
              >
                <div className="w-40 shrink-0">
                  <div className="text-sm font-bold" style={{ color: '#1A2332' }}>{r.name}</div>
                  <div className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>SR No. {r.id}</div>
                </div>

                <div className="flex gap-1.5">
                  {Object.keys(RATING_STYLE).map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setD(r.id, { rating: r.d.rating === rt ? '' : rt })}
                      className="text-xs px-2.5 py-1.5 rounded-md font-bold transition"
                      style={r.d.rating === rt ? RATING_STYLE[rt] : RATING_OFF}
                    >
                      {rt}
                    </button>
                  ))}
                </div>

                <input
                  list="diary-phrases"
                  value={r.d.text}
                  onChange={(e) => setD(r.id, { text: e.target.value })}
                  placeholder="Short remark for parents"
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-md text-sm font-semibold outline-none"
                  style={inputStyle}
                />

                <span className="w-16 text-right shrink-0">
                  {r.d.sent && (
                    <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={{ background: '#EAF4EE', color: '#2E7D4F' }}>Sent</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="px-5 py-4 flex items-center gap-4 flex-wrap" style={{ borderTop: '1px solid #E2E7EE' }}>
            <button
              onClick={sendToParents}
              className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
            >
              📨 Send to parents ({pending.length})
            </button>
            {diaryMsg && (
              <span className="text-xs sm:text-sm font-semibold" style={{ color: '#2E7D4F' }}>{diaryMsg}</span>
            )}
            <span className="ml-auto text-xs" style={{ color: '#5C6B7A' }}>
              Editing a sent remark marks it unsent, so you can send the updated note.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
