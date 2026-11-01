'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 💡 Professional Standard Homework Templates
const getSubjectTemplates = (subject) => {
  const subLower = (subject || '').toLowerCase();
  if (subLower.includes('english')) {
    return [
      'Read Chapter thoroughly and write down all difficult word meanings in your notebook.',
      'Solve comprehension exercises (Q1 to Q5) from the chapter in your fair notebook.',
      'Complete paragraph writing and grammar worksheet given in class neatly.',
      'Complete the Question Answers of Lesson.',
      'Learn and write the Question Answers of Lesson No.',
      'Complete Questions 1 to 5 of Lesson.',
      'Answer the given questions in the notebook.'
    ];
  } else if (subLower.includes('hindi')) {
    return [
      'पाठ को ध्यानपूर्वक पढ़ें और कठिन शब्दों के अर्थ अपनी उत्तर-पुस्तिका में लिखें।',
      'अभ्यास के प्रश्न-उत्तर (प्रश्न 1 से 5) को फेयर कॉपी में सुंदर लेख में हल करें।',
      'दिए गए ग्यांश/व्याकरण कार्य को पूरा करें और याद करें।'
    ];
  } else if (subLower.includes('math') || subLower.includes('ganit') || subLower.includes('mathematics')) {
    return [
      'Solve all numerical problems and examples from Exercise in your homework notebook.',
      'Revise formulas related to the chapter and practice key sums.',
      'Complete the math worksheet / workbook problems neatly with proper steps.',
      'Solve Questions 1 to 10 of Exercise.',
      'Practice 10 addition and subtraction sums.',
      'Learn Tables 2 to 20 and formulas of Chapter.',
      'Draw and label the given geometrical figures.'
    ];
  } else if (subLower.includes('science') || subLower.includes('evs') || subLower.includes('physics') || subLower.includes('chemistry')) {
    return [
      'Read Chapter thoroughly, underline scientific terms, and write short definitions.',
      'Draw well-labeled diagrams of the given topic in your notebook.',
      'Answer review questions and exercises given at the end of the chapter.',
      'Complete the Question Answers of Chapter.',
      'Learn and write the Question Answers of Chapter.'
    ];
  } else if (subLower.includes('social') || subLower.includes('history') || subLower.includes('political') || subLower.includes('econ')) {
    return [
      'Read the chapter carefully and prepare short notes/bullet points.',
      'Answer long and short question-answers related to the chapter in your notebook.',
      'Complete map-pointing / geography exercises given for homework.',
      'Complete Questions 1 to 5 of Chapter.'
    ];
  } else if (subLower.includes('sanskrit')) {
    return [
      'पाठ का हिंदी अनुवाद पढ़ें और शब्द-ार्थ अपनी उत्तर-पुस्तिका में लिखें।',
      'संस्कृत व्याकरण (शब्द रूप/धातु रूप) को लिखकर अभ्यास करें।',
      'अभ्यास कार्य के सभी प्रश्न-उत्तर पूर्ण करें।'
    ];
  } else if (subLower.includes('computer') || subLower.includes('gk') || subLower.includes('g.k.')) {
    return [
      'Read Chapter thoroughly and write down important definitions and shortcuts.',
      'Practice the practical steps and syntax discussed in the lab.',
      'Complete question-answers and exercise review in your notebook.'
    ];
  }

  return [
    'Read the assigned chapter thoroughly and complete all exercises in your notebook.',
    'Revise key concepts and solve review questions discussed during the lecture.',
    'Complete the given worksheet/assignment neatly before the next class.'
  ];
};

