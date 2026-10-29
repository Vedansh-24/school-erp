// Filename: CircularsAndNoticesManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bell, Calendar, Search, Plus, Paperclip, 
  Trash2, Edit, AlertCircle, FileText, X, CheckCircle, Download, Loader2
} from 'lucide-react';

export default function CircularsAndNoticesManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);

  // Form State for New Notice Modal
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'Academic',
    date: new Date().toISOString().split('T')[0],
    audience: 'All Students & Parents',
    priority: 'Medium',
    description: '',
    session: '2026-2027'
  });

  // Fetch Notices from Supabase Table 'circulars_and_notices'
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('circulars_and_notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setNotices(data.map(item => ({
          id: item.id,
          title: item.title,
          date: item.notice_date || item.created_at?.split('T')[0],
          category: item.category,
          audience: item.audience || 'All Students & Parents',
          description: item.description,
          priority: item.priority || 'Medium',
          hasAttachment: item.has_attachment || false,
          attachmentUrl: item.attachment_url || ''
        })));
      }
    } catch (err) {
      console.error('Error fetching notices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Handle Publish Notice Insert to Supabase
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.description) {
      alert('Kripya Title aur Description zaroor bharein!');
      return;
    }

    try {
      const { error } = await supabase
        .from('circulars_and_notices')
        .insert([{
          title: newNotice.title,
          description: newNotice.description,
          category: newNotice.category,
          notice_date: newNotice.date,
          audience: newNotice.audience,
          priority: newNotice.priority,
          session: newNotice.session,
          has_attachment: false
        }]);

      if (error) throw error;

      alert('Notice successfully publish ho gaya hai!');
      setIsModalOpen(false);
      setNewNotice({
        title: '',
        category: 'Academic',
        date: new Date().toISOString().split('T')[0],
        audience: 'All Students & Parents',
        priority: 'Medium',
        description: '',
        session: '2026-2027'
      });
      fetchNotices();
    } catch (err) {
      alert('Error publishing notice: ' + err.message);
    }
  };

  // Handle Delete Notice from Supabase
  const handleDelete = async (id) => {
    if (confirm('Kya aap is notice ko delete karna chahte hain?')) {
      try {
        const { error } = await supabase
          .from('circulars_and_notices')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setNotices(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        alert('Error deleting notice: ' + err.message);
      }
    }
  };

  const categories = ['All', 'Academic', 'Holiday', 'Fee & Dues', 'General'];

  // Alag-Alag Colors Ke 3D Gradient Styles Har Category Ke Liye
  const categoryStyles = {
    'All': {
      active: 'bg-gradient-to-r from-slate-800 via-slate-900 to-black text-white border-t border-slate-500 border-b-[5px] border-slate-950 shadow-lg active:translate-y-1 active:border-b-[1px] active:shadow-none',
      inactive: 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 text-slate-800 border-t border-white border-b-[5px] border-slate-400 hover:from-slate-200 hover:to-slate-300 active:translate-y-1 active:border-b-[1px] active:shadow-none shadow-sm'
    },
    'Academic': {
      active: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white border-t border-blue-300 border-b-[5px] border-blue-950 shadow-lg active:translate-y-1 active:border-b-[1px] active:shadow-none',
      inactive: 'bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-200 text-blue-950 border-t border-white border-b-[5px] border-blue-300 hover:from-blue-200 hover:to-indigo-200 active:translate-y-1 active:border-b-[1px] active:shadow-none shadow-sm'
    },
    'Holiday': {
      active: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-800 text-white border-t border-emerald-300 border-b-[5px] border-emerald-950 shadow-lg active:translate-y-1 active:border-b-[1px] active:shadow-none',
      inactive: 'bg-gradient-to-r from-emerald-100 via-teal-100 to-emerald-200 text-emerald-950 border-t border-white border-b-[5px] border-emerald-300 hover:from-emerald-200 hover:to-teal-200 active:translate-y-1 active:border-b-[1px] active:shadow-none shadow-sm'
    },
    'Fee & Dues': {
      active: 'bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white border-t border-amber-300 border-b-[5px] border-orange-950 shadow-lg active:translate-y-1 active:border-b-[1px] active:shadow-none',
      inactive: 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 text-amber-950 border-t border-white border-b-[5px] border-amber-300 hover:from-amber-200 hover:to-orange-200 active:translate-y-1 active:border-b-[1px] active:shadow-none shadow-sm'
    },
    'General': {
      active: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white border-t border-purple-300 border-b-[5px] border-purple-950 shadow-lg active:translate-y-1 active:border-b-[1px] active:shadow-none',
      inactive: 'bg-gradient-to-r from-purple-100 via-pink-100 to-purple-200 text-purple-950 border-t border-white border-b-[5px] border-purple-300 hover:from-purple-200 hover:to-pink-200 active:translate-y-1 active:border-b-[1px] active:shadow-none shadow-sm'
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const filteredNotices = notices.filter(notice => {
    const matchesFilter = activeFilter === 'All' || notice.category === activeFilter;
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          notice.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* 🚀 Header & Controls Section */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 text-white border border-indigo-400/30">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner p-3">
            <Bell className="text-white" size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">Circulars & Notices</h2>
            <p className="text-xs sm:text-sm font-semibold text-indigo-100/90 mt-0.5">Manage and publish official school announcements</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search circulars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 border border-white/30 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 🌊 3D Ubhra Hua & Dabne Wala Aasmani (Sky Blue) Gradient Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 hover:from-sky-300 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-150 border-t border-sky-200/80 border-b-[5px] border-blue-950 shadow-[0_0_20px_rgba(56,189,248,0.45)] active:translate-y-1 active:border-b-[1px] active:shadow-none whitespace-nowrap cursor-pointer transform hover:scale-[1.01]"
          >
            <Plus size={20} className="stroke-[3]" /> Publish New
          </button>
        </div>
      </div>

      {/* 🏷️ 3D Ubhre Hue Aur Dabne Wale Color Gradient Filters */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isSelected = activeFilter === cat;
          const style = categoryStyles[cat];

          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all duration-150 cursor-pointer ${
                isSelected ? style.active : style.inactive
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 📋 Notices Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${getPriorityColor(notice.priority)} flex items-center gap-1.5`}>
                      <AlertCircle size={14} />
                      {notice.priority} Priority
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(notice.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg active:scale-90 transition-transform cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {notice.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm font-medium line-clamp-2 mb-4">
                    {notice.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {notice.date ? new Date(notice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <div className="flex items-center gap-1.5 text-indigo-600">
                      <FileText size={14} />
                      {notice.category}
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-slate-400" />
                      {notice.audience}
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                {notice.hasAttachment && (
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Paperclip size={16} className="text-slate-400" />
                      <span>Attached Document</span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-t border-indigo-300 border-b-[3px] border-indigo-950 shadow-sm active:translate-y-0.5 active:border-b-[1px] transition-all cursor-pointer">
                      <Download size={14} /> Download
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
              <Bell size={48} className="mb-3 opacity-20" />
              <p className="text-lg font-bold">No circulars found</p>
              <p className="text-sm">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      )}

      {/* 🚀 Create New Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Plus className="text-indigo-600" /> Publish New Circular
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Notice Title</label>
                  <input 
                    type="text" 
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" 
                    placeholder="e.g., Winter Vacation Schedule" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Category</label>
                  <select 
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-sky-500 outline-none cursor-pointer"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Fee & Dues">Fee & Dues</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Date</label>
                  <input 
                    type="date" 
                    value={newNotice.date}
                    onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-sky-500 outline-none cursor-pointer" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Priority</label>
                  <select 
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-sky-500 outline-none cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Audience</label>
                  <input 
                    type="text" 
                    value={newNotice.audience}
                    onChange={(e) => setNewNotice({ ...newNotice, audience: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-sky-500 outline-none" 
                    placeholder="e.g., All Students & Parents" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Detailed Description</label>
                <textarea 
                  rows="4" 
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-sky-500 outline-none resize-none" 
                  placeholder="Type the circular details here..."
                ></textarea>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <Paperclip size={24} className="text-slate-400 group-hover:text-sky-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">Click to attach a file (PDF/Image)</p>
                <p className="text-xs text-slate-500">Max size: 5MB</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {/* Modal 3D Sky-Blue Gradient Publish Button */}
              <button 
                onClick={handlePublish}
                className="bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 hover:from-sky-300 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-black border-t border-sky-200 border-b-[4px] border-blue-950 shadow-md active:translate-y-1 active:border-b-[1px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}