'use client';

import { useState } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F | Danger #B3432B | Warning-tone #8A6512

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };

// Sample data (replace with API data)
const EXAMS = { 'Unit Test 1': 25, 'Unit Test 2': 25, 'Half-yearly': 80, 'Annual': 80 };
const SUBJECTS = ['Mathematics', 'EVS'];
const PASS_PERCENT = 33;

const STUDENTS = {
  Third: [
    { id: 931, name: 'Aditi Rao' }, { id: 932, name: 'Dev Malhotra' }, { id: 933, name: 'Kriti Jain' },
    { id: 934, name: 'Neel Saxena' }, { id: 935, name: 'Tara Bhatia' },
  ],
  Fourth: [
    { id: 1021, name: 'Aarav Singh' }, { id: 1022, name: 'Ananya Sharma' }, { id: 1023, name: 'Bhanuj Verma' },
    { id: 1024, name: 'Bhavesh Mehta' }, { id: 1025, name: 'Ishita Nair' }, { id: 1026, name: 'Kabir Khan' },
    { id: 1027, name: 'Meera Joshi' }, { id: 1028, name: 'Rohan Gupta' },
  ],
  Fifth: [
    { id: 1101, name: 'Aryan Kapoor' }, { id: 1102, name: 'Diya Menon' }, { id: 1103, name: 'Harsh Vyas' },
    { id: 1104, name: 'Naina Pillai' }, { id: 1105, name: 'Veer Chauhan' },
  ],
};

const INITIAL_STORE = {
  'Fourth|Mathematics|Unit Test 1': {
    1021: { m: '22' }, 1022: { m: '24' }, 1023: { m: '18' }, 1024: { m: '20' },
    1025: { m: '25' }, 1026: { m: '9' }, 1027: { m: '', ab: true }, 1028: { m: '19' },
  },
};

const gradeOf = (pct) =>
  pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= PASS_PERCENT ? 'D' : 'E';

const GRADE_STYLE = {
  'A+': { background: '#EAF4EE', color: '#2E7D4F' },
  A: { background: '#EAF4EE', color: '#2E7D4F' },
  B: { background: '#E8EEF7', color: '#1B3A6B' },
  C: { background: '#E8EEF7', color: '#2F6690' },
  D: { background: '#FBF1DE', color: '#8A6512' },
  E: { background: '#F8E9E5', color: '#B3432B' },
};

const selectStyle = { background: '#F5F7FA', color: '#2F6690', border: '1px solid #E2E7EE' };
const round1 = (x) => Number(x.toFixed(1));

