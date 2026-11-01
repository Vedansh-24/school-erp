'use client';

import { useState } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F | Warning-tone #8A6512

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };
const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

// Sample data (replace with API data)
const STAFF = {
  name: 'Mrs. Sunita Sharma',
  empId: 'BHKA-T-014',
  designation: 'Senior Teacher',
  joined: '12/07/2016',
  mode: 'Bank transfer',
};

const EARNINGS = [
  ['Basic pay', 28000],
  ['House rent allowance', 8400],
  ['Conveyance', 1600],
  ['Special allowance', 4000],
];
const GROSS = EARNINGS.reduce((sum, [, v]) => sum + v, 0);

const SLIPS = [
  { id: 'oct-2026', month: 'October 2026', status: 'Processing', working: 26, present: 25, leave: 1, lop: 0 },
  { id: 'sep-2026', month: 'September 2026', status: 'Paid', paidOn: '01/10/2026', working: 26, present: 24, leave: 1, lop: 1 },
  { id: 'aug-2026', month: 'August 2026', status: 'Paid', paidOn: '01/09/2026', working: 26, present: 25, leave: 1, lop: 0 },
  { id: 'jul-2026', month: 'July 2026', status: 'Paid', paidOn: '01/08/2026', working: 26, present: 25, leave: 1, lop: 0 },
  { id: 'jun-2026', month: 'June 2026', status: 'Paid', paidOn: '01/07/2026', working: 26, present: 25, leave: 1, lop: 0 },
  { id: 'may-2026', month: 'May 2026', status: 'Paid', paidOn: '01/06/2026', working: 26, present: 25, leave: 1, lop: 0 },
  { id: 'apr-2026', month: 'April 2026', status: 'Paid', paidOn: '01/05/2026', working: 26, present: 22, leave: 2, lop: 2 },
];

const buildSlip = (s) => {
  const lopAmt = Math.round((GROSS / s.working) * s.lop);
  const deductions = [
    ['Provident fund (12% of basic)', Math.round(EARNINGS[0][1] * 0.12)],
    ['Professional tax', 200],
  ];
  if (lopAmt > 0) deductions.push([`Loss of pay (${s.lop} day${s.lop > 1 ? 's' : ''})`, lopAmt]);
  const totalDed = deductions.reduce((sum, [, v]) => sum + v, 0);
  return { deductions, totalDed, net: GROSS - totalDed };
};

const Tag = ({ status }) => (
  <span
    className="px-2 py-0.5 rounded-sm text-xs font-bold"
    style={{
      background: status === 'Paid' ? '#EAF4EE' : '#FBF1DE',
      color: status === 'Paid' ? '#2E7D4F' : '#8A6512',
    }}
  >
    {status}
  </span>
);

const Line = ({ label, value }) => (
  <div className="flex justify-between py-1.5 text-sm" style={{ borderBottom: '1px solid #E2E7EE' }}>
    <span style={{ color: '#5C6B7A' }}>{label}</span>
    <span className="font-semibold" style={{ color: '#1A2332' }}>{value}</span>
  </div>
);

