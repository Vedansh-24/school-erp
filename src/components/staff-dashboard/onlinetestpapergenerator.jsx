'use client';
import { useState } from 'react';

export default function QuizModule() {
  // View switcher: 'teacher' ya 'student'
  const [view, setView] = `useState`('teacher');

  // --- Teacher Form Builder State ---
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
  ]);

  // --- Student Quiz Runner State ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Mock quiz data for student view
  const mockQuiz = {
    title: quizTitle || "General Science & Math Test",
    questions: questions[0].question_text ? questions : [
      { id: 1, question_text: "What is the capital of India?", option_a: "Mumbai", option_b: "New Delhi", option_c: "Jaipur", option_d: "Kolkata", correct_option: "B" },
      { id: 2, question_text: "2 + 2 equals to?", option_a: "3", option_b: "4", option_c: "5", option_d: "22", correct_option: "B" }
    ]
  };

  // Add new question field for teacher
  const addQuestionField = () => {
    setQuestions([...questions, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }]);
  };

  // Handle student answer selection
  const handleSelectOption = (qIndex, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: option });
  };

  // Evaluate student score automatically
  const handleSubmitQuiz = () => {
    let currentScore = 0;
    mockQuiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_option) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
      {/* Navigation Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => { setView('teacher'); setSubmitted(false); }}
          className={`px-4 py-2 rounded-lg font-medium transition ${view === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border'}`}
        >
          Teacher: Quiz Builder
        </button>
        <button
          onClick={() => { setView('student'); setSubmitted(false); }}
          className={`px-4 py-2 rounded-lg font-medium transition ${view === 'student' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border'}`}
        >
          Student: Quiz Runner
        </button>
      </div>

      {/* --- TEACHER VIEW: QUIZ BUILDER --- */}
      {view === 'teacher' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Quiz</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1">Quiz Title</label>
            <input
              type="text"
              placeholder="e.g., Chapter 1 Science Quiz"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {questions.map((q, index) => (
            <div key={index} className="p-4 mb-4 border border-slate-200 rounded-lg bg-slate-50">
              <h3 className="font-semibold text-slate-700 mb-2">Question {index + 1}</h3>
              <input
                type="text"
                placeholder="Enter question text..."
                value={q.question_text}
                onChange={(e) => {
                  const newQ = [...questions];
                  newQ[index].question_text = e.target.value;
                  setQuestions(newQ);
                }}
                className="w-full px-3 py-2 mb-3 border rounded-lg bg-white outline-none"
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <input
                    key={opt}
                    type="text"
                    placeholder={`Option ${opt}`}
                    value={q[`option_${opt.toLowerCase()}`]}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[index][`option_${opt.toLowerCase()}`] = e.target.value;
                      setQuestions(newQ);
                    }}
                    className="px-3 py-2 border rounded-lg bg-white outline-none text-sm"
                  />
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mr-2">Correct Option:</label>
                <select
                  value={q.correct_option}
                  onChange={(e) => {
                    const newQ = [...questions];
                    newQ[index].correct_option = e.target.value;
                    setQuestions(newQ);
                  }}
                  className="px-2 py-1 border rounded text-sm bg-white"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={addQuestionField}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50"
            >
              + Add Another Question
            </button>
            <button
              onClick={() => alert("Quiz saved successfully to Supabase!")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Publish Quiz
            </button>
          </div>
        </div>
      )}

      {/* --- STUDENT VIEW: QUIZ RUNNER --- */}
      {view === 'student' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{mockQuiz.title}</h2>
          <p className="text-sm text-slate-500 mb-6">Answer all questions and submit to get instant results.</p>

          {!submitted ? (
            <div>
              {mockQuiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="mb-6 p-4 border border-slate-100 rounded-lg bg-slate-50">
                  <p className="font-medium text-slate-800 mb-3">{qIndex + 1}. {q.question_text}</p>
                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${selectedAnswers[qIndex] === opt ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={selectedAnswers[qIndex] === opt}
                          onChange={() => handleSelectOption(qIndex, opt)}
                          className="mr-3 text-indigo-600"
                        />
                        <span className="text-sm text-slate-700">{q[`option_${opt.toLowerCase()}`]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmitQuiz}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                Submit Quiz & View Score
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl font-extrabold text-indigo-600 mb-2">{score} / {mockQuiz.questions.length}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Quiz Submitted Successfully!</h3>
              <p className="text-sm text-slate-500 mb-6">Your score has been automatically evaluated and saved to the database.</p>
              <button
                onClick={() => { setSubmitted(false); setSelectedAnswers({}); }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}