export default function StaffMarksEntry() {
  const [cls, setCls] = useState('Fourth');
  const [subject, setSubject] = useState('Mathematics');
  const [exam, setExam] = useState('Unit Test 1');
  const [store, setStore] = useState(INITIAL_STORE);
  const [status, setStatus] = useState(null);

  const max = EXAMS[exam];
  const key = `${cls}|${subject}|${exam}`;
  const entries = store[key] || {};

  const setEntry = (id, patch) => {
    setStore((s) => ({
      ...s,
      [key]: { ...(s[key] || {}), [id]: { m: '', ab: false, ...((s[key] || {})[id] || {}), ...patch } },
    }));
    setStatus(null);
  };

  const rows = STUDENTS[cls].map((st) => {
    const e = { m: '', ab: false, ...(entries[st.id] || {}) };
    const n = parseFloat(e.m);
    const blank = e.m === '';
    const invalid = !e.ab && !blank && (Number.isNaN(n) || n < 0 || n > max);
    const pct = !e.ab && !blank && !invalid ? (n / max) * 100 : null;
    return { ...st, e, n, blank, invalid, pct };
  });

  const scored = rows.filter((r) => r.pct !== null);
  const entered = rows.filter((r) => r.e.ab || r.pct !== null).length;
  const invalidCount = rows.filter((r) => r.invalid).length;
  const avg = scored.length ? scored.reduce((s, r) => s + r.n, 0) / scored.length : null;
  const high = scored.length ? Math.max(...scored.map((r) => r.n)) : null;
  const low = scored.length ? Math.min(...scored.map((r) => r.n)) : null;
  const passRate = scored.length ? Math.round((scored.filter((r) => r.pct >= PASS_PERCENT).length / scored.length) * 100) : null;

  const save = () => {
    if (invalidCount) {
      setStatus({ ok: false, text: `Fix ${invalidCount} entr${invalidCount > 1 ? 'ies' : 'y'} (marks must be between 0 and ${max}) before saving.` });
      return;
    }
    const pending = rows.length - entered;
    setStatus({
      ok: true,
      text: `Saved ${entered} of ${rows.length} entries for Class ${cls} · ${subject} · ${exam}.${pending ? ` ${pending} still pending.` : ''}`,
    });
  };

  const stats = [
    { label: 'ENTERED', value: `${entered} / ${rows.length}`, accent: '#1B3A6B' },
    { label: 'CLASS AVERAGE', value: avg === null ? '—' : `${round1(avg)} / ${max}`, accent: '#2F6690' },
    { label: 'HIGHEST / LOWEST', value: scored.length ? `${high} / ${low}` : '—', accent: '#C6952C' },
    { label: 'PASS RATE', value: passRate === null ? '—' : `${passRate}%`, accent: '#2E7D4F' },
  ];

  return (
    <div className="space-y-5">

      {/* Selectors */}
      <div className="rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-4" style={card}>
        {[
          ['Class', cls, setCls, Object.keys(STUDENTS)],
          ['Subject', subject, setSubject, SUBJECTS],
          ['Exam', exam, setExam, Object.keys(EXAMS)],
        ].map(([label, value, setter, options]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold" style={{ color: '#1A2332' }}>{label}:</span>
            <select
              value={value}
              onChange={(e) => { setter(e.target.value); setStatus(null); }}
              className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer shadow-sm"
              style={selectStyle}
            >
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <span
          className="ml-auto px-3 py-1.5 rounded-sm text-xs font-bold"
          style={{ background: '#FBF1DE', color: '#8A6512' }}
        >
          Max marks: {max}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((c) => (
          <div key={c.label} className="p-4 rounded-md border-l-4 shadow-sm" style={{ ...card, borderLeftColor: c.accent }}>
            <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{c.label}</span>
            <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Entry table */}
      <div className="rounded-lg shadow-sm overflow-x-auto" style={card}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: '#5C6B7A', borderBottom: '1px solid #E2E7EE' }}>
              {['SR No.', 'Student', `Marks (out of ${max})`, '%', 'Grade', 'Absent'].map((h) => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wider font-bold px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ borderTop: i ? '1px solid #E2E7EE' : 'none', background: i % 2 ? '#FAFBFC' : 'transparent' }}>
                <td className="px-5 py-2.5 font-semibold" style={{ color: '#5C6B7A' }}>{r.id}</td>
                <td className="px-5 py-2.5 font-bold" style={{ color: '#1A2332' }}>{r.name}</td>
                <td className="px-5 py-2.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={max}
                    value={r.e.ab ? '' : r.e.m}
                    onChange={(e) => setEntry(r.id, { m: e.target.value })}
                    readOnly={r.e.ab}
                    placeholder={r.e.ab ? 'AB' : '—'}
                    className="w-24 px-3 py-1.5 rounded-md text-sm font-semibold outline-none"
                    style={{
                      background: r.e.ab ? '#E2E7EE' : '#F5F7FA',
                      color: '#1A2332',
                      border: `1px solid ${r.invalid ? '#B3432B' : '#E2E7EE'}`,
                    }}
                  />
                  {r.invalid && (
                    <span className="ml-2 text-xs font-semibold" style={{ color: '#B3432B' }}>0–{max} only</span>
                  )}
                </td>
                <td className="px-5 py-2.5 font-semibold" style={{ color: '#1A2332' }}>
                  {r.pct === null ? '—' : `${Math.round(r.pct)}%`}
                </td>
                <td className="px-5 py-2.5">
                  {r.e.ab ? (
                    <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={{ background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }}>AB</span>
                  ) : r.pct === null ? (
                    <span style={{ color: '#5C6B7A' }}>—</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={GRADE_STYLE[gradeOf(r.pct)]}>{gradeOf(r.pct)}</span>
                  )}
                </td>
                <td className="px-5 py-2.5">
                  <input
                    type="checkbox"
                    checked={!!r.e.ab}
                    onChange={(e) => setEntry(r.id, { ab: e.target.checked, m: e.target.checked ? '' : r.e.m })}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: '#1B3A6B' }}
                    aria-label={`Mark ${r.name} absent`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-4 flex items-center gap-4 flex-wrap" style={{ borderTop: '1px solid #E2E7EE' }}>
          <button
            onClick={save}
            className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
          >
            💾 Save marks
          </button>
          {status && (
            <span className="text-xs sm:text-sm font-semibold" style={{ color: status.ok ? '#2E7D4F' : '#B3432B' }}>
              {status.text}
            </span>
          )}
          <span className="ml-auto text-xs" style={{ color: '#5C6B7A' }}>
            Grades: A+ 90%+ · A 80% · B 70% · C 60% · D {PASS_PERCENT}% · E below pass
          </span>
        </div>
      </div>
    </div>
  );
}
