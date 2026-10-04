'use client';
import React from 'react';

export default function NoticesCard() {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Important Notices</h3>
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Urgent</span>
          <p className="text-sm text-slate-200 font-medium">Staff meeting scheduled at 02:30 PM in the conference hall regarding upcoming exams.</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center">Updated 10 minutes ago</p>
    </div>
  );
}