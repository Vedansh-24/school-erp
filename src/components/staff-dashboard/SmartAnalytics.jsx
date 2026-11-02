'use client';

import { useState } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F | Danger #B3432B | Warning-tone #8A6512

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };
const STAFF_NAME = 'Mrs. Sunita Sharma';

// ---------- Sample data (replace with API data) ----------
const CLASS_RESULTS = [
  { label: 'Mathematics · Fourth', avg: 74, prev: 70 },
  { label: 'Mathematics · Third', avg: 79, prev: 81 },
  { label: 'EVS · Fifth', avg: 82, prev: 78 },
];

const SYLLABUS = [
  { label: 'Mathematics · Fourth', done: 62, expected: 70 },
  { label: 'Mathematics · Third', done: 71, expected: 70 },
  { label: 'EVS · Fifth', done: 68, expected: 68 },
];

const ATTENDANCE = [
  { m: 'Jun', v: 93 }, { m: 'Jul', v: 92 }, { m: 'Aug', v: 95 }, { m: 'Sep', v: 94 }, { m: 'Oct', v: 91 },
];

const RETENTION = { start: 36, retained: 35 };

// streak = consecutive absent days, att30 = attendance % in last 30 days,
// marks = last 3 test percentages (oldest → latest)
const STUDENTS = [
  { id: 1, name: 'Kabir Khan', cls: 'Fourth', phone: '9800000001', streak: 5, att30: 62, marks: [74, 58, 41], followed: false },
  { id: 2, name: 'Meera Joshi', cls: 'Fourth', phone: '9800000002', streak: 3, att30: 81, marks: [70, 62, 55], followed: false },
  { id: 3, name: 'Rohan Gupta', cls: 'Fifth', phone: '9800000003', streak: 0, att30: 88, marks: [82, 69, 58], followed: true },
  { id: 4, name: 'Tara Bhatia', cls: 'Third', phone: '9800000004', streak: 2, att30: 79, marks: [66, 63, 61], followed: false },
  { id: 5, name: 'Bhavesh Mehta', cls: 'Fourth', phone: '9800000005', streak: 0, att30: 86, marks: [72, 70, 64], followed: false },
  { id: 6, name: 'Aarav Singh', cls: 'Fourth', phone: '9800000006', streak: 0, att30: 97, marks: [80, 84, 88], followed: false },
  { id: 7, name: 'Ananya Sharma', cls: 'Fourth', phone: '9800000007', streak: 0, att30: 95, marks: [90, 92, 94], followed: false },
];

// Transparent rule-based score. Swap this function for a call to your own
// ML model / API if you want real predictions. Each reason is shown to the teacher.
const scoreStudent = (s) => {
  let score = 0;
  const reasons = [];

  if (s.streak >= 5) score += 40;
  else if (s.streak >= 3) score += 28;
  else if (s.streak >= 2) score += 15;
  if (s.streak >= 2) reasons.push(`Absent ${s.streak} days in a row`);

  if (s.att30 < 75) score += 30;
  else if (s.att30 < 85) score += 18;
  else if (s.att30 < 90) score += 8;
  if (s.att30 < 90) reasons.push(`Attendance ${s.att30}% in the last 30 days`);

  const drop = s.marks[0] - s.marks[s.marks.length - 1];
  if (drop >= 20) score += 30;
  else if (drop >= 10) score += 18;
  else if (drop >= 5) score += 8;
  if (drop >= 5) {
    reasons.push(`Marks fell ${s.marks.map((m) => `${m}%`).join(' → ')} over the last ${s.marks.length} tests`);
  }

  score = Math.min(score, 100);
  const level = score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';
  return { score, level, reasons };
};

const LEVEL_STYLE = {
  High: { tag: { background: '#F8E9E5', color: '#B3432B' }, bar: '#B3432B' },
  Medium: { tag: { background: '#FBF1DE', color: '#8A6512' }, bar: '#C6952C' },
};

const avgOf = (arr) => arr.reduce((s, x) => s + x, 0) / arr.length;
const round1 = (x) => Math.round(x * 10) / 10;

const Delta = ({ value, unit = 'pts' }) => (
  <span className="text-xs font-bold" style={{ color: value >= 0 ? '#2E7D4F' : '#B3432B' }}>
    {value >= 0 ? '▲' : '▼'} {Math.abs(round1(value))} {unit}
  </span>
);

