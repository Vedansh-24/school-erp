'use client';

import { useState } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F | Danger #B3432B | Warning-tone #8A6512

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };
const inputStyle = { background: '#F5F7FA', color: '#1A2332', border: '1px solid #E2E7EE' };
const STAFF_NAME = 'Mrs. Sunita Sharma';

// ---------- Sample data (replace with API data) ----------
const ROSTER = [
  { id: 1021, name: 'Aarav Singh', cls: 'Fourth', bus: '' },
  { id: 1022, name: 'Ananya Sharma', cls: 'Fourth', bus: '' },
  { id: 1024, name: 'Bhavesh Mehta', cls: 'Fourth', bus: 'Bus 3 – Shanti Nagar' },
  { id: 1025, name: 'Ishita Nair', cls: 'Fourth', bus: 'Bus 3 – Shanti Nagar' },
  { id: 1026, name: 'Kabir Khan', cls: 'Fourth', bus: '' },
  { id: 932, name: 'Dev Malhotra', cls: 'Third', bus: 'Bus 5 – Vaishali' },
  { id: 935, name: 'Tara Bhatia', cls: 'Third', bus: '' },
  { id: 1101, name: 'Aryan Kapoor', cls: 'Fifth', bus: 'Bus 5 – Vaishali' },
  { id: 1102, name: 'Diya Menon', cls: 'Fifth', bus: '' },
];
const byId = Object.fromEntries(ROSTER.map((s) => [s.id, s]));

const RELATIONS = ['Father', 'Mother', 'Guardian', 'Other'];
const REASONS = ['Medical appointment', 'Family function', 'Emergency at home', 'Travel', 'Other'];

const STATUS_STYLE = {
  'Pending approval': { background: '#FBF1DE', color: '#8A6512' },
  Approved: { background: '#E8EEF7', color: '#1B3A6B' },
  'Left school': { background: '#EAF4EE', color: '#2E7D4F' },
  Rejected: { background: '#F8E9E5', color: '#B3432B' },
  Cancelled: { background: '#F5F7FA', color: '#5C6B7A' },
};

const pad = (n, w = 2) => String(n).padStart(w, '0');
const now = new Date();
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const TODAY_CODE = TODAY.replaceAll('-', '');
const fmtDate = (iso) => iso.split('-').reverse().join('/');
const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};

const INITIAL = [
  { id: 1, no: `GP-${TODAY_CODE}-001`, studentId: 1022, pickup: 'Rakesh Sharma', relation: 'Father', mobile: '9811100001', reason: 'Family function', note: '', time: '11:30', status: 'Left school', pin: '4821', informTransport: false, exitedAt: '11:42' },
  { id: 2, no: `GP-${TODAY_CODE}-002`, studentId: 1024, pickup: 'Meena Mehta', relation: 'Mother', mobile: '9811100002', reason: 'Medical appointment', note: '', time: '12:15', status: 'Approved', pin: '7305', informTransport: true },
  { id: 3, no: `GP-${TODAY_CODE}-003`, studentId: 932, pickup: 'Anil Malhotra', relation: 'Father', mobile: '9811100003', reason: 'Emergency at home', note: '', time: '13:00', status: 'Pending approval', pin: '1593', informTransport: true },
  { id: 4, no: `GP-${TODAY_CODE}-004`, studentId: 1102, pickup: 'Suresh Menon', relation: 'Father', mobile: '9811100004', reason: 'Family function', note: '', time: '10:00', status: 'Rejected', pin: '2648', informTransport: false, remark: 'Unit test in progress' },
];

const Err = ({ children }) =>
  children ? <p className="text-xs font-semibold mt-1" style={{ color: '#B3432B' }}>{children}</p> : null;
const Label = ({ children }) => (
  <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: '#5C6B7A' }}>{children}</span>
);
const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm" style={{ borderBottom: '1px solid #E2E7EE' }}>
    <span style={{ color: '#5C6B7A' }}>{label}</span>
    <span className="font-semibold text-right" style={{ color: '#1A2332' }}>{value}</span>
  </div>
);

