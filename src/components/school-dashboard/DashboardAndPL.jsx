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
  MessageCircle,
  RefreshCw
} from 'lucide-react';

export default function DashboardAndPL() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic Dashboard Aggregated States
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [penaltyReceived, setPenaltyReceived] = useState(0);
  const [pendingDue, setPendingDue] = useState(0);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [staffDue, setStaffDue] = useState(0);
  const [staffPaid, setStaffPaid] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState(0);

  const [birthdayAlerts, setBirthdayAlerts] = useState([]);

  // Dynamic Profit & Loss Formula Calculation:
  // Profit / Loss = (Total Fees + Penalty Received) - (Staff Paid + Other Expenses)
  const profitAndLoss = (totalFees + penaltyReceived) - (staffPaid + otherExpenses);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!supabase) return;

      // 1. Fetch Registered Students (students table)
      // Columns used: id, student_full_name, class_name, dob, annual_fees, whatsapp_number, mobile_number
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, student_full_name, class_name, dob, annual_fees, whatsapp_number, mobile_number');

      let computedReceivable = 0;
      if (!studentsError && studentsData) {
        setTotalStudents(studentsData.length);

        // Sum annual_fees from students table for Fee Receivable
        computedReceivable = studentsData.reduce((sum, s) => sum + Number(s.annual_fees || 0), 0);
        setTotalReceivable(computedReceivable);

        // Calculate Today's Birthdays matching dob column
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const todayBirthdays = studentsData
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
            class: student.class_name,
            mobile: student.whatsapp_number || student.mobile_number || ''
          }));

        setBirthdayAlerts(todayBirthdays);
      } else if (studentsError) {
        console.error('Students fetch error:', studentsError.message);
      }

      // 2. Fetch Fee Collections Data (fee_collections table)
      const { data: feeRecords, error: feeError } = await supabase
        .from('fee_collections')
        .select('fee_paid, tuition_fee_amount, installment_1_amount, installment_2_amount, installment_3_amount, installment_4_amount, penalty_amount, penalty_paid, total_paid');

      let computedTotalFees = 0;
      let computedTotalPenalty = 0;
      let computedPenaltyReceived = 0;

      if (!feeError && feeRecords) {
        feeRecords.forEach(item => {
          const feePaidVal = item.fee_paid ?? item.total_paid ?? (
            (Number(item.tuition_fee_amount) || 0) + 
            (Number(item.installment_1_amount) || 0) + 
            (Number(item.installment_2_amount) || 0) + 
            (Number(item.installment_3_amount) || 0) + 
            (Number(item.installment_4_amount) || 0)
          );
          
          computedTotalFees += Number(feePaidVal || 0);

          const penaltyAmt = Number(item.penalty_amount || 0);
          const penaltyPaidVal = Number(item.penalty_paid ?? item.penalty_amount ?? 0);

          computedTotalPenalty += penaltyAmt;
          computedPenaltyReceived += penaltyPaidVal;
        });

        setTotalFees(computedTotalFees);
        setTotalPenalty(computedTotalPenalty);
        setPenaltyReceived(computedPenaltyReceived);
      } else if (feeError) {
        console.error('Fee collections fetch error:', feeError.message);
      }

      // Compute Pending Due: Total Receivable - Total Fees Collected
      const calculatedPendingDue = computedReceivable - computedTotalFees;
      setPendingDue(calculatedPendingDue > 0 ? calculatedPendingDue : 0);

      // 3. Fetch Staff Payroll & Payments (staff_payrolltable & staff_payments tables)
      const { data: payrollData, error: payrollError } = await supabase
        .from('staff_payrolltable')
        .select('salary_due, salary_paid');

      const { data: staffPaymentsData, error: staffPayError } = await supabase
        .from('staff_payments')
        .select('amount, salary_paid, salary_due');

      let computedStaffDue = 0;
      let computedStaffPaid = 0;

      if (!payrollError && payrollData) {
        payrollData.forEach(p => {
          computedStaffDue += Number(p.salary_due || 0);
          computedStaffPaid += Number(p.salary_paid || 0);
        });
      }

      if (!staffPayError && staffPaymentsData) {
        staffPaymentsData.forEach(sp => {
          const paidVal = Number(sp.amount ?? sp.salary_paid ?? 0);
          computedStaffPaid += paidVal;
          if (sp.salary_due) {
            computedStaffDue += Number(sp.salary_due || 0);
          }
        });
      }

      setStaffDue(computedStaffDue);
      setStaffPaid(computedStaffPaid);

      // 4. Fetch Other Expenses Data (expenses table)
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount');

      if (!expensesError && expensesData) {
        const computedExpenses = expensesData.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        setOtherExpenses(computedExpenses);
      } else if (expensesError) {
        console.error('Expenses fetch error:', expensesError.message);
      }

    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = (alert) => {
    if (!alert.mobile) {
      alert('Mobile number uplabdh nahi hai!');
      return;
    }
    const text = encodeURIComponent(`Happy Birthday ${alert.name}! Wishing you a wonderful day from Blue Heaven Kids Academy 🎉`);
    window.open(`https://wa.me/91${alert.mobile}?text=${text}`, '_blank');
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-5 font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            School Dashboard & Financial Performance
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time metric aggregation from Supabase database tables
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 py-2 rounded-xl font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Fetching...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        
        {/* Total Registered Students */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-cyan-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">👨‍🎓</span> Total Students
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
              <span className="text-base leading-none">💰</span> Fees Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md border-b-2 border-emerald-700">
              <Wallet size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">₹{totalFees.toLocaleString()}</div>
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
          <div className="text-2xl font-black text-[#1A2332]">₹{totalPenalty.toLocaleString()}</div>
        </div>

        {/* Penalty Received */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-teal-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">✅</span> Penalty Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center shadow-md border-b-2 border-teal-700">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A2332]">₹{penaltyReceived.toLocaleString()}</div>
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
          <div className="text-2xl font-black text-[#EF4444]">₹{pendingDue.toLocaleString()}</div>
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
          <div className="text-2xl font-black text-[#1A2332]">₹{totalReceivable.toLocaleString()}</div>
        </div>

      </div>

      {/* Expense & P/L Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Staff Payment */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-orange-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">💼</span> Staff Salary (Due / Paid)
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-md border-b-2 border-orange-700">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="text-base font-black text-[#1A2332] mt-1">
            Due: <span className="text-red-600">₹{staffDue.toLocaleString()}</span> | Paid: <span className="text-emerald-600">₹{staffPaid.toLocaleString()}</span>
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
          <div className="text-2xl font-black text-[#1A2332]">₹{otherExpenses.toLocaleString()}</div>
        </div>

        {/* Net Profit / Loss */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-purple-500 border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="text-base leading-none">📈</span> Net Profit / Loss
            </span>
            <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md border-b-2 ${
              profitAndLoss < 0 ? 'bg-red-500 border-red-700' : 'bg-purple-600 border-purple-800'
            }`}>
              {profitAndLoss < 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
            </div>
          </div>
          <div className={`text-2xl font-black ${profitAndLoss < 0 ? 'text-[#EF4444]' : 'text-emerald-600'}`}>
            {profitAndLoss < 0 ? '-' : ''}₹{Math.abs(profitAndLoss).toLocaleString()}
          </div>
        </div>

      </div>

      {/* Today's Birthdays Section */}
      <div className="mt-6 bg-[#FEF3C7] border border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
        
        {/* Title Header with Divider Line */}
        <div className="pb-3 border-b border-amber-300/80 flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-600 text-white rounded-lg flex items-center justify-center shadow-xs">
            <Cake size={16} />
          </div>
          <h3 className="text-base font-extrabold text-amber-900 tracking-wide">
            Today's Birthday Alerts
          </h3>
        </div>

        {/* Table Structure */}
        <div className="border border-amber-300/80 rounded-xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#475569] text-sky-400 text-[13px] font-bold border-b border-slate-600">
                <th className="px-5 py-3 border-r border-slate-600">STUDENT NAME</th>
                <th className="px-5 py-3 border-r border-slate-600 text-center">CLASS</th>
                <th className="px-5 py-3 text-center">SHARE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200/60 text-[13px]">
              {birthdayAlerts.length > 0 ? (
                birthdayAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-amber-50/50 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900 border-r border-amber-200/60">
                      {alert.name}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 text-center border-r border-amber-200/60">
                      {alert.class || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {alert.mobile ? (
                        <button
                          onClick={() => handleWhatsAppShare(alert)}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          <MessageCircle size={14} /> Wish on WhatsApp
                        </button>
                      ) : (
                        <span className="text-rose-500 font-semibold text-[13px]">
                          नंबर उपलब्ध नहीं है
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-5 py-6 text-center text-slate-500 italic font-medium">
                    आज किसी छात्र का जन्मदिन नहीं है।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}