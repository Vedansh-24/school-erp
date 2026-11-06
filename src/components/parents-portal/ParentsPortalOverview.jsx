'use client';
import { useState } from 'react';

export default function StudentQuiz() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Mock quiz data loaded from backend/Supabase
  const quizData = {
    title: "General Science & Math Test",
    questions: [
      { id: 1, question_text: "What is the capital of India?", option_a: "Mumbai", option_b: "New Delhi", option_c: "Jaipur", option_d: "Kolkata", correct_option: "B" },
      { id: 2, question_text: "2 + 2 equals to?", option_a: "3", option_b: "4", option_c: "5", option_d: "22", correct_option: "B" }
    ]
  };

  const handleSelectOption = (qIndex, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: option });
  };

  const handleSubmitQuiz = () => {
    let currentScore = 0;
    quizData.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_option) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
    // Supabase submission save logic can be added here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">{quizData.title}</h2>
        <p className="text-sm text-slate-500 mb-6">Answer all questions and submit to get instant automated results.</p>

        {!submitted ? (
          <div>
            {quizData.questions.map((q, qIndex) => (
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
            <div className="text-5xl font-extrabold text-indigo-600 mb-2">{score} / {quizData.questions.length}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Quiz Submitted Successfully!</h3>
            <p className="text-sm text-slate-500 mb-6">Your score has been automatically evaluated.</p>
            <button
              onClick={() => { setSubmitted(false); setSelectedAnswers({}); }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}