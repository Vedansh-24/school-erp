'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 1. Router इम्पोर्ट करें
import { Plus, Edit2, LogIn, MoreVertical, Building, X, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BranchManager() {
  const router = useRouter(); // 2. Router हुक का उपयोग करें

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Dropdown States for Buttons
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Edit Form States
  const [editName, setEditName] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [editPlan, setEditPlan] = useState('');

  // Fetch Branches from Supabase
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .select('*');

      if (error) throw error;

      const formattedBranches = (data || []).map((item) => ({
        dbId: item.id,
        id: item.school_code || item.id,
        name: item.school_name || item.name,
        domain: item.domain || `${(item.school_code || item.name || 'school').toLowerCase().replace(/[^a-z0-9]/g, '')}.saaserp.com`,
        plan: item.plan || 'Enterprise',
        users: item.users || 350,
        status: item.status || 'Active'
      }));

      setBranches(formattedBranches);
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // --- 1. Login as Branch Admin (Impersonation Logic & Redirect) ---
  const handleLoginAsAdmin = (branch) => {
    // स्कूल का डेटा ब्राउज़र के localStorage में स्टोर करें
    localStorage.setItem('activeSchool', JSON.stringify(branch));
    localStorage.setItem('school_code', branch.id);
    
    // सफलता का छोटा मैसेज या सीधे रीडायरेक्ट
    console.log(`Switching to school: ${branch.name}`);
    
    // स्कूल डैशबोर्ड के रूट पर रीडायरेक्ट करें (अपने फोल्डर स्ट्रक्चर के हिसाब से पाथ एडजस्ट कर सकते हैं)
    router.push('/school-dashboard'); 
  };

  // --- 2. Edit Branch Handlers ---
  const handleOpenEdit = (branch) => {
    setCurrentBranch(branch);
    setEditName(branch.name);
    setEditDomain(branch.domain);
    setEditPlan(branch.plan);
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!currentBranch) return;

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          school_name: editName,
          domain: editDomain,
          plan: editPlan
        })
        .eq('id', currentBranch.dbId);

      if (error) throw error;

      alert('Branch updated successfully!');
      setIsEditModalOpen(false);
      fetchBranches();
    } catch (err) {
      console.error('Error updating branch:', err);
      alert('Failed to update branch.');
    }
  };

  // --- 3. More Actions Handlers (Status Change & Delete) ---
  const handleStatusChange = async (branch, newStatus) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ status: newStatus })
        .eq('id', branch.dbId);

      if (error) throw error;

      alert(`Branch status changed to ${newStatus}`);
      setActiveDropdown(null);
      fetchBranches();
    } catch (err) {
      console.error('Error changing status:', err);
      alert('Failed to change status.');
    }
  };

  const handleDeleteBranch = async (branch) => {
    if (!confirm(`Are you sure you want to delete ${branch.name}?`)) return;
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', branch.dbId);

      if (error) throw error;

      alert('Branch deleted successfully!');
      setActiveDropdown(null);
      fetchBranches();
    } catch (err) {
      console.error('Error deleting branch:', err);
      alert('Failed to delete branch.');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B3A6B] uppercase tracking-wide">Branch Manager</h1>
          <p className="text-sm font-semibold text-[#5C6B7A] mt-1">Manage all connected school branches, franchises, and their status.</p>
        </div>
        
        <button className="bg-[#00AEEF] text-white text-xs font-bold px-5 py-2.5 rounded-lg border-b-4 border-[#0077a3] active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center gap-2 uppercase tracking-wide w-fit">
          <Plus size={16} strokeWidth={3} /> Add New Branch
        </button>
      </div>

      <div className="rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FA]/50 flex items-center justify-between">
          <h3 className="font-black text-sm text-[#1B3A6B] tracking-wide uppercase flex items-center gap-2">
            <Building size={18} className="text-[#EC1E79]" /> Branch Directory
          </h3>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-[#5C6B7A] bg-white px-3 py-1.5 rounded border border-[#E2E8F0] shadow-sm">
              Total: {branches.length} Branches
            </span>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-sm font-bold text-[#5C6B7A]">Loading branches from database...</div>
          ) : branches.length === 0 ? (
            <div className="p-8 text-center text-sm font-bold text-[#5C6B7A]">No branches found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white text-[#1B3A6B] border-b border-[#E2E8F0] uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-4 px-5">Branch Code & Name</th>
                  <th className="py-4 px-5">Subdomain / URL</th>
                  <th className="py-4 px-5">SaaS Plan</th>
                  <th className="py-4 px-5">Users</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1A2332]">
                {branches.map((branch) => (
                  <tr key={branch.dbId || branch.id} className="hover:bg-[#F5F7FA] transition-colors group relative">
                    <td className="py-4 px-5">
                      <p className="font-black text-[#1B3A6B] text-sm">{branch.name}</p>
                      <p className="text-[10px] font-bold text-[#5C6B7A] uppercase mt-0.5">{branch.id}</p>
                    </td>
                    <td className="py-4 px-5 font-semibold text-[#00AEEF] cursor-pointer hover:underline">
                      {branch.domain}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 bg-[#1B3A6B]/10 text-[#1B3A6B] rounded text-[10px] font-black uppercase">
                        {branch.plan}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#5C6B7A]">
                      {branch.users.toLocaleString()}
                    </td>
                    <td className="py-4 px-5">
                      {branch.status === 'Active' && <span className="px-2.5 py-1 bg-[#00A99D]/15 text-[#00A99D] border border-[#00A99D]/30 rounded text-[10px] font-bold uppercase shadow-sm">Active</span>}
                      {branch.status === 'Pending' && <span className="px-2.5 py-1 bg-[#FFD400]/20 text-[#D49000] border border-[#FFD400]/50 rounded text-[10px] font-bold uppercase shadow-sm">Pending</span>}
                      {branch.status === 'Suspended' && <span className="px-2.5 py-1 bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/30 rounded text-[10px] font-bold uppercase shadow-sm">Suspended</span>}
                    </td>
                    
                    {/* Action Buttons */}
                    <td className="py-4 px-5 text-right flex items-center justify-end gap-2 relative">
                      {/* 1. Login as Admin Button */}
                      <button 
                        onClick={() => handleLoginAsAdmin(branch)}
                        title="Login as Branch Admin" 
                        className="bg-[#FFD400] text-[#1A2332] p-2 rounded border-b-[3px] border-[#dca600] active:border-b-0 active:translate-y-[3px] transition-all shadow-sm cursor-pointer"
                      >
                        <LogIn size={14} strokeWidth={3} />
                      </button>

                      {/* 2. Edit Config Button */}
                      <button 
                        onClick={() => handleOpenEdit(branch)}
                        title="Edit Branch Config" 
                        className="bg-[#E2E8F0] text-[#1B3A6B] p-2 rounded border-b-[3px] border-[#CBD5E1] active:border-b-0 active:translate-y-[3px] transition-all shadow-sm hover:bg-[#CBD5E1] cursor-pointer"
                      >
                        <Edit2 size={14} strokeWidth={3} />
                      </button>

                      {/* 3. More Options Dropdown Button */}
                      <div className="relative">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === branch.dbId ? null : branch.dbId)}
                          className="p-2 text-[#5C6B7A] hover:bg-[#E2E8F0] rounded transition cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === branch.dbId && (
                          <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E2E8F0] rounded-lg shadow-xl z-50 py-1 text-left font-bold">
                            <button 
                              onClick={() => handleStatusChange(branch, branch.status === 'Suspended' ? 'Active' : 'Suspended')}
                              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                            >
                              <ShieldAlert size={14} className="text-amber-500" />
                              {branch.status === 'Suspended' ? 'Activate Branch' : 'Suspend Branch'}
                            </button>
                            <button 
                              onClick={() => handleDeleteBranch(branch)}
                              className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                            >
                              <Trash2 size={14} /> Delete Branch
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- Edit Modal Pop-up --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-[#1B3A6B] text-white flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide">Edit Branch Configuration</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-[#1B3A6B] uppercase mb-1">School / Branch Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#1B3A6B] uppercase mb-1">Subdomain / URL</label>
                <input 
                  type="text" 
                  value={editDomain} 
                  onChange={(e) => setEditDomain(e.target.value)} 
                  required
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#1B3A6B] uppercase mb-1">SaaS Plan</label>
                <select 
                  value={editPlan} 
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#00AEEF]"
                >
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#00AEEF] text-white rounded-lg hover:bg-[#008cc2] transition shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}