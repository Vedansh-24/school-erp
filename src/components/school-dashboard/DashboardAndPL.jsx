'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Coins, 
  UserCheck, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Cake, 
  MessageCircle 
} from 'lucide-react';

export default function DashboardAndPL() {
  const [isMounted, setIsMounted] = useState(false);

  const [totalStudents, setTotalStudents] = useState(97);
  const [totalFees, setTotalFees] = useState(10000);
  const [totalPenalty, setTotalPenalty] = useState(71250);
  const [penaltyReceived, setPenaltyReceived] = useState(0);
  const [pendingDue, setPendingDue] = useState(736677);
  const [totalReceivable, setTotalReceivable] = useState(746677);
  const [staffDue, setStaffDue] = useState(4591);
  const [staffPaid, setStaffPaid] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState(21750);

  const profitAndLoss = (totalFees + penaltyReceived) - (staffPaid + otherExpenses);
  const [birthdayAlerts, setBirthdayAlerts] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    fetchTodayBirthdays();
  }, []);

  const fetchTodayBirthdays = async () => {
    try {
      if (!supabase) {
        console.error("Supabase client not loaded!");
        return;
      }

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      const { data: students, error } = await supabase
        .from('students')
        .select('id, student_full_name, class_name, dob');

      if (error) {
        console.error('Supabase Query Error:', error.message);
        return;
      }

      const todayBirthdays = (students || [])
        .filter(student => {
          if (!student || !student.dob) return false;
          const cleanDob = String(student.dob).split('T')[0];
          const parts = cleanDob.split('-');
          if (parts.length < 3) return false;
          const birthMonth = parseInt(parts[1], 10);
          const birthDay = parseInt(parts[2], 10);
          return birthMonth === currentMonth && birthDay === currentDay;
        })
        .map(student => ({
          id: student.id,
          name: student.student_full_name,
          class: student.class_name
        }));

      setBirthdayAlerts(todayBirthdays);
    } catch (err) {
      console.error('Unexpected Error:', err);
    }
  };

  const handleWhatsAppShare = (name) => {
    const text = encodeURIComponent(`Happy Birthday ${name}! Wishing you a wonderful day from Blue Heaven Kids Academy 🎉`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-5">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        
        {/* Total Registered Students */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-cyan-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">👨‍🎓</span> Total Registered Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center shadow-md border-b-2 border-cyan-700">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">{totalStudents}</div>
        </div>

        {/* Total Fees Received */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">💰</span> Total Fees Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md border-b-2 border-emerald-700">
              <Wallet size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">₹{totalFees}</div>
        </div>

        {/* Total Penalty */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">⚠️</span> Total Penalty
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md border-b-2 border-amber-700">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">₹{totalPenalty}</div>
        </div>

        {/* Penalty Received */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-teal-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">✅</span> Penalty Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center shadow-md border-b-2 border-teal-700">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">₹{penaltyReceived}</div>
        </div>

        {/* Pending Due */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-red-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">⏳</span> Pending Due
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-md border-b-2 border-red-700">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#EF4444]">₹{pendingDue}</div>
        </div>

        {/* Fee Receivable */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-indigo-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">📊</span> Fee Receivable
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-md border-b-2 border-indigo-700">
              <Coins size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">₹{totalReceivable}</div>
        </div>

      </div>

      {/* Expense & P/L Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Staff Payment */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-orange-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">💼</span> Staff Payment (Due / Paid)
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-md border-b-2 border-orange-700">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="text-base font-black text-[#1A2332] mt-1">
            Due: <span className="text-red-600">₹{staffDue}</span> | Paid: <span className="text-emerald-600">₹{staffPaid}</span>
          </div>
        </div>

        {/* Other Expenses */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-blue-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">🧾</span> Other Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-md border-b-2 border-blue-700">
              <Receipt size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">₹{otherExpenses}</div>
        </div>

        {/* Profit / Loss */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-purple-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">📈</span> Profit / Loss
            </span>
            <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md border-b-2 ${
              profitAndLoss < 0 ? 'bg-red-500 border-red-700' : 'bg-purple-600 border-purple-800'
            }`}>
              {profitAndLoss < 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
            </div>
          </div>
          <div className={`text-2xl font-black ${profitAndLoss < 0 ? 'text-[#EF4444]' : 'text-emerald-600'}`}>
            {profitAndLoss < 0 ? '-' : ''}₹{Math.abs(profitAndLoss)}
          </div>
        </div>

      </div>

      {/* Today's Birthdays Section */}
      <div className="mt-6 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 border border-amber-300 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-black text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center shadow-sm">
            <Cake size={16} />
          </span>
          Today's Birthdays
        </h3>
        <div className="space-y-2">
          {birthdayAlerts.length > 0 ? (
            birthdayAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                    {alert.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{alert.name}</div>
                    <div className="text-xs text-slate-500 font-medium">Class: {alert.class}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleWhatsAppShare(alert.name)}
                  className="bg-gradient-to-b from-[#34D399] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs px-4 py-2 rounded-xl font-black transition-all duration-150 border-t border-emerald-200/50 border-b-[4px] border-[#065F46] shadow-[0_0_15px_rgba(52,211,153,0.5)] active:translate-y-1 active:border-b-[1px] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle size={14} /> Wish on WhatsApp
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs font-semibold text-slate-500">No birthdays today.</p>
          )}
        </div>
      </div>
    </div>
  );
}