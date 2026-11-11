// Filename: TeacherDashboard.jsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, PlusCircle, Send, BookOpen, Layers, CheckCircle2, Trash2, Database, Shuffle, CheckSquare, Filter } from 'lucide-react';

export default function TeacherDashboard() {
  const [quizTitle, setQuizTitle] = useState('');
  const [className, setClassName] = useState('First');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [session, setSession] = useState('2026 - 2027');
  
  // प्रश्न जोड़ने के 3 तरीके: 'manual' | 'picker' | 'random'
  const [addMode, setAddMode] = useState('manual');

  // Manual questions state
  const [questions, setQuestions] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
  ]);

  // Question Bank & Filter states
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedBankIds, setSelectedBankIds] = useState([]);
  const [randomCount, setRandomCount] = useState(5);
  const [bankLoading, setBankLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // नए एडवांस्ड फिल्टर्स स्टेट (Chapter, Question Type, Medium)
  const [filterMedium, setFilterMedium] = useState('All');
  const [filterChapter, setFilterChapter] = useState('All');
  const [filterQType, setFilterQType] = useState('All');

  // डायनामिक लिस्ट्स जो डेटाबेस से फेच होंगी
  const [availableChapters, setAvailableChapters] = useState([]);
  const [availableQTypes, setAvailableQTypes] = useState([]);

  const classOptions = [
    'PP.3+', 'PP.4+', 'PP.5+', 'First', 'Second', 'Third', 'Fourth', 'Fifth',
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    'Eleventh(Arts)', 'Eleventh(Commerce)', 'Eleventh(Science)',
    'Twelfth(Arts)', 'Twelfth(Commerce)', 'Twelfth(Science)'
  ];

  const subjectOptions = [
    'Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 
    'Sanskrit', 'Computer', 'G.K.', 'Physics', 'Chemistry', 'Biology', 'Accountancy', 'Business Studies'
  ];

  // जब क्लास या सब्जेक्ट बदले, तो Question Bank से डेटा फेच करें
  useEffect(() => {
    if (addMode === 'picker' || addMode === 'random') {
      fetchQuestionBank();
    }
  }, [className, subjectName, addMode]);

  const fetchQuestionBank = async () => {
    setBankLoading(true);
    try {
      let query = supabase
        .from('question_bank')
        .select('*')
        .ilike('class_name', className)
        .ilike('subject_name', subjectName);

      const { data, error } = await query;

      if (error) throw error;
      const rawData = data || [];
      setBankQuestions(rawData);

      //यूनिक चैप्टर्स और प्रश्न प्रकार (Question Types) निकालें ताकि ड्रॉपडाउन में दिखे
      const chapters = [...new Set(rawData.map(q => q.chapter_name).filter(Boolean))];
      const qTypes = [...new Set(rawData.map(q => q.question_type).filter(Boolean))];

      setAvailableChapters(chapters);
      setAvailableQTypes(qTypes);
    } catch (err) {
      console.error('Error fetching question bank:', err.message);
    } finally {
      setBankLoading(false);
    }
  };

  // फ़िल्टर करने का लॉजिक
  const filteredBankQuestions = bankQuestions.filter(q => {
    if (filterMedium !== 'All' && q.medium && q.medium.toLowerCase() !== filterMedium.toLowerCase()) {
      return false;
    }
    if (filterChapter !== 'All' && q.chapter_name !== filterChapter) {
      return false;
    }
    if (filterQType !== 'All' && q.question_type !== filterQType) {
      return false;
    }
    return true;
  });

  const addQuestionField = () => {
    setQuestions([
      ...questions,
      { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
    ]);
  };

  const removeQuestionField = (index) => {
    if (questions.length === 1) {
      alert("कम से कम एक प्रश्न होना अनिवार्य है!");
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleToggleBankQuestion = (qId) => {
    if (selectedBankIds.includes(qId)) {
      setSelectedBankIds(selectedBankIds.filter(id => id !== qId));
    } else {
      setSelectedBankIds([...selectedBankIds, qId]);
    }
  };

  const handleAddSelectedFromBank = () => {
    if (selectedBankIds.length === 0) {
      alert("कृपया कम से कम एक प्रश्न चुनें!");
      return;
    }

    const selectedItems = bankQuestions
      .filter(q => selectedBankIds.includes(q.id))
      .map(q => ({
        question_text: q.question_text || q.question_text_hi || '',
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct_option: q.correct_answer || q.correct_option || 'A'
      }));

    if (questions.length === 1 && !questions[0].question_text.trim()) {
      setQuestions(selectedItems);
    } else {
      setQuestions([...questions, ...selectedItems]);
    }

    alert(`🎉 ${selectedItems.length} प्रश्न सफलतापूर्वक जोड़ दिए गए हैं!`);
    setAddMode('manual');
    setSelectedBankIds([]);
  };

  const handleAddRandomFromBank = async () => {
    if (filteredBankQuestions.length === 0) {
      alert("चयनित फ़िल्टर के आधार पर कोई प्रश्न उपलब्ध नहीं है!");
      return;
    }

    // फ़िल्टर किए गए डेटा से रैंडम शफल करें
    const shuffled = [...filteredBankQuestions].sort(() => 0.5 - Math.random());
    const selectedRandom = shuffled.slice(0, parseInt(randomCount));

    const randomItems = selectedRandom.map(q => ({
      question_text: q.question_text || q.question_text_hi || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: q.correct_answer || q.correct_option || 'A'
    }));

    if (questions.length === 1 && !questions[0].question_text.trim()) {
      setQuestions(randomItems);
    } else {
      setQuestions([...questions, ...randomItems]);
    }

    alert(`🎉 फ़िल्टर्ड डेटा से रैंडमली ${randomItems.length} प्रश्न जोड़ दिए गए हैं!`);
    setAddMode('manual');
  };

  const handlePublish = async () => {
    if (!quizTitle.trim()) {
      alert("कृपया क्विज़/पेपर का शीर्षक (Title) दर्ज करें।");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim() || !questions[i].option_a || !questions[i].option_b) {
        alert(`प्रश्न क्रमांक ${i + 1} के सभी आवश्यक फील्ड्स खाली हैं!`);
        return;
      }
    }

    setLoading(true);
    try {
      const { data: quizInsertData, error: quizError } = await supabase
        .from('quizzes')
        .insert([
          {
            title: quizTitle,
            class_name: className,
            subject_name: subjectName,
            session: session,
            created_at: new Date()
          }
        ])
        .select();

      if (quizError) throw quizError;

      if (quizInsertData && quizInsertData.length > 0) {
        const newQuizId = quizInsertData[0].id;

        const questionsPayload = questions.map((q) => ({
          quiz_id: newQuizId,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          created_at: new Date()
        }));

        const { error: qError } = await supabase
          .from('quiz_questions')
          .insert(questionsPayload);

        if (qError) throw qError;

        alert(`🎉 ${className} (${subjectName}) के लिए पेपर सफलतापूर्वक पब्लिश कर दिया गया है!`);
        
        setQuizTitle('');
        setQuestions([
          { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
        ]);
      }
    } catch (err) {
      alert("पेपर पब्लिश करने में त्रुटि: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-slate-100 min-h-screen font-sans text-slate-900">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* हेडर बैनर */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/30">
              Examination Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-400" size={28} /> Advanced Online Question Paper Creator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Create assessment papers via Chapter-wise, Question Type-wise, and Medium-wise filtering.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* सामान्य परीक्षा विवरण */}
          <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
              1. General Examination Configuration
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-600" /> Target Class
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                >
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-600" /> Subject
                </label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                >
                  {subjectOptions.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Academic Session
                </label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Test / Paper Title
              </label>
              <input
                type="text"
                placeholder="e.g., Chapter 1: Real Numbers - Unit Evaluation Test"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
          </div>

          {/* प्रश्न जोड़ने के मोड्स */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                2. Question Set ({questions.length} Items Configured)
              </h2>

              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                <button
                  onClick={() => setAddMode('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    addMode === 'manual' ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle size={14} /> Manual Type
                </button>
                <button
                  onClick={() => setAddMode('picker')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    addMode === 'picker' ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Database size={14} /> Question Bank Picker
                </button>
                <button
                  onClick={() => setAddMode('random')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    addMode === 'random' ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Shuffle size={14} /> Random Generator
                </button>
              </div>
            </div>

            {/* मैनुअल टाइपिंग फॉर्म */}
            {addMode === 'manual' && (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={index} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:border-indigo-200 transition-all space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
                        Question No. {index + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestionField(index)}
                          className="text-xs font-extrabold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={14} /> Delete Question
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder={`Enter Question ${index + 1} text here...`}
                        value={q.question_text}
                        onChange={(e) => {
                          const newQ = [...questions];
                          newQ[index].question_text = e.target.value;
                          setQuestions(newQ);
                        }}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50/50 outline-none text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-2 w-9 text-center">
                            {opt}
                          </span>
                          <input
                            type="text"
                            placeholder={`Option ${opt} text`}
                            value={q[`option_${opt.toLowerCase()}`]}
                            onChange={(e) => {
                              const newQ = [...questions];
                              newQ[index][`option_${opt.toLowerCase()}`] = e.target.value;
                              setQuestions(newQ);
                            }}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white outline-none text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 bg-slate-50/60 p-3 rounded-xl">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <label className="text-xs font-black text-slate-700 uppercase">Correct Answer Key:</label>
                      <select
                        value={q.correct_option}
                        onChange={(e) => {
                          const newQ = [...questions];
                          newQ[index].correct_option = e.target.value;
                          setQuestions(newQ);
                        }}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addQuestionField}
                  className="w-full sm:w-auto px-5 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle size={16} /> Add Next Question Manually
                </button>
              </div>
            )}

            {/* क्वेश्चन बैंक पिकर (Chapter, Type, Medium Filters के साथ) */}
            {addMode === 'picker' && (
              <div className="p-5 border border-slate-300 rounded-2xl bg-indigo-50/40 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-sm font-black text-indigo-900">Select Questions with Advanced Filters</h3>
                    <p className="text-xs text-slate-500">Class: <strong>{className}</strong> | Subject: <strong>{subjectName}</strong></p>
                  </div>
                  <button
                    onClick={handleAddSelectedFromBank}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare size={16} /> Add Selected ({selectedBankIds.length})
                  </button>
                </div>

                {/* एडवांस्ड फ़िल्टर बार (Chapter, Medium, QType) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Filter by Medium</label>
                    <select
                      value={filterMedium}
                      onChange={(e) => setFilterMedium(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xs font-bold outline-none"
                    >
                      <option value="All">All Mediums</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Filter by Chapter</label>
                    <select
                      value={filterChapter}
                      onChange={(e) => setFilterChapter(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xs font-bold outline-none"
                    >
                      <option value="All">All Chapters</option>
                      {availableChapters.map(chap => (
                        <option key={chap} value={chap}>{chap}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Filter by Question Type</label>
                    <select
                      value={filterQType}
                      onChange={(e) => setFilterQType(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xs font-bold outline-none"
                    >
                      <option value="All">All Question Types</option>
                      {availableQTypes.map(qt => (
                        <option key={qt} value={qt}>{qt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {bankLoading ? (
                  <div className="py-12 text-center text-slate-500 font-bold flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-indigo-600" size={20} /> Loading Question Bank...
                  </div>
                ) : filteredBankQuestions.length > 0 ? (
                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
                    {filteredBankQuestions.map((bq) => {
                      const isChecked = selectedBankIds.includes(bq.id);
                      return (
                        <div
                          key={bq.id}
                          onClick={() => handleToggleBankQuestion(bq.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                            isChecked ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 h-4 w-4 text-indigo-600 rounded cursor-pointer"
                          />
                          <div className="text-xs sm:text-sm font-semibold text-slate-800 w-full">
                            <div className="flex justify-between items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded w-fit mb-1">
                              <span>Chapter: {bq.chapter_name || 'General'}</span>
                              <span className="ml-2">Type: {bq.question_type || 'MCQ'}</span>
                              <span className="ml-2">Medium: {bq.medium || 'English'}</span>
                            </div>
                            <p>{bq.question_text || bq.question_text_hi}</p>
                            <div className="text-[11px] text-slate-500 mt-1 flex gap-3">
                              <span>(A) {bq.option_a}</span>
                              <span>(B) {bq.option_b}</span>
                              <span className="font-bold text-emerald-600">Ans: {bq.correct_answer || bq.correct_option}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 font-bold text-xs bg-white rounded-xl border border-dashed border-slate-300">
                    चयनित फ़िल्टर के अनुसार कोई प्रश्न उपलब्ध नहीं है।
                  </div>
                )}
              </div>
            )}

            {/* रैंडम क्वेश्चन जनरेटर (फिल्टर्ड डेटा के साथ) */}
            {addMode === 'random' && (
              <div className="p-6 border border-slate-300 rounded-2xl bg-indigo-50/40 space-y-4 max-w-xl mx-auto text-center">
                <Shuffle className="mx-auto text-indigo-600" size={32} />
                <h3 className="text-base font-black text-indigo-900">Advanced Random Generator</h3>
                <p className="text-xs text-slate-500">
                  First filter your desired Chapter, Medium, or Type above, then pick random questions.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <label className="text-xs font-bold text-slate-700">Number of Questions:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={randomCount}
                    onChange={(e) => setRandomCount(e.target.value)}
                    className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-center outline-none shadow-inner"
                  />
                </div>

                <button
                  onClick={handleAddRandomFromBank}
                  disabled={bankLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                >
                  {bankLoading ? <Loader2 className="animate-spin" size={16} /> : <Shuffle size={16} />}
                  Generate & Add Filtered Random Questions
                </button>
              </div>
            )}

          </div>

          {/* बॉटम पब्लिश बटन */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              onClick={handlePublish}
              disabled={loading}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {loading ? 'Publishing Paper...' : 'Publish Examination Paper'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}