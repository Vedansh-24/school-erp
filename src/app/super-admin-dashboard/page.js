'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, Building2, ShieldCheck, Settings, CreditCard, 
  Database, Bell, Search, User, Menu, CheckCircle2, XCircle, Clock, FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // 👈 Supabase Import

// Imported Separate Components (Old structure preserved)
import GlobalWorkspace from '@/components/super-admin/GlobalWorkspace';
import BranchManager from '@/components/super-admin/BranchManager';
import AccessControl from '@/components/super-admin/AccessControl';
import SystemConfig from '@/components/super-admin/SystemConfig';
import SaaSBilling from '@/components/super-admin/SaaSBilling';
import SecurityBackup from '@/components/super-admin/SecurityBackup';

// Menu Items Array (Added Question Approvals)
const menuItems = [
  { id: 'workspace', name: 'Global Workspace', icon: Globe, boxColor: '#EC1E79', iconColor: '#ffffff' },
  { id: 'branch', name: 'Branch Manager', icon: Building2, boxColor: '#FFD400', iconColor: '#1A2332' },
  { id: 'access', name: 'Access Control', icon: ShieldCheck, boxColor: '#00AEEF', iconColor: '#ffffff' },
  { id: 'config', name: 'System Config', icon: Settings, boxColor: '#FFD400', iconColor: '#1A2332' },
  { id: 'billing', name: 'SaaS Billing', icon: CreditCard, boxColor: '#ED1C24', iconColor: '#ffffff' },
  { id: 'security', name: 'Security & Backup', icon: Database, boxColor: '#EC1E79', iconColor: '#ffffff' },
  { id: 'question-approvals', name: 'Question Approvals', icon: FileText, boxColor: '#8B5CF6', iconColor: '#ffffff' },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 🏫 Pending Approvals State Logic
  const [pendingSchools, setPendingSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Pending Registration Requests from Supabase
  const fetchPendingSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingSchools(data || []);
    } catch (err) {
      console.error('Error fetching pending schools:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSchools();
  }, []);

  // 2. Status Approval Handler (Approve / Reject)
  const handleStatusChange = async (schoolId, newStatus, schoolName) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ status: newStatus })
        .eq('id', schoolId);

      if (error) throw error;

      alert(`School "${schoolName}" has been successfully ${newStatus}!`);
      fetchPendingSchools(); // Refresh list
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Render Content Based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'workspace':
        return (
          <div className="space-y-6">
            {/* 👑 School Approval Workflow Section */}
            <div className="bg-white rounded-2xl p-6 border border-[#CBD5E1] shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EC1E79] flex items-center justify-center text-white font-bold shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#1B3A6B]">
                      Pending School Registration Requests
                    </h2>
                    <p className="text-xs text-slate-500 font-bold">
                      Approve or Reject new institution onboarding applications
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* 👇 Refresh Button Added */}
                  <button
                    onClick={fetchPendingSchools}
                    className="px-3 py-1.5 bg-[#00AEEF] hover:bg-[#0096ce] text-white text-xs font-black rounded-lg shadow transition flex items-center gap-1"
                  >
                    🔄 Refresh
                  </button>
                  <span className="bg-[#FFD400]/20 text-[#1A2332] text-xs font-extrabold px-3 py-1 rounded-full border border-[#FFD400]">
                    {pendingSchools.length} Pending Requests
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs font-bold text-slate-500">
                  Fetching pending requests from database...
                </div>
              ) : pendingSchools.length === 0 ? (
                <div className="py-6 bg-[#F5F7FA] rounded-xl text-center border border-dashed border-slate-300">
                  <p className="text-xs font-bold text-slate-500">
                    🎉 No pending registration requests right now! All caught up.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingSchools.map((school) => (
                    <div 
                      key={school.id}
                      className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-[#00AEEF] transition-all shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {school.logo_url ? (
                            <img src={school.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#1B3A6B] text-white font-black flex items-center justify-center text-sm shadow-sm">
                              🏫
                            </div>
                          )}
                          <div className="truncate">
                            <h3 className="font-extrabold text-sm text-[#1A2332] truncate">
                              {school.school_name}
                            </h3>
                            <p className="text-[11px] font-bold text-[#EC1E79]">
                              Code: {school.school_code}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-slate-600 space-y-1 bg-[#F5F7FA] p-2.5 rounded-lg border border-slate-200/60">
                          <p className="truncate">📍 <b>Address:</b> {school.address || 'N/A'}</p>
                          <p>📞 <b>Phone:</b> {school.phone || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Approval Action Buttons */}
                      <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleStatusChange(school.id, 'approved', school.school_name)}
                          className="flex-1 py-2 px-2 rounded-lg bg-[#00AEEF] hover:bg-[#0096ce] text-white text-[11px] font-black uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(school.id, 'rejected', school.school_name)}
                          className="flex-1 py-2 px-2 rounded-lg bg-[#ED1C24] hover:bg-[#c9151c] text-white text-[11px] font-black uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Original Global Workspace Component */}
            <GlobalWorkspace />
          </div>
        );
      case 'branch':
        return <BranchManager />;
      case 'access':
        return <AccessControl />;
      case 'config':
        return <SystemConfig />;
      case 'billing':
        return <SaaSBilling />;
      case 'security':
        return <SecurityBackup />;
      case 'question-approvals':
        return <QuestionApprovalsManager />;
      default:
        return <GlobalWorkspace />;
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans relative overflow-hidden bg-[#F5F7FA] text-[#1A2332]">
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col z-10 bg-[#1B3A6B] border-r border-[#2F6690]/40 shadow-md`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2F6690]/40">
          {isSidebarOpen && (
            <span className="font-black text-xl tracking-wider text-white drop-shadow-sm">
              SaaS<span className="text-[#C6952C]">ERP</span>
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-[#2F6690]/40 rounded-lg text-white transition">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 font-bold ${
                activeTab === item.id 
                  ? 'bg-[#2F6690] text-white font-black shadow-md border-l-4 border-[#C6952C]' 
                  : 'hover:bg-[#2F6690]/40 text-slate-200 hover:text-white'
              }`}
            >
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm shrink-0 transition-transform hover:scale-105"
                style={{ backgroundColor: item.boxColor }}
              >
                <item.icon size={20} style={{ color: item.iconColor }} className="drop-shadow-sm" />
              </div>
              {isSidebarOpen && <span className="ml-3 text-sm truncate">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile Snippet */}
        <div className="p-4 border-t border-[#2F6690]/40 flex items-center bg-[#1B3A6B]">
          <div 
            className="w-9 h-9 rounded-lg shadow-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#ED1C24' }}
          >
            <User size={18} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div className="ml-3 truncate">
              <p className="text-sm font-black text-white">Super Admin</p>
              <p className="text-xs text-slate-300 font-bold">System Owner</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden z-10 bg-[#F5F7FA]">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 z-10 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-sm">
          <div className="flex items-center bg-[#F5F7FA] border border-[#CBD5E1] shadow-inner px-3 py-2 rounded-xl w-96">
            <Search size={18} className="text-[#5C6B7A]" />
            <input 
              type="text" 
              placeholder="Search branches, users, or settings..." 
              className="bg-transparent border-none outline-none ml-2 w-full text-sm font-semibold text-[#1A2332] placeholder-[#5C6B7A]"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-[#1B3A6B] hover:bg-[#F5F7FA] rounded-full transition">
              <Bell size={20} />
              {pendingSchools.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EC1E79] rounded-full border-2 border-white animate-ping"></span>
              )}
            </button>
            <div className="h-9 w-9 rounded-lg bg-[#EC1E79] text-white font-bold flex items-center justify-center shadow-md border-2 border-white">
              SA
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-6 bg-[#F5F7FA]">
          {renderContent()}
        </div>

      </main>
    </div>
  );
}

// --- Question Approvals Manager Component with 5 Advanced Filters ---
const QuestionApprovalsManager = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedBook, setSelectedBook] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const fetchPendingQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;
      setAllQuestions(data || []);
      setFilteredQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err.message);
      setAllQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQuestions();
  }, []);

  // Extract unique options dynamically for dropdowns from pending data
  const classList = [...new Set(allQuestions.map(q => q.class || q.class_name).filter(Boolean))];
  const subjectList = [...new Set(allQuestions.map(q => q.subject || q.subject_name).filter(Boolean))];
  const bookList = [...new Set(allQuestions.map(q => q.book || q.book_name).filter(Boolean))];
  const chapterList = [...new Set(allQuestions.map(q => q.chapter || q.chapter_name).filter(Boolean))];
  const typeList = [...new Set(allQuestions.map(q => q.question_type || q.type).filter(Boolean))];

  // Filter logic based on 5 selected parameters
  useEffect(() => {
    let result = [...allQuestions];

    if (selectedClass !== 'all') {
      result = result.filter(q => (q.class || q.class_name) === selectedClass);
    }
    if (selectedSubject !== 'all') {
      result = result.filter(q => (q.subject || q.subject_name) === selectedSubject);
    }
    if (selectedBook !== 'all') {
      result = result.filter(q => (q.book || q.book_name) === selectedBook);
    }
    if (selectedChapter !== 'all') {
      result = result.filter(q => (q.chapter || q.chapter_name) === selectedChapter);
    }
    if (selectedType !== 'all') {
      result = result.filter(q => (q.question_type || q.type) === selectedType);
    }

    setFilteredQuestions(result);
  }, [selectedClass, selectedSubject, selectedBook, selectedChapter, selectedType, allQuestions]);

  const handleAction = async (id, status) => {
    try {
      const { error } = await supabase
        .from('question_bank')
        .update({ status: status })
        .eq('id', id);

      if (error) throw error;
      const updated = allQuestions.filter(q => q.id !== id);
      setAllQuestions(updated);
    } catch (err) {
      alert('Error updating question status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#CBD5E1] shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1B3A6B]">Question Bank Approvals</h2>
              <p className="text-xs text-slate-500 font-bold">Review and approve or filter questions submitted by schools.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPendingQuestions}
              className="px-3 py-1.5 bg-[#00AEEF] hover:bg-[#0096ce] text-white text-xs font-black rounded-lg shadow transition flex items-center gap-1"
            >
              🔄 Refresh
            </button>
            <span className="bg-[#FFD400]/20 text-[#1A2332] text-xs font-extrabold px-3 py-1 rounded-full border border-[#FFD400]">
              {filteredQuestions.length} Pending Records Found
            </span>
          </div>
        </div>

        {/* 🔍 5 Advanced Filter Dropdowns Section (Class, Subject, Book, Chapter, Type) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#F5F7FA] p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-black text-[#1B3A6B] mb-1">Filter by Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#1A2332] outline-none focus:border-[#00AEEF]"
            >
              <option value="all">All Classes</option>
              {classList.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-black text-[#1B3A6B] mb-1">Filter by Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#1A2332] outline-none focus:border-[#00AEEF]"
            >
              <option value="all">All Subjects</option>
              {subjectList.map((sub, idx) => (
                <option key={idx} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Book Filter */}
          <div>
            <label className="block text-[11px] font-black text-[#1B3A6B] mb-1">Filter by Book</label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#1A2332] outline-none focus:border-[#00AEEF]"
            >
              <option value="all">All Books</option>
              {bookList.map((bk, idx) => (
                <option key={idx} value={bk}>{bk}</option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <label className="block text-[11px] font-black text-[#1B3A6B] mb-1">Filter by Chapter</label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#1A2332] outline-none focus:border-[#00AEEF]"
            >
              <option value="all">All Chapters</option>
              {chapterList.map((ch, idx) => (
                <option key={idx} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          {/* Question Type Filter */}
          <div>
            <label className="block text-[11px] font-black text-[#1B3A6B] mb-1">Filter by Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#1A2332] outline-none focus:border-[#00AEEF]"
            >
              <option value="all">All Question Types</option>
              {typeList.map((tp, idx) => (
                <option key={idx} value={tp}>{tp}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-8 font-bold text-slate-500 text-xs">Loading pending questions...</p>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-6 bg-[#F5F7FA] rounded-xl text-center border border-dashed border-slate-300">
            <p className="text-xs font-bold text-slate-500">🎉 No pending questions found matching this filter criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuestions.map((q) => (
              <div key={q.id} className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-[#00AEEF] transition-all shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md uppercase inline-block">
                      {q.subject || q.subject_name || 'General'} • {q.class || q.class_name || 'N/A'}
                    </span>
                    {(q.book || q.book_name) && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase inline-block">
                        {q.book || q.book_name}
                      </span>
                    )}
                    {(q.chapter || q.chapter_name) && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md uppercase inline-block">
                        {q.chapter || q.chapter_name}
                      </span>
                    )}
                    {(q.question_type || q.type) && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md uppercase inline-block">
                        {q.question_type || q.type}
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-[#1A2332] mt-2">{q.question_text || q.text}</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">Submitted by: {q.school_name || 'Unknown School'}</p>
                </div>
                <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100">
                  <button 
                    onClick={() => handleAction(q.id, 'approved')}
                    className="flex-1 py-2 px-2 rounded-lg bg-[#00AEEF] hover:bg-[#0096ce] text-white text-[11px] font-black uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleAction(q.id, 'rejected')}
                    className="flex-1 py-2 px-2 rounded-lg bg-[#ED1C24] hover:bg-[#c9151c] text-white text-[11px] font-black uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};