'use client';

import React, { useState, useEffect } from 'react';
import { Layers, BookOpen, Plus, Trash2, Save, Loader2 } from 'lucide-react';

// Single source of truth: lib se supabase client import karein
import { supabase } from '@/lib/supabase';

export default function ClassSubjectMaster() {
  const [selectedClass, setSelectedClass] = useState('Seventh');
  const [selectedSession, setSelectedSession] = useState('2026-2027');
  const [isAdding, setIsAdding] = useState(true);
  const [newSubject, setNewSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const classList = [
    'PP.3+', 
    'PP.4+', 
    'PP.5+', 
    'First', 
    'Second', 
    'Third', 
    'Fourth', 
    'Fifth', 
    'Sixth', 
    'Seventh', 
    'Eighth', 
    'Ninth', 
    'Tenth', 
    'Eleventh (Arts)', 
    'Eleventh (Commerce)', 
    'Eleventh (Science)', 
    'Twelfth (Arts)', 
    'Twelfth (Commerce)', 
    'Twelfth (Science)'
  ];

  // Selected class ke subjects database se fetch karna
  useEffect(() => {
    fetchSubjects(selectedClass, selectedSession);
  }, [selectedClass, selectedSession]);

  const fetchSubjects = async (className, sessionVal) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select('*')
        .eq('class_name', className)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Naya Subject add karna
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const trimmedSubject = newSubject.trim();
    
    // Check duplicate locally
    if (subjects.some((item) => item.subject_name.toLowerCase() === trimmedSubject.toLowerCase())) {
      alert('Yeh subject is class me pehle se added hai!');
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .insert([
          { 
            class_name: selectedClass, 
            subject_name: trimmedSubject,
            session: selectedSession
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setSubjects([...subjects, data[0]]);
        setNewSubject('');
        alert('Subject successfully add ho gaya!');
      }
    } catch (error) {
      console.error('Error adding subject:', error.message);
      alert('Subject add karne me error आया: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Subject delete karna
  const handleDeleteSubject = async (id) => {
    if (!confirm('Kya aap is subject ko delete karna chahte hain?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('class_subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubjects(subjects.filter((item) => item.id !== id));
      alert('Subject successfully delete ho gaya!');
    } catch (error) {
      console.error('Error deleting subject:', error.message);
      alert('Subject delete karne me error आया: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 font-sans">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 bg-white p-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white shadow-sm shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1B3A6B]">
                Class-wise Subject Master
              </h2>
              <p className="text-xs font-medium text-gray-500">
                Manage subjects for each class dynamically in Supabase (`class_subjects` table).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider shadow-md">
              Active Class: {selectedClass}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Select Class
                </label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-800 font-bold text-sm rounded-md px-3 py-2 outline-none focus:border-[#1B3A6B]"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Session
                </label>
                <select 
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-800 font-bold text-sm rounded-md px-3 py-2 outline-none focus:border-[#1B3A6B]"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>

              <div className="flex items-end justify-end h-full">
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md text-xs uppercase tracking-wider"
                >
                  <Plus size={16} strokeWidth={3} /> Add Subject
                </button>
              </div>

            </div>
          </div>

          {/* Add Subject Form */}
          {isAdding && (
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wider mb-3">
                Add New Subject Entry
              </h3>
              <form onSubmit={handleAddSubject} className="flex flex-col md:flex-row gap-3 items-center">
                <input 
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter Subject Name (e.g. Mathematics, Science)..."
                  className="w-full md:flex-1 bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-[#1B3A6B]"
                  autoFocus
                />
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Subject'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewSubject('');
                    }}
                    className="flex-1 md:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#1B3A6B] px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-[#FFC107]" />
                Subjects List for: <span className="text-[#FFC107]">{selectedClass}</span>
              </h3>
            </div>

            <div className="overflow-x-auto w-full">
              {loading ? (
                <div className="p-10 text-center flex items-center justify-center gap-2 text-gray-500 font-bold">
                  <Loader2 size={20} className="animate-spin text-[#1B3A6B]" /> Database se subjects load ho rahe hain...
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                      <th className="p-3.5">Subject Name</th>
                      <th className="p-3.5">Session</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subjects.length > 0 ? (
                      subjects.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3.5 font-bold text-sm text-gray-800">
                            {item.subject_name}
                          </td>
                          <td className="p-3.5 text-xs text-gray-500 font-semibold">
                            {item.session || selectedSession}
                          </td>
                          <td className="p-3.5 text-right">
                            <button 
                              onClick={() => handleDeleteSubject(item.id)}
                              disabled={actionLoading}
                              className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 shadow-sm text-xs uppercase tracking-wider disabled:opacity-50"
                            >
                              <Trash2 size={13} strokeWidth={2.5} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-10 text-center text-sm font-medium text-gray-400">
                          {selectedClass} ke liye koi subject nahi mila. Naya subject add karein.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="pt-2">
            <div className="w-full bg-blue-900 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-md text-sm">
              <Save size={18} className="text-[#FFC107]" /> Total Subjects in {selectedClass}: {subjects.length}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}