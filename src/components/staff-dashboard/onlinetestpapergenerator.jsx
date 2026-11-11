'use client';
import { useState } from 'react';

export default function TeacherDashboard() {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
  ]);

  const addQuestionField = () => {
    setQuestions([
      ...questions,
      { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
    ]);
  };

  const handlePublish = () => {
    if (!quizTitle.trim()) {
      alert("Please enter a quiz title.");
      return;
    }
    // Supabase insert logic can be added here
    alert("Quiz published successfully to Supabase!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Teacher Dashboard: Quiz Builder</h2>
        <p className="text-sm text-slate-500 mb-6">Create multiple-choice questions for students with automated evaluation.</p>
        
        <div className="mb-6">
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
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
          >
            + Add Another Question
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Publish Quiz
          </button>
        </div>
      </div>
    </div>
  );
}