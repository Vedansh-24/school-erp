'use client';

import { useState, useRef } from 'react';

// ---- Design tokens (standard palette) ----
// Navy #1B3A6B | Steel Blue #2F6690 | Gold #C6952C
// Canvas #F5F7FA | Surface #FFFFFF | Hairline #E2E7EE
// Ink #1A2332 | Slate #5C6B7A | Success #2E7D4F

const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };

const Field = ({ label, value, editing, onChange, wide }) => (
  <div className={wide ? 'sm:col-span-2' : ''}>
    <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: '#5C6B7A' }}>
      {label}
    </span>
    {editing && onChange ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none"
        style={{ background: '#F5F7FA', color: '#1A2332', border: '1px solid #2F6690' }}
      />
    ) : (
      <div className="text-sm font-semibold py-2" style={{ color: '#1A2332' }}>{value}</div>
    )}
  </div>
);

export default function StaffProfile() {
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [editing, setEditing] = useState(false);

  // Sample data (replace with API data)
  const fixed = {
    name: 'Mrs. Sunita Sharma',
    empId: 'BHKA-T-014',
    designation: 'Senior Teacher',
    classTeacher: 'Fourth',
    subjects: 'Mathematics, EVS',
    qualification: 'M.Sc., B.Ed.',
    joined: '12/07/2016',
    dob: '04/03/1988',
    type: 'Full-time',
  };

  const [saved, setSaved] = useState({
    mobile: '98765 43210',
    email: 'sunita.sharma@blueheaven.edu',
    address: 'Plot 24, Shanti Nagar, Jaipur, Rajasthan',
  });
  const [draft, setDraft] = useState(saved);

  const initials = fixed.name.replace('Mrs. ', '').split(' ').map((w) => w[0]).join('');

  // NOTE: object URL is temporary. Upload the file to your server/storage to keep it.
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('कृपया image file चुनें');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo 2 MB से छोटी होनी चाहिए');
      return;
    }
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removePhoto = () => {
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(null);
  };

  const startEdit = () => {
    setDraft(saved);
    setEditing(true);
  };

  const saveEdit = () => {
    setSaved(draft);
    setEditing(false);
    alert('Profile saved');
  };

  const set = (key) => (val) => setDraft({ ...draft, [key]: val });
  const cur = editing ? draft : saved;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Photo card */}
      <div className="rounded-lg shadow-sm p-6 flex flex-col items-center text-center" style={card}>
        <div
          className="w-40 h-40 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: '#1B3A6B', border: '3px solid #C6952C' }}
        >
          {photo ? (
            <img src={photo} alt="Staff photo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl font-black text-white">{initials}</span>
          )}
        </div>

        <h2 className="text-lg font-black mt-4" style={{ color: '#1A2332' }}>{fixed.name}</h2>
        <p className="text-sm font-semibold" style={{ color: '#5C6B7A' }}>{fixed.designation}</p>
        <span
          className="mt-2 px-2.5 py-1 rounded-sm text-xs font-bold"
          style={{ background: '#F5F7FA', border: '1px solid #E2E7EE', color: '#2F6690' }}
        >
          ID: {fixed.empId}
        </span>

        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
          >
            📁 Upload photo
          </button>
          {photo && (
            <button
              onClick={removePhoto}
              className="bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs mt-2" style={{ color: '#5C6B7A' }}>JPG or PNG, up to 2 MB</p>

        <div className="w-full mt-5 pt-4 space-y-2.5 text-sm text-left" style={{ borderTop: '1px solid #E2E7EE' }}>
          <div className="flex justify-between"><span style={{ color: '#5C6B7A' }}>Status</span>
            <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={{ background: '#EAF4EE', color: '#2E7D4F' }}>Active</span>
          </div>
          <div className="flex justify-between"><span style={{ color: '#5C6B7A' }}>Joined</span><span className="font-semibold">{fixed.joined}</span></div>
          <div className="flex justify-between"><span style={{ color: '#5C6B7A' }}>Class teacher</span><span className="font-semibold">{fixed.classTeacher}</span></div>
        </div>
      </div>

      {/* Details */}
      <div className="lg:col-span-2 space-y-5">

        <div className="rounded-lg shadow-sm" style={card}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Personal information</h3>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold"
                  style={{ background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
                >
                  💾 Save changes
                </button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md"
              >
                ✏️ Edit contact details
              </button>
            )}
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Full name" value={fixed.name} />
            <Field label="Date of birth" value={fixed.dob} />
            <Field label="Mobile / WhatsApp" value={cur.mobile} editing={editing} onChange={set('mobile')} />
            <Field label="Email" value={cur.email} editing={editing} onChange={set('email')} />
            <Field label="Residential address" value={cur.address} editing={editing} onChange={set('address')} wide />
          </div>
        </div>

        <div className="rounded-lg shadow-sm" style={card}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Professional information</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Employee ID" value={fixed.empId} />
            <Field label="Designation" value={fixed.designation} />
            <Field label="Subjects" value={fixed.subjects} />
            <Field label="Qualification" value={fixed.qualification} />
            <Field label="Date of joining" value={fixed.joined} />
            <Field label="Employment type" value={fixed.type} />
          </div>
          <p className="px-5 pb-4 text-xs" style={{ color: '#5C6B7A' }}>
            Name, designation and joining details are managed by the school admin.
          </p>
        </div>

      </div>
    </div>
  );
}