export default function StaffGatePass() {
  const [passes, setPasses] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(2);
  const [form, setForm] = useState({
    studentId: '', pickup: '', relation: 'Father', mobile: '', reason: REASONS[0], note: '',
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, verified: false, informTransport: true,
  });
  const [errors, setErrors] = useState({});
  const [created, setCreated] = useState('');

  const student = form.studentId ? byId[form.studentId] : null;
  const selected = passes.find((p) => p.id === selectedId);

  const stats = [
    { label: "TODAY'S PASSES", value: passes.length, accent: '#1B3A6B' },
    { label: 'AWAITING APPROVAL', value: passes.filter((p) => p.status === 'Pending approval').length, accent: '#C6952C' },
    { label: 'LEFT SCHOOL', value: passes.filter((p) => p.status === 'Left school').length, accent: '#2E7D4F' },
    { label: 'BUS DROP-LIST CHANGES', value: passes.filter((p) => p.informTransport && !['Rejected', 'Cancelled'].includes(p.status)).length, accent: '#2F6690' },
  ];

  const setField = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: undefined });
    setCreated('');
  };
  const setCheck = (key) => (e) => {
    setForm({ ...form, [key]: e.target.checked });
    setErrors({ ...errors, [key]: undefined });
  };

  const generate = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.studentId) err.studentId = 'Choose a student';
    if (!form.pickup.trim()) err.pickup = 'Enter the name of the person taking the child';
    if (!/^\d{10}$/.test(form.mobile.trim())) err.mobile = 'Enter a 10-digit mobile number';
    if (!form.time) err.time = 'Choose the leaving time';
    if (!form.verified) err.verified = 'Confirm you have verified the pickup person';
    setErrors(err);
    if (Object.keys(err).length) return;

    const seq = passes.length + 1;
    const next = {
      id: Date.now(),
      no: `GP-${TODAY_CODE}-${pad(seq, 3)}`,
      studentId: Number(form.studentId),
      pickup: form.pickup.trim(),
      relation: form.relation,
      mobile: form.mobile.trim(),
      reason: form.reason,
      note: form.note.trim(),
      time: form.time,
      status: 'Pending approval',
      pin: String(Math.floor(1000 + Math.random() * 9000)), // replace with a server-issued PIN
      informTransport: !!(student && student.bus && form.informTransport),
    };
    setPasses([next, ...passes]);
    setSelectedId(next.id);
    setCreated(`Pass ${next.no} created. It is valid after the principal approves it.`);
    setForm({ ...form, studentId: '', pickup: '', mobile: '', note: '', verified: false });
  };

  // Approval and gate exit should be updated by the principal / gate dashboards via your API.
  const cancelPass = (id) =>
    setPasses((list) => list.map((p) => (p.id === id && p.status === 'Pending approval' ? { ...p, status: 'Cancelled' } : p)));

  const valid = selected && ['Approved', 'Left school'].includes(selected.status);
  const sel = selected ? byId[selected.studentId] : null;

  const waLink = (p) =>
    `https://wa.me/91${p.mobile}?text=${encodeURIComponent(
      `Gate pass ${p.no} for ${byId[p.studentId].name} (Class ${byId[p.studentId].cls}) is approved. Pickup: ${p.pickup}, from ${fmtTime(p.time)}. Please show PIN ${p.pin} at the gate. – Blue Heaven Kids Academy`
    )}`;

  return (
    <div className="space-y-5">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #gate-pass, #gate-pass * { visibility: visible; }
          #gate-pass { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        }
      `}</style>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((c) => (
          <div key={c.label} className="p-4 rounded-md border-l-4 shadow-sm" style={{ ...card, borderLeftColor: c.accent }}>
            <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{c.label}</span>
            <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Create pass */}
        <form onSubmit={generate} noValidate className="rounded-lg shadow-sm self-start" style={card}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Create gate pass</h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label>Student</Label>
              <select value={form.studentId} onChange={setField('studentId')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                <option value="">Select student</option>
                {ROSTER.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.cls}</option>)}
              </select>
              <Err>{errors.studentId}</Err>
              {student && (
                <p className="text-xs font-semibold mt-1.5" style={{ color: '#2F6690' }}>
                  Transport: {student.bus || 'Own transport'}
                </p>
              )}
            </div>

            <div>
              <Label>Person taking the child</Label>
              <input value={form.pickup} onChange={setField('pickup')} placeholder="Full name" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
              <Err>{errors.pickup}</Err>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Relation</Label>
                <select value={form.relation} onChange={setField('relation')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label>Leaving time</Label>
                <input type="time" value={form.time} onChange={setField('time')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
                <Err>{errors.time}</Err>
              </div>
            </div>

            <div>
              <Label>Mobile number</Label>
              <input value={form.mobile} onChange={setField('mobile')} inputMode="numeric" maxLength={10} placeholder="10-digit mobile" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
              <Err>{errors.mobile}</Err>
            </div>

            <div>
              <Label>Reason</Label>
              <select value={form.reason} onChange={setField('reason')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input value={form.note} onChange={setField('note')} placeholder="Details (optional)" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none mt-2" style={inputStyle} />
            </div>

            {student && student.bus && (
              <label className="flex items-start gap-2 text-sm font-semibold cursor-pointer" style={{ color: '#1A2332' }}>
                <input type="checkbox" checked={form.informTransport} onChange={setCheck('informTransport')} className="w-4 h-4 mt-0.5" style={{ accentColor: '#1B3A6B' }} />
                Inform transport desk to remove from today's {student.bus} drop list
              </label>
            )}

            <div>
              <label className="flex items-start gap-2 text-sm font-semibold cursor-pointer" style={{ color: '#1A2332' }}>
                <input type="checkbox" checked={form.verified} onChange={setCheck('verified')} className="w-4 h-4 mt-0.5" style={{ accentColor: '#1B3A6B' }} />
                I have verified the identity of the person taking the child
              </label>
              <Err>{errors.verified}</Err>
            </div>

            <button type="submit" className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-md font-bold transition shadow-md">
              🎫 Generate pass
            </button>
            {created && <p className="text-xs font-semibold" style={{ color: '#2E7D4F' }}>{created}</p>}
          </div>
        </form>

        <div className="lg:col-span-2 space-y-5">

          {/* Today's passes */}
          <div className="rounded-lg shadow-sm" style={card}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E7EE' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Today's gate passes</h3>
              <span className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>{fmtDate(TODAY)}</span>
            </div>
            <ul>
              {passes.map((p, i) => {
                const s = byId[p.studentId];
                const active = p.id === selectedId;
                return (
                  <li key={p.id} style={{ borderTop: i ? '1px solid #E2E7EE' : 'none' }}>
                    <div
                      className="px-5 py-3 flex items-center justify-between gap-3"
                      style={{ borderLeft: `4px solid ${active ? '#1B3A6B' : 'transparent'}`, background: active ? '#F5F7FA' : 'transparent' }}
                    >
                      <button onClick={() => setSelectedId(p.id)} className="text-left min-w-0 flex-1">
                        <div className="text-sm font-black" style={{ color: '#1A2332' }}>
                          {s.name} <span className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>Class {s.cls}</span>
                        </div>
                        <div className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>
                          {p.no} · {fmtTime(p.time)} · {p.reason}
                        </div>
                        {p.remark && <div className="text-xs italic mt-0.5" style={{ color: '#B3432B' }}>Remark: {p.remark}</div>}
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.status === 'Pending approval' && (
                          <button
                            onClick={() => cancelPass(p.id)}
                            className="bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs px-3 py-1.5 rounded-md font-bold transition shadow-md"
                          >
                            Cancel
                          </button>
                        )}
                        <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={STATUS_STYLE[p.status]}>{p.status}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pass card */}
          {selected && (
            <div id="gate-pass" className="rounded-lg shadow-sm" style={card}>
              <div className="px-6 py-4 flex items-start justify-between gap-4" style={{ borderBottom: '3px solid #C6952C' }}>
                <div>
                  <div className="text-base font-black uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Blue Heaven Kids Academy</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: '#5C6B7A' }}>Student gate pass · {selected.no}</div>
                </div>
                <span className="px-2.5 py-1 rounded-sm text-xs font-bold" style={STATUS_STYLE[selected.status]}>{selected.status}</span>
              </div>

              <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <Row label="Student" value={`${sel.name} · Class ${sel.cls}`} />
                <Row label="Date and time" value={`${fmtDate(TODAY)} · from ${fmtTime(selected.time)}`} />
                <Row label="Taken by" value={`${selected.pickup} (${selected.relation})`} />
                <Row label="Mobile" value={`${selected.mobile.slice(0, 5)} ${selected.mobile.slice(5)}`} />
                <Row label="Reason" value={selected.note ? `${selected.reason} – ${selected.note}` : selected.reason} />
                <Row label="Transport" value={sel.bus ? `${sel.bus}${selected.informTransport ? ' (desk informed)' : ''}` : 'Own transport'} />
                <Row label="Issued by" value={STAFF_NAME} />
                <Row label="Valid" value="Today only" />
              </div>

              <div className="mx-6 mb-5 mt-2 px-5 py-4 rounded-md flex items-center justify-between gap-4" style={{ background: '#1B3A6B' }}>
                <div className="text-sm font-bold text-white">
                  {valid ? 'Show this PIN at the gate' : selected.status === 'Pending approval' ? 'PIN appears after the principal approves' : 'This pass is not valid'}
                </div>
                <div className="text-3xl font-black tracking-widest" style={{ color: valid ? '#FFFFFF' : '#7C93B0' }}>
                  {valid ? selected.pin : '••••'}
                </div>
              </div>

              {valid && (
                <div className="px-6 pb-5 flex flex-wrap gap-2">
                  <a
                    href={waLink(selected)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
                  >
                    Share on WhatsApp
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
                  >
                    🖨️ Print pass
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
