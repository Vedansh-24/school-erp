'use client';
import React, { useState } from 'react';

export default function AttendanceView() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const students = [
    { id: 1, roll: 101, name: 'Aarav Sharma', status: 'Present' },
    { id: 2, roll: 102, name: 'Priya Verma', status: 'Present' },
    { id: 3, roll: 103, name: 'Rahul Saini', status: 'Absent' },
    { id: 4, roll: 104, name: 'Ananya Gupta', status: 'Present' },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Mark Class Attendance</h3>
          <p className="text-xs text-slate-400">Select class and update student attendance status.</p>
        </div>
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="10-A">Class 10-A</option>
          <option value="10-B">Class 10-B</option>
          <option value="9-A">Class 9-A</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="py-3 px-4">Roll No</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-white">{student.roll}</td>
                <td className="py-3 px-4 text-slate-200">{student.name}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    student.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md">
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 transition-all">
        Save Attendance Record
      </button>
    </div>
  );
}