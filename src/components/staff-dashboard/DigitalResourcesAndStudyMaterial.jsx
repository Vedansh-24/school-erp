// Filename: ./src/components/staff-dashboard/DigitalResourcesAndStudyMaterial.jsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ---- Supabase Client Initialization ----
// (सुनिश्चित करें कि आपकी .env.local फाइल में ये वेरिएबल्स सेट हों)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// ---- Design tokens (standard palette) ----
const card = { background: '#FFFFFF', border: '1px solid #E2E7EE' };
const inputStyle = { background: '#F5F7FA', color: '#1A2332', border: '1px solid #E2E7EE' };

// ---------- constants ----------
const CLASSES = ['Third', 'Fourth', 'Fifth'];
const SUBJECTS = ['Mathematics', 'EVS'];
const TYPES = ['Notes', 'PDF', 'Practice sheet', 'Video link'];
const TYPE_STYLE = {
  Notes: { background: '#E8EEF7', color: '#1B3A6B' },
  PDF: { background: '#F8E9E5', color: '#B3432B' },
  'Practice sheet': { background: '#FBF1DE', color: '#8A6512' },
  'Video link': { background: '#EAF4EE', color: '#2E7D4F' },
};
const TYPE_ICON = { Notes: '📄', PDF: '📕', 'Practice sheet': '📝', 'Video link': '🎬' };
const ALLOWED = /\.(pdf|docx?|pptx?|jpe?g|png)$/i;
const MAX_FILE = 10 * 1024 * 1024;

const Q_TYPES = ['MCQ', 'Short answer', 'Long answer'];
const DIFFS = ['Easy', 'Medium', 'Hard'];
const DEFAULT_MARKS = { MCQ: '1', 'Short answer': '2', 'Long answer': '5' };
const DIFF_STYLE = {
  Easy: { background: '#EAF4EE', color: '#2E7D4F' },
  Medium: { background: '#FBF1DE', color: '#8A6512' },
  Hard: { background: '#F8E9E5', color: '#B3432B' },
};
const Q_TYPE_STYLE = {
  MCQ: { background: '#E8EEF7', color: '#1B3A6B' },
  'Short answer': { background: '#E8EEF7', color: '#2F6690' },
  'Long answer': { background: '#F5F7FA', color: '#5C6B7A' },
};
const SECTION_NAME = { MCQ: 'Multiple choice questions', 'Short answer': 'Short answer questions', 'Long answer': 'Long answer questions' };

// ---------- helpers ----------
const pad = (n) => String(n).padStart(2, '0');
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const when = (iso) => {
  if (!iso) return 'Recent';
  const diff = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(`${iso}T00:00:00`)) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return iso.split('-').reverse().join('/');
};
const fmtSize = (b) => (!b ? '0 KB' : b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`);

const Err = ({ children }) =>
  children ? <p className="text-xs font-semibold mt-1" style={{ color: '#B3432B' }}>{children}</p> : null;
const Label = ({ children }) => (
  <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: '#5C6B7A' }}>{children}</span>
);
const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all duration-200 ${
      active ? 'bg-gradient-to-r from-[#00C9A7] to-[#0D9488] text-white shadow-md' : 'bg-[#F5F7FA] text-slate-600 hover:bg-[#E2E7EE]'
    }`}
  >
    {children}
  </button>
);
const StatCard = ({ label, value, accent }) => (
  <div className="p-4 rounded-md border-l-4 shadow-sm" style={{ ...card, borderLeftColor: accent }}>
    <span className="text-[9.5px] uppercase font-bold tracking-wider block" style={{ color: '#5C6B7A' }}>{label}</span>
    <div className="text-2xl font-black mt-1" style={{ color: '#1A2332' }}>{value}</div>
  </div>
);

