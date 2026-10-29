'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Lock, Plus, Edit2, Trash2, Key, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AccessControl() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);

  const [roleName, setRoleName] = useState('');
  const [roleUsers, setRoleUsers] = useState('');
  const [rolePermissions, setRolePermissions] = useState('');
  const [roleStatus, setRoleStatus] = useState('Active');

  // Fetch Roles from Supabase
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_roles')
        .select('*');

      if (error) {
        // Fallback default roles if table doesn't exist yet
        console.warn('Using default roles due to database table state.');
        setRoles([
          { id: 'ROLE-01', name: 'Super Admin', users: 3, permissions: 'Full System Access', status: 'System Default' },
          { id: 'ROLE-02', name: 'Branch Admin', users: 124, permissions: 'Branch Level Full Access', status: 'Active' },
          { id: 'ROLE-03', name: 'Accountant / Billing', users: 45, permissions: 'Fee Management & Invoicing Only', status: 'Active' },
          { id: 'ROLE-04', name: 'Academic Director', users: 89, permissions: 'Exams, Attendance & Student Data', status: 'Active' },
          { id: 'ROLE-05', name: 'Support Manager', users: 12, permissions: 'Read-only & Ticket Resolution', status: 'Custom' },
        ]);
      } else if (!data || data.length === 0) {
        setRoles([]);
      } else {
        setRoles(data.map(item => ({
          dbId: item.id,
          id: item.role_id || `ROLE-0${item.id}`,
          name: item.name,
          users: item.users || 0,
          permissions: item.permissions || '',
          status: item.status || 'Active'
        })));
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setIsEditing(false);
    setRoleName('');
    setRoleUsers('');
    setRolePermissions('');
    setRoleStatus('Active');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (role) => {
    setIsEditing(true);
    setCurrentRoleId(role.dbId || role.id);
    setRoleName(role.name);
    setRoleUsers(role.users);
    setRolePermissions(role.permissions);
    setRoleStatus(role.status);
    setIsModalOpen(true);
  };

  // Submit Form (Create / Update)
  const handleSubmitRole = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('system_roles')
          .update({
            name: roleName,
            users: Number(roleUsers) || 0,
            permissions: rolePermissions,
            status: roleStatus
          })
          .eq('id', currentRoleId);

        if (error) throw error;
        alert('Role updated successfully!');
      } else {
        const newRoleId = `ROLE-0${roles.length + 1}`;
        const { error } = await supabase
          .from('system_roles')
          .insert([
            {
              role_id: newRoleId,
              name: roleName,
              users: Number(roleUsers) || 0,
              permissions: rolePermissions,
              status: roleStatus
            }
          ]);

        if (error) throw error;
        alert('New role created successfully!');
      }

      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      console.error('Error saving role:', err);
      alert('Failed to save role. Please check if "system_roles" table exists in Supabase.');
    }
  };

  // Delete Role
  const handleDeleteRole = async (role) => {
    if (role.status === 'System Default') {
      alert('System Default roles cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete role: ${role.name}?`)) return;

    try {
      const { error } = await supabase
        .from('system_roles')
        .delete()
        .eq('id', role.dbId);

      if (error) throw error;
      alert('Role deleted successfully!');
      fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Failed to delete role.');
    }
  };

  // Calculations for Stat Cards
  const totalRolesCount = roles.length;
  const totalActiveUsers = roles.reduce((acc, role) => acc + (Number(role.users) || 0), 0);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B3A6B] uppercase tracking-wide">Role & Access Control</h1>
          <p className="text-sm font-semibold text-[#5C6B7A] mt-1">Manage RBAC permissions and administrative roles across the SaaS network.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#00AEEF] text-white text-xs font-bold px-5 py-2.5 rounded-lg border-b-4 border-[#0077a3] active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center gap-2 uppercase tracking-wide w-fit cursor-pointer"
        >
          <Plus size={16} strokeWidth={3} /> Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] border-t-4 border-t-[#1B3A6B] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">Total System Roles</p>
            <h2 className="text-2xl font-black text-[#1A2332] mt-1">{totalRolesCount} Roles</h2>
          </div>
          <div className="p-3 rounded-xl bg-[#00AEEF] text-white shadow-md">
            <ShieldCheck size={22} />
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] border-t-4 border-t-[#2E7D4F] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">Active Admin Users</p>
            <h2 className="text-2xl font-black text-[#1A2332] mt-1">{totalActiveUsers} Users</h2>
          </div>
          <div className="p-3 rounded-xl bg-[#00A99D] text-white shadow-md">
            <UserCheck size={22} />
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] border-t-4 border-t-[#C6952C] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">Permission Modules</p>
            <h2 className="text-2xl font-black text-[#1A2332] mt-1">16 Modules</h2>
          </div>
          <div className="p-3 rounded-xl bg-[#FFD400] text-[#1A2332] shadow-md">
            <Key size={22} />
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FA]/50 flex items-center justify-between">
          <h3 className="font-black text-sm text-[#1B3A6B] tracking-wide uppercase flex items-center gap-2">
            <Lock size={18} className="text-[#EC1E79]" /> Defined Roles & Privileges
          </h3>
        </div>

        <div className="overflow-x-auto min-h-[250px]">
          {loading ? (
            <div className="p-8 text-center text-sm font-bold text-[#5C6B7A]">Loading roles from database...</div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center text-sm font-bold text-[#5C6B7A]">No roles found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white text-[#1B3A6B] border-b border-[#E2E8F0] uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-4 px-5">Role ID & Title</th>
                  <th className="py-4 px-5">Assigned Users</th>
                  <th className="py-4 px-5">Permission Scope</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1A2332]">
                {roles.map((role) => (
                  <tr key={role.dbId || role.id} className="hover:bg-[#F5F7FA] transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-black text-[#1B3A6B] text-sm">{role.name}</p>
                      <p className="text-[10px] font-bold text-[#5C6B7A] uppercase mt-0.5">{role.id}</p>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#5C6B7A]">
                      {role.users} Active Users
                    </td>
                    <td className="py-4 px-5 font-semibold text-[#1A2332]">
                      <span className="px-2.5 py-1 bg-[#1B3A6B]/10 text-[#1B3A6B] rounded text-[10px] font-bold">
                        {role.permissions}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 bg-[#00A99D]/15 text-[#00A99D] border border-[#00A99D]/30 rounded text-[10px] font-bold uppercase">
                        {role.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(role)}
                        title="Edit Permissions" 
                        className="bg-[#E2E8F0] text-[#1B3A6B] p-2 rounded border-b-[3px] border-[#CBD5E1] active:border-b-0 active:translate-y-[3px] transition-all hover:bg-[#CBD5E1] cursor-pointer"
                      >
                        <Edit2 size={14} strokeWidth={3} />
                      </button>
                      {role.status !== 'System Default' && (
                        <button 
                          onClick={() => handleDeleteRole(role)}
                          title="Delete Role" 
                          className="bg-[#ED1C24]/10 text-[#ED1C24] p-2 rounded border border-[#ED1C24]/30 hover:bg-[#ED1C24]/20 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- Create / Edit Role Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-[#1B3A6B] text-white flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide">
                {isEditing ? 'Edit Role Permissions' : 'Create New System Role'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-[#1B3A6B] uppercase mb-1">Role Title</label>
                <input 
                  type="text" 
                  value={roleName} 
                  onChange={(e) => setRoleName(e.target.value)} 
                  required
                  placeholder="e.g. Hostel Warden"
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#1B3A6B] uppercase mb-1">Assigned Users Count</label>
                <input 
                  type="number" 
                  value={roleUsers} 
                  onChange={(e) => setRoleUsers(e.target.value)} 
                  required
                  placeholder="e.g. 15"
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#1B3A6B] uppercase mb-1">Permission Scope Description</label>
                <input 
                  type="text" 
                  value={rolePermissions} 
                  onChange={(e) => setRolePermissions(e.target.value)} 
                  required
                  placeholder="e.g. Hostel Management & Attendance Only"
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#1B3A6B] uppercase mb-1">Role Type Status</label>
                <select 
                  value={roleStatus} 
                  onChange={(e) => setRoleStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#00AEEF]"
                >
                  <option value="Active">Active</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#00AEEF] text-white rounded-lg hover:bg-[#008cc2] transition shadow-sm cursor-pointer"
                >
                  {isEditing ? 'Update Role' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}