const CardHead = ({ title, note }) => (
  <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>{title}</h3>
    {note && <p className="text-xs font-semibold mt-0.5" style={{ color: '#5C6B7A' }}>{note}</p>}
  </div>
);

export default function StaffSmartAnalytics() {
  const [students, setStudents] = useState(STUDENTS);
  const [filter, setFilter] = useState('All');

  // ----- performance metrics -----
  const resultAvg = avgOf(CLASS_RESULTS.map((r) => r.avg));
  const resultPrev = avgOf(CLASS_RESULTS.map((r) => r.prev));
  const attNow = ATTENDANCE[ATTENDANCE.length - 1].v;
  const attPrev = ATTENDANCE[ATTENDANCE.length - 2].v;
  const retentionPct = Math.round((RETENTION.retained / RETENTION.start) * 100);
  const syllabusAvg = Math.round(avgOf(SYLLABUS.map((s) => s.done)));
  const behind = SYLLABUS.filter((s) => s.done < s.expected - 2).length;

  const stats = [
    { label: 'AVERAGE CLASS RESULT', value: `${Math.round(resultAvg)}%`, sub: <Delta value={resultAvg - resultPrev} />, accent: '#1B3A6B' },
    { label: 'CLASS ATTENDANCE (OCT)', value: `${attNow}%`, sub: <Delta value={attNow - attPrev} />, accent: '#C6952C' },
    { label: 'STUDENT RETENTION', value: `${retentionPct}%`, sub: <span className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>{RETENTION.retained} of {RETENTION.start} continuing</span>, accent: '#2F6690' },
    { label: 'SYLLABUS COMPLETED', value: `${syllabusAvg}%`, sub: <span className="text-xs font-bold" style={{ color: behind ? '#8A6512' : '#2E7D4F' }}>{behind ? `${behind} class behind plan` : 'On track'}</span>, accent: '#2E7D4F' },
  ];

  // ----- risk alerts -----
  const scored = students
    .map((s) => ({ ...s, ...scoreStudent(s) }))
    .filter((s) => s.level !== 'Low')
    .sort((a, b) => b.score - a.score);
  const onTrack = students.length - scored.length;
  const needAttention = scored.filter((s) => !s.followed);
  const highCount = needAttention.filter((s) => s.level === 'High').length;
  const mediumCount = needAttention.filter((s) => s.level === 'Medium').length;
  const visible = scored.filter((s) => filter === 'All' || s.level === filter);

  const toggleFollowed = (id) =>
    setStudents((list) => list.map((s) => (s.id === id ? { ...s, followed: !s.followed } : s)));

  const waLink = (s) =>
    `https://wa.me/91${s.phone}?text=${encodeURIComponent(
      `Namaste, this is ${STAFF_NAME} from Blue Heaven Kids Academy. We would like to talk about ${s.name}'s recent attendance and progress. Please let us know a convenient time.`
    )}`;

  return (
    <div className="space-y-5">

      {/* ===== My performance metrics ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((c) => (
          <div key={c.label} className="p-4 rounded-md border-l-4 shadow-sm" style={{ ...card, borderLeftColor: c.accent }}>
            <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{c.label}</span>
            <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>{c.value}</div>
            <div className="mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Class results */}
        <div className="rounded-lg shadow-sm" style={card}>
          <CardHead title="Average class result" note="Latest exam vs previous" />
          <div className="p-5 space-y-4">
            {CLASS_RESULTS.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-bold" style={{ color: '#1A2332' }}>{r.label}</span>
                  <span className="font-black" style={{ color: '#1A2332' }}>{r.avg}%</span>
                </div>
                <div className="h-2 rounded-full mt-1.5" style={{ background: '#E2E7EE' }}>
                  <div className="h-2 rounded-full" style={{ width: `${r.avg}%`, background: '#2F6690' }} />
                </div>
                <div className="mt-1"><Delta value={r.avg - r.prev} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus */}
        <div className="rounded-lg shadow-sm" style={card}>
          <CardHead title="Syllabus completion" note="Line marks where you should be by now" />
          <div className="p-5 space-y-4">
            {SYLLABUS.map((s) => {
              const isBehind = s.done < s.expected - 2;
              return (
                <div key={s.label}>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="font-bold" style={{ color: '#1A2332' }}>{s.label}</span>
                    <span className="font-black" style={{ color: '#1A2332' }}>{s.done}%</span>
                  </div>
                  <div className="h-2 rounded-full mt-1.5 relative" style={{ background: '#E2E7EE' }}>
                    <div className="h-2 rounded-full" style={{ width: `${s.done}%`, background: isBehind ? '#C6952C' : '#1B3A6B' }} />
                    <div className="absolute -top-1 w-0.5 h-4" style={{ left: `${s.expected}%`, background: '#1A2332' }} />
                  </div>
                  <div className="mt-1 text-xs font-bold" style={{ color: isBehind ? '#8A6512' : '#2E7D4F' }}>
                    {isBehind ? `Behind plan by ${s.expected - s.done} pts` : 'On track'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance trend */}
        <div className="rounded-lg shadow-sm" style={card}>
          <CardHead title="Class attendance trend" note="Monthly average, my classes" />
          <div className="p-5">
            <div className="flex items-end justify-between gap-2 h-32">
              {ATTENDANCE.map((a, i) => (
                <div key={a.m} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-xs font-bold mb-1" style={{ color: '#1A2332' }}>{a.v}%</span>
                  <div
                    className="w-full rounded-t-sm"
                    style={{ height: `${a.v}%`, background: i === ATTENDANCE.length - 1 ? '#1B3A6B' : '#2F6690' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-2 mt-1.5">
              {ATTENDANCE.map((a) => (
                <span key={a.m} className="flex-1 text-center text-xs font-semibold" style={{ color: '#5C6B7A' }}>{a.m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Student risk alerts ===== */}
      <div className="rounded-lg shadow-sm" style={card}>
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid #E2E7EE' }}>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>
              Student risk alerts <span style={{ color: '#8A6512' }}>· AI-assisted</span>
            </h3>
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#5C6B7A' }}>
              Based on absence streak, 30-day attendance and marks trend. These flag who may need support, not a final judgement.
            </p>
          </div>
          <div className="flex gap-2">
            {['All', 'High', 'Medium'].map((f) => (
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
        </div>

        <div className="px-5 py-3 text-sm font-bold" style={{ background: '#FBF1DE', color: '#8A6512', borderBottom: '1px solid #E2E7EE' }}>
          {needAttention.length === 0
            ? 'All flagged students have been followed up.'
            : `${needAttention.length} student${needAttention.length > 1 ? 's' : ''} need attention this week (${highCount} high, ${mediumCount} medium)`}
          <span className="font-semibold" style={{ color: '#5C6B7A' }}> · {onTrack} on track</span>
        </div>

        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm font-semibold" style={{ color: '#5C6B7A' }}>No students in this group.</div>
        ) : (
          <ul>
            {visible.map((s, i) => (
              <li key={s.id} className="px-5 py-4" style={{ borderTop: i ? '1px solid #E2E7EE' : 'none', opacity: s.followed ? 0.85 : 1 }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: '#1B3A6B' }}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-black" style={{ color: '#1A2332' }}>{s.name}</div>
                      <div className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>Class {s.cls}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28">
                      <div className="flex justify-between text-xs font-bold" style={{ color: '#5C6B7A' }}>
                        <span>Risk score</span><span style={{ color: '#1A2332' }}>{s.score}</span>
                      </div>
                      <div className="h-1.5 rounded-full mt-1" style={{ background: '#E2E7EE' }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${s.score}%`, background: LEVEL_STYLE[s.level].bar }} />
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={LEVEL_STYLE[s.level].tag}>{s.level}</span>
                  </div>
                </div>

                <ul className="mt-3 space-y-1">
                  {s.reasons.map((r) => (
                    <li key={r} className="flex gap-2 text-sm font-semibold" style={{ color: '#1A2332' }}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: LEVEL_STYLE[s.level].bar }} />
                      {r}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href={waLink(s)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs px-3 py-1.5 rounded-md font-bold transition shadow-md"
                  >
                    WhatsApp parent
                  </a>
                  <a
                    href={`tel:+91${s.phone}`}
                    className="bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs px-3 py-1.5 rounded-md font-bold transition shadow-md"
                  >
                    📞 Call parent
                  </a>
                  <button
                    onClick={() => toggleFollowed(s.id)}
                    className="text-xs px-3 py-1.5 rounded-md font-bold transition"
                    style={
                      s.followed
                        ? { background: '#EAF4EE', color: '#2E7D4F', border: '1px solid #2E7D4F' }
                        : { background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }
                    }
                  >
                    {s.followed ? '✓ Followed up (undo)' : 'Mark followed up'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
