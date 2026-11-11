// Filename: TeacherDashboard.jsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, PlusCircle, Send, BookOpen, Layers } from 'lucide-react';

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

    // वैलिडेट करें कि सभी प्रश्नों के टेक्स्ट भरे हुए हैं
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim() || !questions[i].option_a || !questions[i].option_b) {
        alert(`प्रश्न क्रमांक ${i + 1} के सभी आवश्यक फील्ड्स खाली हैं!`);
        return;
      }
    }

    setLoading(true);
    try {
      // 1. सबसे पहले 'quizzes' टेबल में मुख्य डेटा इंसर्ट करें
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

        // 2. सभी प्रश्नों को तैयार करें और 'quiz_questions' टेबल में इंसर्ट करें
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
        
        // फॉर्म रीसेट करें
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="text-indigo-600" size={24} /> Teacher Dashboard: Class & Subject Quiz Builder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            विशिष्ट कक्षा (Class) और विषय (Subject) के लिए ऑनलाइन टेस्ट या प्रश्न पत्र तैयार करें।
          </p>
        </div>

        {/* क्लास, सब्जेक्ट और सेशन सलेक्शन */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-600" /> Select Class
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 shadow-inner cursor-pointer"
            >
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-600" /> Select Subject
            </label>
            <select
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 shadow-inner cursor-pointer"
            >
              {subjectOptions.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
              Academic Session
            </label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 shadow-inner"
            />
          </div>
        </div>

        {/* क्विज़ का टाइटल */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
            Quiz / Test Title
          </label>
          <input
            type="text"
            placeholder="e.g., Chapter 1 Science Unit Test"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-indigo-600 shadow-inner"
          />
        </div>

        {/* प्रश्न जोड़ने का डायनामिक फॉर्म */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Questions List ({questions.length})</h3>
          </div>

          {questions.map((q, index) => (
            <div key={index} className="p-4 sm:p-5 border border-slate-200 rounded-2xl bg-slate-50/70 shadow-sm relative space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Question #{index + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestionField(index)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Enter question description..."
                value={q.question_text}
                onChange={(e) => {
                  const newQ = [...questions];
                  newQ[index].question_text = e.target.value;
                  setQuestions(newQ);
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white outline-none text-sm font-bold shadow-inner"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-500 w-6">({opt})</span>
                    <input
                      type="text"
                      placeholder={`Option ${opt}`}
                      value={q[`option_${opt.toLowerCase()}`]}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[index][`option_${opt.toLowerCase()}`] = e.target.value;
                        setQuestions(newQ);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none text-xs font-semibold shadow-inner"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-black text-slate-600 uppercase">Correct Option:</label>
                <select
                  value={q.correct_option}
                  onChange={(e) => {
                    const newQ = [...questions];
                    newQ[index].correct_option = e.target.value;
                    setQuestions(newQ);
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-black bg-white cursor-pointer"
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

        {/* बॉटम एक्शन बटंस */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
          <button
            onClick={addQuestionField}
            className="w-full sm:w-auto px-5 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-50 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} /> Add Another Question
          </button>
          
          <button
            onClick={handlePublish}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            {loading ? 'Publishing...' : 'Publish Test Paper'}
          </button>
        </div>
      </div>
    </div>
  );
}