// 🎨 Subject 3D Color Gradients & Styles
const getSubjectStyles = (subject) => {
  const subLower = (subject || '').toLowerCase();
  if (subLower.includes('english')) {
    return { light: 'bg-blue-100 text-blue-900 border-blue-300', dark: 'bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white border-t border-blue-200 border-b-[4px] border-blue-950 shadow-md' };
  } else if (subLower.includes('hindi')) {
    return { light: 'bg-orange-100 text-orange-900 border-orange-300', dark: 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700 text-white border-t border-orange-200 border-b-[4px] border-orange-950 shadow-md' };
  } else if (subLower.includes('math') || subLower.includes('mathematics')) {
    return { light: 'bg-rose-100 text-rose-900 border-rose-300', dark: 'bg-gradient-to-r from-rose-500 via-pink-600 to-red-700 text-white border-t border-rose-200 border-b-[4px] border-rose-950 shadow-md' };
  } else if (subLower.includes('evs') || subLower.includes('science') || subLower.includes('biology')) {
    return { light: 'bg-emerald-100 text-emerald-900 border-emerald-300', dark: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-green-700 text-white border-t border-emerald-200 border-b-[4px] border-emerald-950 shadow-md' };
  } else if (subLower.includes('physics') || subLower.includes('chemistry') || subLower.includes('computer')) {
    return { light: 'bg-indigo-100 text-indigo-900 border-indigo-300', dark: 'bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-700 text-white border-t border-indigo-200 border-b-[4px] border-indigo-950 shadow-md' };
  } else if (subLower.includes('social') || subLower.includes('history')) {
    return { light: 'bg-amber-100 text-amber-900 border-amber-300', dark: 'bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-700 text-white border-t border-amber-200 border-b-[4px] border-amber-950 shadow-md' };
  } else if (subLower.includes('sanskrit')) {
    return { light: 'bg-purple-100 text-purple-900 border-purple-300', dark: 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 text-white border-t border-purple-200 border-b-[4px] border-purple-950 shadow-md' };
  } else if (subLower.includes('g.k.') || subLower.includes('gk')) {
    return { light: 'bg-lime-100 text-lime-900 border-lime-300', dark: 'bg-gradient-to-r from-lime-500 via-emerald-600 to-green-700 text-white border-t border-lime-200 border-b-[4px] border-lime-950 shadow-md' };
  }
  
  return { light: 'bg-slate-100 text-slate-800 border-slate-300', dark: 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white border-t border-slate-300 border-b-[4px] border-slate-950 shadow-md' };
};

// 🛠️ Helper to normalize subject names for reliable matching
const normalizeSubject = (sub) => {
  if (!sub) return '';
  return sub.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export default function HomeworkPublisherManager() {
  const [classSubjectsMap, setClassSubjectsMap] = useState({});
  const [selectedClass, setSelectedClass] = useState('First');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submissionDate, setSubmissionDate] = useState('');
  const [session, setSession] = useState('2026-2027');
  
  const [homeworkInputs, setHomeworkInputs] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [historyFilterClass, setHistoryFilterClass] = useState('All');
  const [historyFilterDate, setHistoryFilterDate] = useState('');

  // 🔄 Fetch Class Subjects dynamically
  const fetchClassSubjects = async () => {
    const { data, error } = await supabase.from('class_subjects').select('*');
    if (error) {
      console.error('Error fetching class subjects:', error.message);
    } else if (data && data.length > 0) {
      const map = {};
      data.forEach(item => {
        const cls = (item.class_name || '').trim();
        const sub = (item.subject_name || '').trim();
        if (cls && sub) {
          if (!map[cls]) map[cls] = [];
          if (!map[cls].includes(sub)) {
            map[cls].push(sub);
          }
        }
      });
      setClassSubjectsMap(map);
      if (!map[selectedClass] && Object.keys(map).length > 0) {
        const firstKey = Object.keys(map)[0];
        setSelectedClass(firstKey);
      }
    }
  };

  // 🔄 Robust Client-Side Filtered Supabase Homework Fetching (Fixed order by id)
  const fetchHomeworkHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('daily_homework')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching homework:', error.message);
      setHistory([]);
    } else {
      let results = data || [];

      if (historyFilterClass && historyFilterClass !== 'All') {
        results = results.filter(item => {
          const dbClass = (item.class_name || '').trim().toLowerCase();
          const filterClass = historyFilterClass.trim().toLowerCase();
          return dbClass === filterClass || dbClass.includes(filterClass) || filterClass.includes(dbClass);
        });
      }

      if (historyFilterDate && historyFilterDate.trim() !== '') {
        results = results.filter(item => {
          if (!item.assign_date) return false;
          const dbDate = item.assign_date.split('T')[0];
          return dbDate === historyFilterDate;
        });
      }

      setHistory(results);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClassSubjects();
  }, []);

  useEffect(() => {
    fetchHomeworkHistory();
  }, [historyFilterClass, historyFilterDate]);

  const handleHomeworkChange = (subject, field, text) => {
    setHomeworkInputs(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: text
      }
    }));
  };

  // 🚀 Single Subject Publish
  const handlePublishSingleSubject = async (subject) => {
    const subData = homeworkInputs[subject] || {};
    const title = subData.title?.trim() || '';
    const description = subData.description?.trim() || '';

    if (!title && !description) {
      alert(`कृपया ${subject} का Title या Instructions दर्ज करें!`);
      return;
    }

    const { error } = await supabase.from('daily_homework').insert([
      {
        class_name: selectedClass,
        subject_name: subject,
        assign_date: selectedDate,
        submission_date: submissionDate || 'Next Class',
        chapter_title: title,
        instructions: description,
        session: session
      }
    ]);

    if (error) {
      alert('Error publishing homework: ' + error.message);
    } else {
      alert(`Class ${selectedClass} - ${subject} का होमवर्क सफलतापूर्वक पब्लिश हो गया!`);
      setHomeworkInputs(prev => ({
        ...prev,
        [subject]: { title: '', description: '' }
      }));
      fetchHomeworkHistory();
    }
  };

  // 💾 Save & Publish All Subjects
  const handlePublishAllHomework = async (e) => {
    if (e) e.preventDefault();

    const insertRows = [];
    Object.keys(homeworkInputs).forEach(subject => {
      const subData = homeworkInputs[subject] || {};
      const title = subData.title?.trim() || '';
      const description = subData.description?.trim() || '';

      if (title || description) {
        insertRows.push({
          class_name: selectedClass,
          subject_name: subject,
          assign_date: selectedDate,
          submission_date: submissionDate || 'Next Class',
          chapter_title: title,
          instructions: description,
          session: session
        });
      }
    });

    if (insertRows.length === 0) {
      alert('कृपया कम से कम एक सब्जेक्ट का Title या Instructions लिखें!');
      return;
    }

    const { error } = await supabase.from('daily_homework').insert(insertRows);

    if (error) {
      alert('Error publishing all homework: ' + error.message);
    } else {
      alert(`Class ${selectedClass} का सभी विषयों का होमवर्क पब्लिश हो गया!`);
      setHomeworkInputs({});
      fetchHomeworkHistory();
    }
  };

  // 🗑️ Delete Homework Record
  const handleDeleteHistory = async (id) => {
    if (confirm('क्या आप इस होमवर्क रिकॉर्ड को डिलीट करना चाहते हैं?')) {
      const { error } = await supabase.from('daily_homework').delete().eq('id', id);
      if (error) {
        alert('Error deleting record: ' + error.message);
      } else {
        fetchHomeworkHistory();
      }
    }
  };

  const handleResetFilters = () => {
    setHistoryFilterClass('All');
    setHistoryFilterDate('');
  };

  // Ensure all available classes from history are also included in class dropdown options
  const dynamicClassNames = new Set(Object.keys(classSubjectsMap));
  history.forEach(item => {
    if (item.class_name) dynamicClassNames.add(item.class_name.trim());
  });
  const classNamesList = Array.from(dynamicClassNames);

  const currentSubjects = classSubjectsMap[selectedClass] || [];

  // Group history for card view (when All classes selected)
  const getGroupedHistory = () => {
    const grouped = {};
    history.forEach(item => {
      const key = `${item.class_name}_${item.assign_date}_${item.submission_date || ''}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: item.id,
          date: item.assign_date,
          submissionDate: item.submission_date,
          className: item.class_name,
          entries: {}
        };
      }
      grouped[key].entries[item.subject_name || 'General'] = {
        id: item.id,
        title: item.chapter_title,
        description: item.instructions
      };
    });
    return Object.values(grouped);
  };

  const groupedHistory = getGroupedHistory();

  // Subject-wise consolidated data with robust subject matching
  const getSubjectWiseConsolidatedData = () => {
    const subjectMap = {};
    const officialSubjects = historyFilterClass !== 'All' ? (classSubjectsMap[historyFilterClass] || []) : [];
    
    // Ensure all history subjects and official subjects appear
    history.forEach(item => {
      let sub = item.subject_name ? item.subject_name.trim() : 'General';
      if (!subjectMap[sub]) {
        subjectMap[sub] = [];
      }
    });

    officialSubjects.forEach(sub => {
      if (!subjectMap[sub]) {
        subjectMap[sub] = [];
      }
    });

    history.forEach(item => {
      let sub = item.subject_name ? item.subject_name.trim() : 'General';
      const normSub = normalizeSubject(sub);
      
      const foundOfficialSub = officialSubjects.find(
        official => normalizeSubject(official) === normSub
      );
      
      const targetSub = foundOfficialSub || sub;

      if (!subjectMap[targetSub]) {
        subjectMap[targetSub] = [];
      }
      
      subjectMap[targetSub].push({
        id: item.id,
        date: item.assign_date,
        submissionDate: item.submission_date,
        className: item.class_name,
        work: {
          title: item.chapter_title,
          description: item.instructions
        }
      });
    });

    return subjectMap;
  };

  const subjectWiseConsolidatedData = getSubjectWiseConsolidatedData();

  return (
    <div className="p-4 md:p-8 bg-slate-50 text-slate-800 rounded-2xl space-y-8 shadow-md border border-slate-200 font-sans">
      
      {/* 1. Homework Publisher Entry Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 p-6 rounded-2xl shadow-lg text-white mb-6 border border-indigo-400/30 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-wide text-white flex items-center gap-2">
              <span>📝</span> Publish Daily Homework
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-indigo-100/90 mt-1">
              प्रत्येक विषय के लिए Chapter/Title एवं Professional Instructions दर्ज करें।
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
            <div className="flex flex-col flex-1 md:flex-none">
              <label className="text-xs font-black text-indigo-100 uppercase tracking-wider mb-1">Select Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setHomeworkInputs({});
                }}
                className="bg-white text-slate-900 font-extrabold text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400 shadow-inner cursor-pointer"
              >
                {classNamesList.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col flex-1 md:flex-none">
              <label className="text-xs font-black text-amber-200 uppercase tracking-wider mb-1">Assign Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white text-slate-900 font-bold text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              />
            </div>

            <div className="flex flex-col flex-1 md:flex-none">
              <label className="text-xs font-black text-emerald-200 uppercase tracking-wider mb-1">Submission Date:</label>
              <input
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="bg-white text-slate-900 font-bold text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Subject Homework Entry Boxes Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-base font-bold text-slate-700">
              Subjects for <span className="text-indigo-600 font-black text-lg">{selectedClass}</span> ({currentSubjects.length} Subjects):
            </span>

            {/* Clear All Fields Button with Press Effect */}
            <button
              type="button"
              onClick={() => setHomeworkInputs({})}
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl border-t border-amber-200 border-b-[4px] border-amber-950 shadow-md active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔄</span> Clear All Fields
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentSubjects.map((subject) => {
              const subData = homeworkInputs[subject] || {};
              const isFilled = (subData.title && subData.title.trim() !== '') || (subData.description && subData.description.trim() !== '');
              const { dark } = getSubjectStyles(subject);
              const subjectTemplates = getSubjectTemplates(subject);

              return (
                <div key={subject} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className={`${dark} font-black text-base px-4 py-3 flex items-center justify-between`}>
                    <span className="flex items-center gap-2">📚 {subject}</span>
                    {isFilled && (
                      <span className="text-xs bg-white/25 text-white border border-white/30 px-2.5 py-0.5 rounded-full font-bold">
                        Filled ✓
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-4 flex-1">
                    <div>
                      <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">
                        📌 Title / Chapter:
                      </label>
                      <input
                        type="text"
                        value={subData.title || ''}
                        onChange={(e) => handleHomeworkChange(subject, 'title', e.target.value)}
                        placeholder="e.g. Chapter 3 - Word Meanings"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner font-sans font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-indigo-600 block mb-1">
                        💡 Quick Professional Templates:
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleHomeworkChange(subject, 'description', e.target.value);
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-xl px-3 py-2 text-xs text-indigo-950 font-bold outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
                      >
                        <option value="" disabled>-- Select professional line (Editable) --</option>
                        {subjectTemplates.map((tmpl, idx) => (
                          <option key={idx} value={tmpl}>{tmpl}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">
                        📝 Instructions / Details (Editable):
                      </label>
                      <textarea
                        rows={3}
                        value={subData.description || ''}
                        onChange={(e) => handleHomeworkChange(subject, 'description', e.target.value)}
                        placeholder="Select above or type custom instructions here..."
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-sans font-semibold shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex justify-end">
                    {/* Publish Single Subject Button with Press Effect */}
                    <button
                      type="button"
                      onClick={() => handlePublishSingleSubject(subject)}
                      className={`${dark} text-xs uppercase tracking-wider font-black px-4 py-2.5 rounded-xl active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer`}
                    >
                      <span>🚀</span> Publish {subject}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-slate-200 mt-6">
            {/* Save & Publish All Subjects Button with Press Effect */}
            <button
              type="button"
              onClick={handlePublishAllHomework}
              className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-400 hover:to-teal-600 text-white font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl border-t border-emerald-300 border-b-[5px] border-emerald-950 shadow-lg active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>💾</span> Save & Publish All Subjects
            </button>
          </div>
        </div>
      </div>

      {/* 2. Homework History Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b-2 border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>📜</span> Published Homework History
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              क्लास फ़िल्टर करते ही उस क्लास के सभी विषयों का होमवर्क एक साथ दिखेगा।
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-500">Filter Class:</span>
              <select
                value={historyFilterClass}
                onChange={(e) => setHistoryFilterClass(e.target.value)}
                className="bg-slate-50 border-2 border-indigo-200 text-sm text-slate-900 font-extrabold rounded-xl px-3 py-2 outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
              >
                <option value="All">All Classes</option>
                {classNamesList.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-500">Filter Date:</span>
              <input
                type="date"
                value={historyFilterDate}
                onChange={(e) => setHistoryFilterDate(e.target.value)}
                className="bg-slate-50 border-2 border-slate-200 text-sm text-slate-800 font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
              />
            </div>

            {(historyFilterClass !== 'All' || historyFilterDate !== '') && (
              /* Reset Filters Button with Press Effect */
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl border-t border-slate-400 border-b-[4px] border-slate-950 shadow-md active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>❌</span> Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600 font-bold px-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-200">
          <span>
            Showing Homework for: <strong className="text-indigo-700 font-black text-base">{historyFilterClass} Class</strong> 
            {historyFilterDate ? <span> (Date: <strong className="text-amber-700">{historyFilterDate}</strong>)</span> : ' (All Dates)'}
          </span>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black">
            {historyFilterClass !== 'All' ? 'Consolidated Subject View' : 'Card View'}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500 font-bold">Loading homework data from Supabase...</div>
        ) : historyFilterClass !== 'All' ? (
          /* VIEW 1: Consolidated Subject-wise View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.keys(subjectWiseConsolidatedData).map((subject) => {
              const entriesList = subjectWiseConsolidatedData[subject];
              const { dark } = getSubjectStyles(subject);

              return (
                <div key={subject} className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className={`${dark} font-black text-base px-4 py-3 flex items-center justify-between`}>
                    <span>📘 {subject}</span>
                    <span className="bg-black/20 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                      {entriesList.length} Task{entriesList.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-96">
                    {entriesList.length > 0 ? (
                      entriesList.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 relative group">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-2 mb-2">
                            <span>📅 Date: <strong className="text-slate-800 text-sm">{item.date}</strong></span>
                            <span className="text-emerald-700 font-extrabold text-sm">Sub: {item.submissionDate}</span>
                          </div>

                          <div className="space-y-2">
                            {item.work.title && (
                              <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg text-sm">
                                📌 {item.work.title}
                              </div>
                            )}
                            {item.work.description && (
                              <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed text-sm">
                                {item.work.description}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-end pt-3 mt-2 border-t border-slate-100">
                            {/* Delete Task Button with Press Effect */}
                            <button
                              onClick={() => handleDeleteHistory(item.id)}
                              className="bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:to-red-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg border-t border-rose-300 border-b-[3px] border-rose-950 shadow-sm active:translate-y-0.5 active:border-b-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>🗑️</span> Delete Task
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic text-sm py-8 text-center font-semibold">
                        No homework assigned for {subject}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: Standard History Card View */
          <div className="space-y-5">
            {groupedHistory.length > 0 ? (
              groupedHistory.map((item) => (
                <div key={item.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between flex-wrap gap-3 border-b-2 border-slate-200 pb-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="bg-indigo-100 text-indigo-900 text-sm font-black px-3 py-1.5 rounded-xl border border-indigo-200">
                        Class: {item.className}
                      </span>
                      <span className="text-sm text-slate-600 font-semibold">
                        Assigned On: <strong className="text-slate-900">{item.date}</strong>
                      </span>
                      <span className="text-sm text-slate-600 font-semibold">
                        Submission: <strong className="text-emerald-700">{item.submissionDate}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {Object.entries(item.entries).map(([sub, work]) => {
                      const { dark } = getSubjectStyles(sub);
                      
                      return (
                        <div key={sub} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                          <div className={`${dark} px-3 py-2 flex justify-between items-center text-xs font-black`}>
                            <span>📘 {sub}</span>
                            {/* Card View Delete Button with Press Effect */}
                            <button
                              onClick={() => handleDeleteHistory(work.id)}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] px-2.5 py-1 rounded-lg border-t border-rose-300 border-b-[3px] border-rose-950 shadow-sm active:translate-y-0.5 active:border-b-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1"
                              title="Delete this subject task"
                            >
                              <span>🗑️</span> Delete
                            </button>
                          </div>

                          <div className="p-3 space-y-2">
                            {work.title && (
                              <div className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-sm">
                                📌 {work.title}
                              </div>
                            )}
                            {work.description && (
                              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                                {work.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 italic text-base font-semibold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                कोई होमवर्क हिस्ट्री रिकॉर्ड नहीं मिला। (Supabase table check karein ya naya homework publish karein)
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}