export default function StaffDigitalResources() {
  const [tab, setTab] = useState('Study Material');

  // ===== study material state =====
  const [resources, setResources] = useState([]);
  const [up, setUp] = useState({ cls: 'Fourth', subject: 'Mathematics', type: 'Notes', chapter: '', title: '', url: '', file: null, publish: true });
  const [upErr, setUpErr] = useState({});
  const [upMsg, setUpMsg] = useState('');
  const [fileKey, setFileKey] = useState(0);
  const [fClass, setFClass] = useState('All');
  const [fSubject, setFSubject] = useState('All');
  const [fType, setFType] = useState('All');

  // ===== question bank state =====
  const [questions, setQuestions] = useState([]);
  const [qf, setQf] = useState({ cls: 'Fourth', subject: 'Mathematics', type: 'All', diff: 'All' });
  const [selected, setSelected] = useState([]);
  const [qForm, setQForm] = useState({ cls: 'Fourth', subject: 'Mathematics', chapter: '', type: 'MCQ', diff: 'Easy', marks: '1', text: '', options: ['', '', '', ''], answer: 0 });
  const [qErr, setQErr] = useState({});
  const [qMsg, setQMsg] = useState('');
  const [paperTitle, setPaperTitle] = useState('Unit Test');
  const [paperTime, setPaperTime] = useState('30');
  const [showPaper, setShowPaper] = useState(false);
  const [paperMsg, setPaperMsg] = useState('');
  const [showKey, setShowKey] = useState(false);

  // ---------- Fetch Data from Supabase on Load ----------
  useEffect(() => {
    fetchResources();
    fetchQuestions();
  }, []);

  const fetchResources = async () => {
    const { data, error } = await supabase.from('study_resources').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Map database columns to component state structure if needed
      setResources(data.map(r => ({
        id: r.id,
        type: r.type,
        cls: r.cls,
        subject: r.subject,
        chapter: r.chapter,
        title: r.title,
        date: r.date || todayISO(),
        published: r.published,
        fileName: r.file_name,
        size: r.size,
        url: r.url
      })));
    }
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase.from('question_bank').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Map existing table columns (class_name, subject_name, chapter_name, question_type, question_text, options etc.)
      const mapped = data.map(q => {
        const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
        // Match correct_answer text with options to find correct index
        let ansIndex = 0;
        if (q.correct_answer) {
          const foundIdx = opts.findIndex(opt => opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase());
          if (foundIdx !== -1) ansIndex = foundIdx;
        }
        return {
          id: q.id,
          cls: q.class_name || 'Fourth',
          subject: q.subject_name || 'Mathematics',
          chapter: q.chapter_name || 'General',
          type: q.question_type || 'MCQ',
          diff: q.difficulty || 'Easy',
          marks: q.marks || 1,
          text: q.question_text || '',
          options: opts.length ? opts : ['', '', '', ''],
          answer: ansIndex
        };
      });
      setQuestions(mapped);
    }
  };

  // ================= study material logic =================
  const setUpField = (key) => (e) => {
    setUp({ ...up, [key]: e.target.value });
    setUpErr({ ...upErr, [key]: undefined });
    setUpMsg('');
  };
  const setUpType = (type) => {
    setUp({ ...up, type, file: null, url: '' });
    setFileKey((k) => k + 1);
    setUpErr({});
    setUpMsg('');
  };
  const pickFile = (e) => {
    setUp({ ...up, file: e.target.files?.[0] || null });
    setUpErr({ ...upErr, file: undefined });
    setUpMsg('');
  };

  const upload = async (e) => {
    e.preventDefault();
    const err = {};
    if (!up.chapter.trim()) err.chapter = 'Enter the chapter name';
    if (!up.title.trim()) err.title = 'Enter a title';
    if (up.type === 'Video link') {
      if (!/^https:\/\/\S+\.\S+/.test(up.url.trim())) err.url = 'Enter a valid link starting with https://';
    } else if (!up.file) err.file = 'Choose a file to upload';
    else if (!ALLOWED.test(up.file.name)) err.file = 'Allowed: PDF, Word, PowerPoint, JPG, PNG';
    else if (up.file.size > MAX_FILE) err.file = 'File must be under 10 MB';
    setUpErr(err);
    if (Object.keys(err).length) return;

    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    if (up.type !== 'Video link' && up.file) {
      fileName = up.file.name;
      fileSize = up.file.size;
      const filePath = `study-files/${Date.now()}_${fileName}`;
      const { error: uploadErr } = await supabase.storage.from('resources-bucket').upload(filePath, up.file);
      if (uploadErr) {
        setUpMsg('File upload failed: ' + uploadErr.message);
        return;
      }
      const { data: publicURLData } = supabase.storage.from('resources-bucket').getPublicUrl(filePath);
      fileUrl = publicURLData.publicUrl;
    }

    const newRecord = {
      cls: up.cls,
      subject: up.subject,
      type: up.type,
      chapter: up.chapter.trim(),
      title: up.title.trim(),
      date: todayISO(),
      published: up.publish,
      file_name: fileName,
      size: fileSize,
      url: up.type === 'Video link' ? up.url.trim() : fileUrl
    };

    const { error: insertErr } = await supabase.from('study_resources').insert([newRecord]);
    if (insertErr) {
      setUpMsg('Database error: ' + insertErr.message);
      return;
    }

    setUp({ ...up, chapter: '', title: '', url: '', file: null });
    setFileKey((k) => k + 1);
    setUpMsg(up.publish ? 'Uploaded successfully!' : 'Saved as draft.');
    fetchResources();
  };

  const togglePublish = async (id, currentStatus) => {
    await supabase.from('study_resources').update({ published: !currentStatus }).eq('id', id);
    fetchResources();
  };

  const removeResource = async (id) => {
    if (window.confirm('Delete this resource?')) {
      await supabase.from('study_resources').delete().eq('id', id);
      fetchResources();
    }
  };

  const visibleResources = resources
    .filter((r) => (fClass === 'All' || r.cls === fClass) && (fSubject === 'All' || r.subject === fSubject) && (fType === 'All' || r.type === fType))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const resStats = [
    { label: 'TOTAL RESOURCES', value: resources.length, accent: '#1B3A6B' },
    { label: 'NOTES & PDFS', value: resources.filter((r) => r.type === 'Notes' || r.type === 'PDF').length, accent: '#2F6690' },
    { label: 'PRACTICE SHEETS', value: resources.filter((r) => r.type === 'Practice sheet').length, accent: '#C6952C' },
    { label: 'VIDEO LINKS', value: resources.filter((r) => r.type === 'Video link').length, accent: '#2E7D4F' },
  ];

  // ================= question bank logic =================
  const visibleQuestions = questions.filter(
    (q) => (qf.cls === 'All' || q.cls === qf.cls) && 
           (qf.subject === 'All' || q.subject === qf.subject) && 
           (qf.type === 'All' || q.type === qf.type) && 
           (qf.diff === 'All' || q.diff === qf.diff)
  );
  const selectedQs = questions.filter((q) => selected.includes(q.id));
  const totalMarks = selectedQs.reduce((s, q) => s + q.marks, 0);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    setPaperMsg('');
  };

  const setQField = (key) => (e) => {
    setQForm({ ...qForm, [key]: e.target.value });
    setQErr({ ...qErr, [key]: undefined });
    setQMsg('');
  };
  const setQType = (type) => {
    setQForm({ ...qForm, type, marks: DEFAULT_MARKS[type] });
    setQErr({});
    setQMsg('');
  };
  const setOption = (i) => (e) => {
    const options = [...qForm.options];
    options[i] = e.target.value;
    setQForm({ ...qForm, options });
    setQErr({ ...qErr, options: undefined });
    setQMsg('');
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    const err = {};
    const marks = Number(qForm.marks);
    if (!qForm.chapter.trim()) err.chapter = 'Enter the chapter';
    if (qForm.text.trim().length < 5) err.text = 'Write the question';
    if (!Number.isInteger(marks) || marks < 1 || marks > 20) err.marks = 'Marks must be 1 to 20';
    if (qForm.type === 'MCQ' && qForm.options.some((o) => !o.trim())) err.options = 'Fill all four options';
    setQErr(err);
    if (Object.keys(err).length) return;

    // Map component state to your existing table columns
    const newQ = {
      class_name: qForm.cls,
      subject_name: qForm.subject,
      chapter_name: qForm.chapter.trim(),
      question_type: qForm.type,
      difficulty: qForm.diff,
      marks: marks,
      question_text: qForm.text.trim(),
      option_a: qForm.type === 'MCQ' ? qForm.options[0] : null,
      option_b: qForm.type === 'MCQ' ? qForm.options[1] : null,
      option_c: qForm.type === 'MCQ' ? qForm.options[2] : null,
      option_d: qForm.type === 'MCQ' ? qForm.options[3] : null,
      correct_answer: qForm.type === 'MCQ' ? qForm.options[qForm.answer] : null,
      status: 'active'
    };

    const { error: insertErr } = await supabase.from('question_bank').insert([newQ]);
    if (insertErr) {
      setQMsg('Error adding question: ' + insertErr.message);
      return;
    }

    setQForm({ ...qForm, text: '', options: ['', '', '', ''], answer: 0 });
    setQMsg('Question added successfully to database!');
    fetchQuestions();
  };

  const generatePaper = () => {
    if (!selectedQs.length) {
      setPaperMsg('Select at least one question first.');
      setShowPaper(false);
      return;
    }
    setPaperMsg('');
    setShowPaper(true);
  };

  let counter = 0;
  const sections = Q_TYPES.filter((t) => selectedQs.some((q) => q.type === t)).map((t, i) => {
    const qs = selectedQs.filter((q) => q.type === t).map((q) => ({ ...q, no: ++counter }));
    return { letter: String.fromCharCode(65 + i), type: t, qs };
  });
  const first = selectedQs[0];

  return (
    <div className="space-y-5">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #question-paper, #question-paper * { visibility: visible; }
          #question-paper { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        }
      `}</style>

      {/* Header section with Breadcrumb & Title */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
          <span>Staff Portal</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-bold">Digital Resources & Study Material</span>
        </div>
        <h2 className="text-2xl font-black text-[#1B3A6B] tracking-tight">Digital Resources & Study Material</h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Manage student notes, upload chapter materials, and construct tests from the question bank.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 p-2 rounded-xl" style={card}>
        {['Study Material', 'Question Bank'].map((t) => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Chip>
        ))}
      </div>

      {/* ================= Study Material ================= */}
      {tab === 'Study Material' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {resStats.map((c) => <StatCard key={c.label} {...c} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Upload form */}
            <form onSubmit={upload} noValidate className="rounded-lg shadow-sm self-start" style={card}>
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Upload material</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Class</Label>
                    <select value={up.cls} onChange={setUpField('cls')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                      {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <select value={up.subject} onChange={setUpField('subject')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setUpType(t)}
                        className="px-2 py-2 rounded-md text-xs font-bold transition"
                        style={up.type === t ? { ...TYPE_STYLE[t], border: `1px solid ${TYPE_STYLE[t].color}` } : { background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }}
                      >
                        {TYPE_ICON[t]} {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Chapter</Label>
                  <input value={up.chapter} onChange={setUpField('chapter')} placeholder="e.g. Fractions" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
                  <Err>{upErr.chapter}</Err>
                </div>

                <div>
                  <Label>Title</Label>
                  <input value={up.title} onChange={setUpField('title')} placeholder="e.g. Fractions – class notes" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
                  <Err>{upErr.title}</Err>
                </div>

                {up.type === 'Video link' ? (
                  <div>
                    <Label>Video link</Label>
                    <input value={up.url} onChange={setUpField('url')} placeholder="https://" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
                    <Err>{upErr.url}</Err>
                  </div>
                ) : (
                  <div>
                    <Label>File</Label>
                    <input
                      key={fileKey}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                      onChange={pickFile}
                      className="w-full text-xs font-semibold file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-[#E2E7EE] file:text-[#1A2332] file:text-xs file:font-bold"
                      style={{ color: '#5C6B7A' }}
                    />
                    <p className="text-xs mt-1" style={{ color: '#5C6B7A' }}>PDF, Word, PowerPoint, JPG or PNG, up to 10 MB</p>
                    <Err>{upErr.file}</Err>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: '#1A2332' }}>
                  <input type="checkbox" checked={up.publish} onChange={(e) => setUp({ ...up, publish: e.target.checked })} className="w-4 h-4" style={{ accentColor: '#1B3A6B' }} />
                  Publish now (visible to students)
                </label>

                <button type="submit" className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-md font-bold transition shadow-md">
                  ⬆️ Upload
                </button>
                {upMsg && <p className="text-xs font-semibold" style={{ color: '#2E7D4F' }}>{upMsg}</p>}
              </div>
            </form>

            {/* Resource list */}
            <div className="lg:col-span-2 rounded-lg shadow-sm" style={card}>
              <div className="px-5 py-3.5 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid #E2E7EE' }}>
                <select value={fClass} onChange={(e) => setFClass(e.target.value)} className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer" style={{ ...inputStyle, color: '#2F6690' }}>
                  <option value="All">All classes</option>
                  {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select value={fSubject} onChange={(e) => setFSubject(e.target.value)} className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer" style={{ ...inputStyle, color: '#2F6690' }}>
                  <option value="All">All subjects</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex flex-wrap gap-2">
                  {['All', ...TYPES].map((t) => <Chip key={t} active={fType === t} onClick={() => setFType(t)}>{t}</Chip>)}
                </div>
              </div>

              {visibleResources.length === 0 ? (
                <div className="p-10 text-center text-sm font-semibold" style={{ color: '#5C6B7A' }}>No material matches your filter.</div>
              ) : (
                <ul>
                  {visibleResources.map((r, i) => (
                    <li key={r.id} className="px-5 py-3.5 flex items-start justify-between gap-4" style={{ borderTop: i ? '1px solid #E2E7EE' : 'none', opacity: r.published ? 1 : 0.85 }}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={TYPE_STYLE[r.type]}>{TYPE_ICON[r.type]} {r.type}</span>
                          <span className="text-sm font-black" style={{ color: '#1A2332' }}>{r.title}</span>
                        </div>
                        <div className="text-xs font-semibold mt-1" style={{ color: '#5C6B7A' }}>
                          Class {r.cls} · {r.subject} · Chapter: {r.chapter}
                        </div>
                        <div className="text-xs font-semibold mt-0.5" style={{ color: '#5C6B7A' }}>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noreferrer" style={{ color: '#2F6690' }} className="hover:underline">Open link ↗</a>
                          ) : (
                            `${r.fileName || 'File'} · ${fmtSize(r.size)}`
                          )}
                          {' · '}{when(r.date)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-sm text-xs font-bold" style={r.published ? { background: '#EAF4EE', color: '#2E7D4F' } : { background: '#FBF1DE', color: '#8A6512' }}>
                          {r.published ? 'Published' : 'Draft'}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => togglePublish(r.id, r.published)} className="text-xs px-3 py-1.5 rounded-md font-bold transition" style={{ background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }}>
                            {r.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => removeResource(r.id)} className="bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs px-3 py-1.5 rounded-md font-bold transition shadow-md">
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= Question Bank ================= */}
      {tab === 'Question Bank' && (
        <>
          {/* Dark / Navy Header Banner */}
          <div className="bg-[#1B3A6B] text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#2F6690] text-white uppercase tracking-wider">
                Shared Teacher Repository
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Interactive Test & Exam Generator</h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                Select questions using checkboxes below to compose a custom question paper draft. Click create to view and print papers.
              </p>
            </div>
            <div className="bg-[#112240] border border-[#2F6690] p-4 rounded-lg shrink-0 flex items-center gap-4 w-full md:w-auto">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Selected Questions</span>
                <div className="text-lg font-black text-amber-400">{selectedQs.length} Questions</div>
                <div className="text-xs text-slate-300">Total Marks: {totalMarks}</div>
              </div>
              <button 
                onClick={generatePaper} 
                className="ml-auto bg-[#C6952C] hover:bg-[#b08225] text-white text-xs font-bold px-4 py-2.5 rounded-md transition shadow flex items-center gap-1.5"
              >
                <span>📋 Create Test</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3" style={card}>
            <select value={qf.cls} onChange={(e) => setQf({ ...qf, cls: e.target.value })} className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer" style={{ ...inputStyle, color: '#2F6690' }}>
              <option value="All">All Classes</option>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select value={qf.subject} onChange={(e) => setQf({ ...qf, subject: e.target.value })} className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer" style={{ ...inputStyle, color: '#2F6690' }}>
              <option value="All">All Subjects</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={qf.diff} onChange={(e) => setQf({ ...qf, diff: e.target.value })} className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer" style={{ ...inputStyle, color: '#2F6690' }}>
              <option value="All">All Difficulties</option>
              {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={qf.type} onChange={(e) => setQf({ ...qf, type: e.target.value })} className="text-xs sm:text-sm font-bold rounded-md px-3 py-2 outline-none cursor-pointer" style={{ ...inputStyle, color: '#2F6690' }}>
              <option value="All">All Question Types</option>
              {Q_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Add question form */}
            <form onSubmit={addQuestion} noValidate className="rounded-lg shadow-sm self-start" style={card}>
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2E7EE' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Add to bank</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Class</Label>
                    <select value={qForm.cls} onChange={setQField('cls')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                      {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <select value={qForm.subject} onChange={setQField('subject')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Chapter</Label>
                  <input value={qForm.chapter} onChange={setQField('chapter')} placeholder="e.g. Fractions" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
                  <Err>{qErr.chapter}</Err>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Q_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQType(t)}
                      className="px-1 py-2 rounded-md text-xs font-bold transition"
                      style={qForm.type === t ? { ...Q_TYPE_STYLE[t], border: '1px solid #1B3A6B' } : { background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Difficulty</Label>
                    <select value={qForm.diff} onChange={setQField('diff')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none cursor-pointer" style={inputStyle}>
                      {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Marks</Label>
                    <input type="number" min="1" max="20" value={qForm.marks} onChange={setQField('marks')} className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
                    <Err>{qErr.marks}</Err>
                  </div>
                </div>

                <div>
                  <Label>Question</Label>
                  <textarea rows={3} value={qForm.text} onChange={setQField('text')} placeholder="Type the question" className="w-full px-3 py-2 rounded-md text-sm font-semibold outline-none resize-none" style={inputStyle} />
                  <Err>{qErr.text}</Err>
                </div>

                {qForm.type === 'MCQ' && (
                  <div>
                    <Label>Options (select the correct one)</Label>
                    <div className="space-y-2">
                      {qForm.options.map((o, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="radio" name="correct" checked={qForm.answer === i} onChange={() => setQForm({ ...qForm, answer: i })} style={{ accentColor: '#2E7D4F' }} aria-label={`Option ${'abcd'[i]} is correct`} />
                          <input value={o} onChange={setOption(i)} placeholder={`Option ${'abcd'[i]}`} className="flex-1 px-3 py-1.5 rounded-md text-sm font-semibold outline-none" style={inputStyle} />
                        </div>
                      ))}
                    </div>
                    <Err>{qErr.options}</Err>
                  </div>
                )}

                <button type="submit" className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-md font-bold transition shadow-md">
                  ➕ Add question
                </button>
                {qMsg && <p className="text-xs font-semibold" style={{ color: '#2E7D4F' }}>{qMsg}</p>}
              </div>
            </form>

            <div className="lg:col-span-2 space-y-5">
              {/* Question list */}
              <div className="rounded-lg shadow-sm" style={card}>
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E7EE' }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">Question Bank List</span>
                  <span className="text-xs font-semibold text-[#5C6B7A]">Showing {visibleQuestions.length} of {questions.length} questions</span>
                </div>
                {visibleQuestions.length === 0 ? (
                  <div className="p-10 text-center text-sm font-semibold" style={{ color: '#5C6B7A' }}>No questions match your filter.</div>
                ) : (
                  <ul className="divide-y divide-[#E2E7EE]">
                    {visibleQuestions.map((q) => {
                      const on = selected.includes(q.id);
                      return (
                        <li key={q.id} className="p-5 transition" style={{ background: on ? '#F5F7FA' : '#FFFFFF' }}>
                          <div className="flex items-start gap-3">
                            <input 
                              type="checkbox" 
                              checked={on} 
                              onChange={() => toggleSelect(q.id)} 
                              className="w-4 h-4 mt-1 shrink-0 cursor-pointer" 
                              style={{ accentColor: '#1B3A6B' }} 
                            />
                            <div className="min-w-0 flex-1 space-y-2">
                              {/* Top Badges Row */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F5F7FA] text-[#1A2332] border border-[#E2E7EE]">
                                  Class {q.cls}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={{ background: '#E8EEF7', color: '#1B3A6B' }}>
                                  {q.subject}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={DIFF_STYLE[q.diff] || DIFF_STYLE['Easy']}>
                                  {q.diff}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={Q_TYPE_STYLE[q.type] || Q_TYPE_STYLE['MCQ']}>
                                  {q.type}
                                </span>
                                <span className="ml-auto text-xs font-black text-[#1A2332]">
                                  {q.marks} Mark{q.marks > 1 ? 's' : ''}
                                </span>
                              </div>

                              {/* Question Text */}
                              <div className="text-sm font-bold text-[#1A2332]">
                                {q.text}
                              </div>

                              {/* Chapter / Topic */}
                              <div className="text-xs font-semibold text-[#5C6B7A]">
                                Topic / Chapter: {q.chapter}
                              </div>

                              {/* MCQ Options in 2-column Box Grid */}
                              {q.type === 'MCQ' && q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                  {q.options.map((o, k) => (
                                    <div 
                                      key={k} 
                                      className="px-3 py-2 rounded-md text-xs font-semibold border flex items-center gap-2"
                                      style={{
                                        background: k === q.answer ? '#EAF4EE' : '#FFFFFF',
                                        borderColor: k === q.answer ? '#2E7D4F' : '#E2E7EE',
                                        color: k === q.answer ? '#2E7D4F' : '#1A2332'
                                      }}
                                    >
                                      <span className="font-bold">{'ABCD'[k]}.</span>
                                      <span className="truncate">{o}</span>
                                      {k === q.answer && <span className="ml-auto text-[10px] font-bold">✓ Correct</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Paper builder bar */}
              <div className="rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3" style={card}>
                <div className="text-sm font-black" style={{ color: '#1A2332' }}>
                  {selectedQs.length} selected · {totalMarks} marks
                </div>
                <input value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} placeholder="Paper title" className="px-3 py-2 rounded-md text-sm font-semibold outline-none w-44" style={inputStyle} />
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#5C6B7A' }}>
                  <input type="number" min="5" value={paperTime} onChange={(e) => setPaperTime(e.target.value)} className="px-3 py-2 rounded-md text-sm font-semibold outline-none w-20" style={inputStyle} aria-label="Time in minutes" /> min
                </div>
                <button onClick={() => { setSelected([]); setShowPaper(false); setPaperMsg(''); }} className="ml-auto text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold" style={{ background: '#F5F7FA', color: '#5C6B7A', border: '1px solid #E2E7EE' }}>
                  Clear
                </button>
                <button onClick={generatePaper} className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md">
                  📄 Generate question paper
                </button>
                {paperMsg && <p className="w-full text-xs font-semibold" style={{ color: '#B3432B' }}>{paperMsg}</p>}
              </div>

              {/* Question paper preview */}
              {showPaper && selectedQs.length > 0 && (
                <div className="rounded-lg shadow-sm" style={card}>
                  <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid #E2E7EE' }}>
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: '#1A2332' }}>
                      <input type="checkbox" checked={showKey} onChange={(e) => setShowKey(e.target.checked)} className="w-4 h-4" style={{ accentColor: '#1B3A6B' }} />
                      Show answer key (teacher copy)
                    </label>
                    <button onClick={() => window.print()} className="bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm px-3.5 py-2 rounded-md font-bold transition shadow-md">
                      🖨️ Print paper
                    </button>
                  </div>

                  <div id="question-paper" className="p-6">
                    <div className="text-center pb-4" style={{ borderBottom: '3px solid #C6952C' }}>
                      <div className="text-lg font-black uppercase tracking-wider" style={{ color: '#1B3A6B' }}>Blue Heaven Kids Academy</div>
                      <div className="text-sm font-bold mt-0.5" style={{ color: '#1A2332' }}>{paperTitle || 'Test'} · {first?.subject || 'Subject'}</div>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 py-3 text-sm font-semibold" style={{ color: '#1A2332', borderBottom: '1px solid #E2E7EE' }}>
                      <span>Class: {first?.cls}</span>
                      <span>Time: {paperTime} minutes</span>
                      <span>Maximum marks: {totalMarks}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 py-3 text-sm" style={{ color: '#5C6B7A', borderBottom: '1px solid #E2E7EE' }}>
                      <span>Name: ______________________</span>
                      <span>Roll no.: ________</span>
                    </div>
                    <p className="text-xs font-semibold py-3" style={{ color: '#5C6B7A' }}>All questions are compulsory. Marks are shown in brackets.</p>

                    {sections.map((s) => (
                      <div key={s.type} className="mb-5">
                        <h4 className="text-sm font-black uppercase tracking-wider mb-2" style={{ color: '#1B3A6B' }}>
                          Section {s.letter} – {SECTION_NAME[s.type]}
                        </h4>
                        <ol className="space-y-3">
                          {s.qs.map((q) => (
                            <li key={q.id} className="text-sm" style={{ color: '#1A2332' }}>
                              <div className="flex justify-between gap-4">
                                <span><b>Q{q.no}.</b> {q.text}</span>
                                <span className="font-bold shrink-0">[{q.marks}]</span>
                              </div>
                              {q.type === 'MCQ' && q.options && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1 ml-6">
                                  {q.options.map((o, k) => (
                                    <div key={k} style={showKey && k === q.answer ? { color: '#2E7D4F', fontWeight: 700 } : undefined}>
                                      ({'abcd'[k]}) {o}{showKey && k === q.answer ? ' ✓' : ''}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                    <p className="text-center text-xs font-semibold pt-2" style={{ color: '#5C6B7A' }}>— End of paper —</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}