// Filename: OnlineTestQuiz.jsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Award, BookOpen, Layers } from 'lucide-react';

export default function OnlineTestQuiz({ loggedInParentId }) {
  const [loading, setLoading] = useState(true);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [quizData, setQuizData] = useState({ title: 'Online Test / Quiz', subjectName: '', questions: [] });
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. छात्र की क्लास पता करके उससे संबंधित सभी पब्लिश्ड क्विज़ (साथ में subject_name) फेच करना
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

        // Quizzes टेबल से क्लास के आधार पर क्विज़ फेच करें जिसमें subject_name भी शामिल है
        let quizQuery = supabase.from('quizzes').select('*').order('created_at', { ascending: false });
        
        if (studentClass) {
          quizQuery = quizQuery.ilike('class_name', `%${studentClass}%`);
        }

        const { data: quizList, error: quizErr } = await quizQuery;
        if (quizErr) throw quizErr;

        if (quizList && quizList.length > 0) {
          setAvailableQuizzes(quizList);
          setSelectedQuizId(quizList[0].id); // बाय डिफ़ॉल्ट पहली क्विज़ सेलेक्ट करें
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

  // 2. जब भी कोई विशिष्ट क्विज़ सेलेक्ट हो, उसके प्रश्न (Questions) फेच करना
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
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-500 font-bold bg-white rounded-2xl shadow-sm border border-slate-200">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        Loading online tests from database...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 space-y-6">
        
        {/* यदि एक से अधिक क्विज़ उपलब्ध हैं, तो स्विच करने के लिए ड्रॉपडाउन */}
        {availableQuizzes.length > 1 && (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-black uppercase text-indigo-900 flex items-center gap-2">
              <Layers size={16} /> Select Test / Subject Paper:
            </span>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="bg-white text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-300 outline-none cursor-pointer shadow-sm w-full sm:w-auto min-w-[240px]"
            >
              {availableQuizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.subject_name || 'General'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <BookOpen size={12} /> {quizData.subjectName || 'General'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{quizData.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Answer all questions and submit for instant automated evaluation.</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-extrabold border border-indigo-200 whitespace-nowrap">
            {quizData.questions.length} Questions
          </span>
        </div>

        {!submitted ? (
          <div>
            {quizData.questions.length > 0 ? (
              quizData.questions.map((q, qIndex) => (
                <div key={q.id || qIndex} className="mb-6 p-4 sm:p-5 border border-slate-200 rounded-xl bg-slate-50/50 shadow-sm">
                  <p className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                    {qIndex + 1}. {q.question_text}
                  </p>
                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const optionKey = `option_${opt.toLowerCase()}`;
                      const optionValue = q[optionKey];
                      if (!optionValue) return null;

                      return (
                        <label
                          key={opt}
                          className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedAnswers[q.id] === opt 
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-inner' 
                              : 'border-slate-200 bg-white hover:bg-slate-100/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            checked={selectedAnswers[q.id] === opt}
                            onChange={() => handleSelectOption(q.id, opt)}
                            className="mr-3 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className="text-sm font-bold text-slate-700">
                            <strong className="text-indigo-600 mr-2">({opt})</strong> {optionValue}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-12 text-slate-400 font-bold text-sm">इस छात्र की कक्षा के लिए इस समय कोई लाइव क्विज़ या पेपर उपलब्ध नहीं है।</p>
            )}

            {quizData.questions.length > 0 && (
              <button
                onClick={handleSubmitQuiz}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:opacity-95 transition cursor-pointer mt-4"
              >
                Submit Quiz & View Score
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Award size={36} />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-indigo-600">
              {score} / {quizData.questions.length}
            </div>
            <h3 className="text-lg font-black text-slate-800">Quiz Submitted & Saved Successfully!</h3>
            <p className="text-xs text-slate-500">Your performance report has been recorded in the school database.</p>
            
            {submitting && <p className="text-[11px] text-indigo-500 font-bold">Syncing result to Supabase...</p>}

            <button
              onClick={() => { setSubmitted(false); setSelectedAnswers({}); }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase shadow-md hover:bg-indigo-700 transition cursor-pointer mt-4"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}