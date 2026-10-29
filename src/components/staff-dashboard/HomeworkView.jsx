'use client';
import React, { useState } from 'react';

export default function HomeworkView() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Homework uploaded successfully!');
    setTitle('');
    setDesc('');
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Upload Daily Homework</h3>
        <p className="text-xs text-slate-400">Assign homework tasks and notes for your classes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Assignment Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chapter 4 Exercise Questions" 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Homework Details & Instructions</label>
          <textarea 
            rows="4"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Enter homework description..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            required
          ></textarea>
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white shadow-[0_4px_0_#5b21b6] active:shadow-none active:translate-y-1 transition-all">
          Publish Homework
        </button>
      </form>
    </div>
  );
}