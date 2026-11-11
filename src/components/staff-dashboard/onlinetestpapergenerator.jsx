// Filename: TeacherDashboard.jsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, PlusCircle, Send, BookOpen, Layers, CheckCircle2, Trash2 } from 'lucide-react';

export default function TeacherDashboard() {
  const [quizTitle, setQuizTitle] = useState('');
  const [className, setClassName] = useState('First');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [session, setSession] = useState('2026 - 2027');
  
  const [questions, setQuestions] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
  ]);
  const [loading, setLoading] = useState(false);

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
        
        {/* मानक प्रोफेशनल हेडर (Header Banner) */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/30">
              Examination Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-400" size={28} /> Online Question Paper Creator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Create standard, class-wise & subject-wise multiple choice assessment papers.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* सेक्शन 1: परीक्षा सामान्य विवरण (Exam Metadata Controls) */}
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 cursor-pointer shadow-sm"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 cursor-pointer shadow-sm"
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
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* सेक्शन 2: प्रश्न सेटिंग्स (Questions Management) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                2. Question Set ({questions.length} Items Configured)
              </h2>
            </div>

            {questions.map((q, index) => (
              <div key={index} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:border-indigo-200 transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
                    Question No. {index + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestionField(index)}
                      className="text-xs font-extrabold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition-colors"
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
          </div>

          {/* सेक्शन 3: बॉटम एक्शन (Standard Action Buttons) */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={addQuestionField}
              className="w-full sm:w-auto px-5 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} /> Add Next Question
            </button>
            
            <button
              onClick={handlePublish}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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