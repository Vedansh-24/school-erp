// Filename: OnlineTestQuiz.jsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Award, BookOpen, Layers, Clock, FileText, CheckCircle } from 'lucide-react';

export default function OnlineTestQuiz({ loggedInParentId }) {
  const [loading, setLoading] = useState(true);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [quizData, setQuizData] = useState({ title: 'Online Evaluation Test', subjectName: '', className: '', questions: [] });
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuizzesForStudent() {
      setLoading(true);
      try {
        let studentClass = '';

        if (loggedInParentId) {
          const { data: studentData } = await supabase
            .from('students')
            .select('class_name')
            .or(`student_id.eq.${loggedInParentId},id.eq.${loggedInParentId},sr_no.eq.${loggedInParentId}`)
            .limit(1);

          if (studentData && studentData.length > 0) {
            studentClass = studentData[0].class_name;
          }
        }

        let quizQuery = supabase.from('quizzes').select('*').order('created_at', { ascending: false });
        
        if (studentClass) {
          quizQuery = quizQuery.ilike('class_name', `%${studentClass}%`);
        }

        const { data: quizList, error: quizErr } = await quizQuery;
        if (quizErr) throw quizErr;

        if (quizList && quizList.length > 0) {
          setAvailableQuizzes(quizList);
          setSelectedQuizId(quizList[0].id);
        } else {
          setAvailableQuizzes([]);
        }
      } catch (err) {
        console.error('Error fetching quizzes list:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzesForStudent();
  }, [loggedInParentId]);

  useEffect(() => {
    if (!selectedQuizId) return;

    async function fetchQuizQuestions() {
      setLoading(true);
      try {
        const currentQuiz = availableQuizzes.find(q => q.id === selectedQuizId);

        const { data: questionsData, error: qErr } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', selectedQuizId);

        if (qErr) throw qErr;

        setQuizData({
          id: selectedQuizId,
          title: currentQuiz?.title || 'Online Test / Quiz',
          subjectName: currentQuiz?.subject_name || 'General',
          className: currentQuiz?.class_name || 'All',
          questions: questionsData || []
        });
        setSelectedAnswers({});
        setSubmitted(false);
        setScore(null);
      } catch (err) {
        console.error('Error fetching questions:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizQuestions();
  }, [selectedQuizId, availableQuizzes]);

  const handleSelectOption = (qId, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: option });
  };

  const handleSubmitQuiz = async () => {
    let currentScore = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_option) {
        currentScore += 1;
      }
    });

    setScore(currentScore);
    setSubmitted(true);
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('quiz_submissions')
        .insert([
          {
            quiz_id: quizData.id,
            student_id: loggedInParentId || 'UNKNOWN_STUDENT',
            score: currentScore,
            total_questions: quizData.questions.length,
            selected_answers: selectedAnswers,
            submitted_at: new Date()
          }
        ]);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving quiz submission:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && availableQuizzes.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-500 font-bold bg-white rounded-3xl shadow-sm border border-slate-200">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        Loading examination database...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* 1. टेस्ट/पेपर सिलेक्शन बार (Multiple Tests Dropdown) */}
      {availableQuizzes.length > 1 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
            <Layers size={18} className="text-amber-400" />
            <span>Select Available Examination Paper:</span>
          </div>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="bg-white text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl border border-amber-400 outline-none cursor-pointer shadow-inner w-full sm:w-auto min-w-[260px]"
          >
            {availableQuizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({q.subject_name || 'General'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. स्टैंडर्ड स्कूल एग्जाम शीट कार्ड (Standard School Exam Layout) */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-300 overflow-hidden">
        
        {/* स्कूल एवं पेपर आधिकारिक हेडर (Official Exam Header) */}
        <div className="p-6 sm:p-8 border-b-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Official Online Assessment Paper
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide uppercase pt-1">
            BLUE HEAVEN KIDS ACADEMY
          </h1>
          <h2 className="text-base sm:text-lg font-extrabold text-indigo-900 underline decoration-indigo-300 underline-offset-4">
            {quizData.title}
          </h2>
          
          {/* मानक पेपर मेटा-डेटा ग्रिड (Class, Subject, Marks & Time) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 max-w-2xl mx-auto text-xs font-bold text-slate-700 bg-slate-100/80 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-center gap-1.5 border-r border-slate-300">
              <BookOpen size={14} className="text-indigo-600" /> Subject: <span className="text-slate-900 font-black">{quizData.subjectName}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:border-r border-slate-300">
              <Layers size={14} className="text-indigo-600" /> Class: <span className="text-slate-900 font-black">{quizData.className}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 border-r border-slate-300">
              <FileText size={14} className="text-indigo-600" /> Questions: <span className="text-slate-900 font-black">{quizData.questions.length}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock size={14} className="text-indigo-600" /> Total Marks: <span className="text-slate-900 font-black">{quizData.questions.length}</span>
            </div>
          </div>
        </div>

        {/* 3. प्रश्न एवं विकल्प (Questions & Options) */}
        <div className="p-6 sm:p-8 space-y-6">
          {!submitted ? (
            <div>
              {quizData.questions.length > 0 ? (
                <div className="space-y-6">
                  {quizData.questions.map((q, qIndex) => (
                    <div key={q.id || qIndex} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 shadow-sm hover:bg-white transition-all space-y-4">
                      
                      {/* प्रश्न संख्या एवं विवरण (Standard Question Text) */}
                      <p className="font-extrabold text-slate-900 text-sm sm:text-base leading-relaxed flex items-start gap-2">
                        <span className="bg-indigo-600 text-white rounded-lg px-2 py-0.5 text-xs font-black min-w-[28px] text-center mt-0.5">
                          Q{qIndex + 1}
                        </span>
                        <span>{q.question_text}</span>
                      </p>

                      {/* 4 विकल्प (A, B, C, D Grid) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-9">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const optionKey = `option_${opt.toLowerCase()}`;
                          const optionValue = q[optionKey];
                          if (!optionValue) return null;

                          const isSelected = selectedAnswers[q.id] === opt;

                          return (
                            <label
                              key={opt}
                              className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-indigo-600 bg-indigo-50/80 shadow-md font-bold text-indigo-950' 
                                  : 'border-slate-200 bg-white hover:bg-slate-100/60 font-semibold text-slate-800'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, opt)}
                                className="mr-3 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                              />
                              <span className="text-xs sm:text-sm">
                                <strong className="text-indigo-600 mr-1.5">({opt})</strong> {optionValue}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* सबमिट बटन (Standard Submit Button) */}
                  <button
                    onClick={handleSubmitQuiz}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg hover:opacity-95 transition cursor-pointer mt-6 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Final Submit Exam & Generate Score
                  </button>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 font-extrabold text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                  इस समय इस कक्षा और विषय के लिए कोई भी परीक्षा पत्र उपलब्ध नहीं है।
                </div>
              )}
            </div>
          ) : (
            
            /* 4. ऑटोमेटेड रिजल्ट कार्ड (Automated Score Sheet) */
            <div className="text-center py-12 space-y-5 bg-slate-50/80 p-6 rounded-3xl border border-slate-200">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
                <Award size={44} />
              </div>

              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Final Score Obtained</span>
                <div className="text-5xl sm:text-6xl font-black text-indigo-600 tracking-tight my-1">
                  {score} / {quizData.questions.length}
                </div>
                <h3 className="text-lg font-black text-slate-800">Exam Submitted & Successfully Recorded!</h3>
                <p className="text-xs text-slate-500 font-medium">Your score has been stored in the school central database.</p>
              </div>
              
              {submitting && <p className="text-xs text-indigo-600 font-bold animate-pulse">Syncing evaluation results to Supabase...</p>}

              <button
                onClick={() => { setSubmitted(false); setSelectedAnswers({}); }}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer mt-2"
              >
                Retake Examination
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}