export default function StaffSalarySlips() {
  const [selectedId, setSelectedId] = useState('sep-2026');

  const selected = SLIPS.find((s) => s.id === selectedId);
  const slip = buildSlip(selected);
  const paid = SLIPS.filter((s) => s.status === 'Paid');
  const paidTotal = paid.reduce((sum, s) => sum + buildSlip(s).net, 0);
  const latestPaid = paid[0];

  return (
    <div className="space-y-5">
      {/* Prints only the slip */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #salary-slip, #salary-slip * { visibility: visible; }
          #salary-slip { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        }
      `}</style>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          { label: `NET PAY, ${latestPaid.month.split(' ')[0].toUpperCase()}`, value: inr(buildSlip(latestPaid).net), accent: '#1B3A6B' },
          { label: 'PAID THIS SESSION', value: inr(paidTotal), accent: '#2F6690' },
          { label: 'SLIPS AVAILABLE', value: paid.length, accent: '#C6952C' },
        ].map((c) => (
          <div
            key={c.label}
            className="p-4 rounded-md border-l-4 shadow-sm"
            style={{ ...card, borderLeftColor: c.accent }}
          >
            <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{c.label}</span>
            <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Month list */}
        <div className="rounded-lg shadow-sm self-start" style={card}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Session 2026-2027</h3>
          </div>
          <ul>
            {SLIPS.map((s, i) => {
              const active = s.id === selectedId;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedId(s.id)}
                    className="w-full text-left px-5 py-3 flex items-center justify-between"
                    style={{
                      borderTop: i ? '1px solid #E2E7EE' : 'none',
                      borderLeft: `4px solid ${active ? '#1B3A6B' : 'transparent'}`,
                      background: active ? '#F5F7FA' : 'transparent',
                    }}
                  >
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#1A2332' }}>{s.month}</div>
                      <div className="text-xs font-semibold" style={{ color: '#5C6B7A' }}>
                        {s.status === 'Paid' ? inr(buildSlip(s).net) : 'Net pay pending'}
                      </div>
                    </div>
                    <Tag status={s.status} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Slip */}
        <div className="lg:col-span-2">
          {selected.status !== 'Paid' ? (
            <div
              className="rounded-lg shadow-sm h-64 flex flex-col items-center justify-center text-center px-6"
              style={card}
            >
              <div className="text-sm font-bold uppercase tracking-wider" style={{ color: '#8A6512' }}>
                Salary for {selected.month} is processing
              </div>
              <p className="text-sm mt-2" style={{ color: '#5C6B7A' }}>
                The slip will appear here once the payment is made.
              </p>
            </div>
          ) : (
            <div id="salary-slip" className="rounded-lg shadow-sm" style={card}>
              <div className="px-6 py-5 flex items-start justify-between gap-4" style={{ borderBottom: '3px solid #C6952C' }}>
                <div>
                  <div className="text-base font-black uppercase tracking-wider" style={{ color: '#1B3A6B' }}>
                    Blue Heaven Kids Academy
                  </div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: '#5C6B7A' }}>Salary slip for {selected.month}</div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md whitespace-nowrap"
                >
                  🖨️ Print / Save as PDF
                </button>
              </div>

              <div className="px-6 py-4 grid grid-cols-2 gap-x-6" style={{ borderBottom: '1px solid #E2E7EE' }}>
                <Line label="Employee" value={STAFF.name} />
                <Line label="Employee ID" value={STAFF.empId} />
                <Line label="Designation" value={STAFF.designation} />
                <Line label="Date of joining" value={STAFF.joined} />
                <Line label="Days present / leave / LOP" value={`${selected.present} / ${selected.leave} / ${selected.lop}`} />
                <Line label="Paid on" value={`${selected.paidOn} (${STAFF.mode})`} />
              </div>

              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#1B3A6B' }}>Earnings</h4>
                  {EARNINGS.map(([k, v]) => <Line key={k} label={k} value={inr(v)} />)}
                  <div className="flex justify-between pt-2 text-sm font-black" style={{ color: '#1A2332' }}>
                    <span>Gross earnings</span><span>{inr(GROSS)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#1B3A6B' }}>Deductions</h4>
                  {slip.deductions.map(([k, v]) => <Line key={k} label={k} value={inr(v)} />)}
                  <div className="flex justify-between pt-2 text-sm font-black" style={{ color: '#B3432B' }}>
                    <span>Total deductions</span><span>{inr(slip.totalDed)}</span>
                  </div>
                </div>
              </div>

              <div
                className="mx-6 mb-5 px-5 py-4 rounded-md flex items-center justify-between"
                style={{ background: '#1B3A6B' }}
              >
                <span className="text-sm font-bold uppercase tracking-wider text-white">Net pay</span>
                <span className="text-2xl font-black text-white">{inr(slip.net)}</span>
              </div>

              <p className="px-6 pb-5 text-xs" style={{ color: '#5C6B7A' }}>
                This is a computer-generated slip and does not need a signature.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
