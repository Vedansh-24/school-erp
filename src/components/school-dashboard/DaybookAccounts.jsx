'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FiPlusCircle, FiDownload, FiSearch, 
  FiArrowUpRight, FiArrowDownLeft, FiPrinter, FiDollarSign, FiCalendar, FiRefreshCw 
} from 'react-icons/fi';

export default function DaybookAccounts() {
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('Full Month-wise (Monthly)');
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  // Real Database State
  const [entries, setEntries] = useState([]);

  // Metrics States for Summary Cards
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  const [cashCollections, setCashCollections] = useState(0);
  const [onlineCollections, setOnlineCollections] = useState(0);
  const [cashExpenses, setCashExpenses] = useState(0);
  const [onlineExpenses, setOnlineExpenses] = useState(0);
  const [netCashBalance, setNetCashBalance] = useState(0);
  const [netBankBalance, setNetBankBalance] = useState(0);

  // New Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transType, setTransType] = useState('Credit');
  const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
  const [transParticulars, setTransParticulars] = useState('');
  const [transCategory, setTransCategory] = useState('General');
  const [transMode, setTransMode] = useState('Cash');
  const [transAmount, setTransAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllFinancialRecords();
  }, []);

  const fetchAllFinancialRecords = async () => {
    setLoading(true);
    try {
      if (!supabase) return;

      // 1. Fetch Fee Collections (CREDITS)
      const { data: feeData, error: feeErr } = await supabase
        .from('fee_collections')
        .select('*');
      if (feeErr) console.error('Error fetching fee_collections:', feeErr.message);

      // 2. Fetch Staff Payments (DEBITS)
      const { data: staffData, error: staffErr } = await supabase
        .from('staff_payments')
        .select('*');
      if (staffErr) console.error('Error fetching staff_payments:', staffErr.message);

      // 3. Fetch School Expenses (DEBITS)
      const { data: expenseData, error: expErr } = await supabase
        .from('expenses')
        .select('*');
      if (expErr) console.error('Error fetching expenses:', expErr.message);

      // 4. Fetch Custom Daybook Transactions (CREDITS & DEBITS)
      const { data: daybookData, error: daybookErr } = await supabase
        .from('daybook_transactions')
        .select('*');
      if (daybookErr) console.error('Error fetching daybook_transactions:', daybookErr.message);

      const combinedLogs = [];

      // Map Fee Collections -> Credit Entries
      if (feeData) {
        feeData.forEach(item => {
          const paidAmount = Number(item.fee_paid ?? item.total_paid ?? 0);
          const penaltyAmount = Number(item.penalty_paid ?? item.penalty_amount ?? 0);
          const totalPaid = paidAmount + penaltyAmount;

          if (totalPaid > 0) {
            combinedLogs.push({
              id: `fee-${item.id}`,
              date: item.receipt_date ? String(item.receipt_date).split('T')[0] : String(item.created_at).split('T')[0],
              particulars: `Fee Collection (Receipt #${item.receipt_no || 'N/A'}) - Class: ${item.class_name || 'N/A'}`,
              type: 'Credit',
              amount: totalPaid,
              mode: item.payment_mode || 'Cash',
              category: 'Fee Collection',
              rawDate: item.receipt_date || item.created_at
            });
          }
        });
      }

      // Map Staff Payments -> Debit Entries
      if (staffData) {
        staffData.forEach(item => {
          const amt = Number(item.amount ?? item.salary_paid ?? 0);
          if (amt > 0) {
            combinedLogs.push({
              id: `staff-${item.id}`,
              date: item.payment_date ? String(item.payment_date).split('T')[0] : String(item.created_at).split('T')[0],
              particulars: `Staff Salary: ${item.staff_name || 'Staff Member'} (${item.payment_month || 'Salary'})`,
              type: 'Debit',
              amount: amt,
              mode: item.payment_mode || 'Cash',
              category: 'Staff Salary',
              rawDate: item.payment_date || item.created_at
            });
          }
        });
      }

      // Map Expenses -> Debit Entries
      if (expenseData) {
        expenseData.forEach(item => {
          const amt = Number(item.amount || 0);
          if (amt > 0) {
            combinedLogs.push({
              id: `exp-${item.id}`,
              date: item.expense_date ? String(item.expense_date).split('T')[0] : String(item.created_at).split('T')[0],
              particulars: item.expense_title || 'General School Expense',
              type: 'Debit',
              amount: amt,
              mode: item.payment_mode || 'Cash',
              category: item.category || 'School Expense',
              rawDate: item.expense_date || item.created_at
            });
          }
        });
      }

      // Map Daybook Transactions -> Credit / Debit Entries
      if (daybookData) {
        daybookData.forEach(item => {
          const amt = Number(item.amount || 0);
          if (amt > 0) {
            combinedLogs.push({
              id: `daybook-${item.id}`,
              date: item.transaction_date ? String(item.transaction_date).split('T')[0] : String(item.created_at).split('T')[0],
              particulars: item.particulars_description || 'General Account Log',
              type: item.transaction_type === 'Debit' ? 'Debit' : 'Credit',
              amount: amt,
              mode: item.payment_mode || 'Cash',
              category: item.category || 'General',
              rawDate: item.transaction_date || item.created_at
            });
          }
        });
      }

      // Sort logs descending by date
      combinedLogs.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
      setEntries(combinedLogs);

      // Compute Overall Dashboard Aggregations
      let creditSum = 0;
      let debitSum = 0;
      let cashIn = 0;
      let onlineIn = 0;
      let cashOut = 0;
      let onlineOut = 0;

      combinedLogs.forEach(item => {
        const amt = item.amount;
        const isOnline = item.mode.toLowerCase().includes('bank') || 
                         item.mode.toLowerCase().includes('online') || 
                         item.mode.toLowerCase().includes('upi') || 
                         item.mode.toLowerCase().includes('cheque');

        if (item.type === 'Credit') {
          creditSum += amt;
          if (isOnline) onlineIn += amt;
          else cashIn += amt;
        } else {
          debitSum += amt;
          if (isOnline) onlineOut += amt;
          else cashOut += amt;
        }
      });

      setTotalCredit(creditSum);
      setTotalDebit(debitSum);
      setNetBalance(creditSum - debitSum);

      setCashCollections(cashIn);
      setOnlineCollections(onlineIn);
      setCashExpenses(cashOut);
      setOnlineExpenses(onlineOut);
      setNetCashBalance(cashIn - cashOut);
      setNetBankBalance(onlineIn - onlineOut);

    } catch (err) {
      console.error('Daybook fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!transParticulars || !transAmount || Number(transAmount) <= 0) {
      alert('Kripya Particulars aur Sahi Amount fill karein!');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('daybook_transactions').insert([
        {
          transaction_date: transDate,
          transaction_type: transType,
          particulars_description: transParticulars,
          category: transCategory,
          payment_mode: transMode,
          amount: Number(transAmount),
          session: '2026-2027'
        }
      ]);

      if (error) throw error;

      alert('Transaction Safalpurvak Add Ho Gaya!');
      setIsModalOpen(false);
      setTransParticulars('');
      setTransAmount('');
      fetchAllFinancialRecords();
    } catch (err) {
      alert('Transaction Save Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = entries.filter(item => {
    const matchesFilter = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.particulars.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl shadow-inner border border-blue-100"><FiDollarSign size={24} /></span>
            Daybook & Monthly Accounts (रोकड़ व बैंक खाता)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time dynamic financial transaction ledger integrated with Supabase.</p>
        </div>

        {/* View Mode & Month Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchAllFinancialRecords}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Records'}
          </button>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <span>View Mode:</span>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option>Full Month-wise (Monthly)</option>
              <option>Daily View</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <FiCalendar size={14} className="text-slate-400" />
            <span>Month:</span>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="April 2026">April 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="December 2026">December 2026</option>
              <option value="January 2027">January 2027</option>
              <option value="February 2027">February 2027</option>
              <option value="March 2027">March 2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: 3 Main Summary Cards with Real Aggregated Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Credit / Collection */}
        <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-emerald-600"></div>
          <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Total Credit (Inflow / Collection)</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{totalCredit.toLocaleString()}</h3>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md mt-2 inline-block border border-emerald-300">
            Real-time Aggregation
          </span>
        </div>

        {/* Total Debit / Expense */}
        <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-rose-600"></div>
          <p className="text-[11px] font-black uppercase tracking-wider text-rose-800">Total Debit (Outflow / Expense)</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">₹{totalDebit.toLocaleString()}</h3>
          <span className="text-[11px] text-rose-700 font-bold bg-rose-100 px-2.5 py-0.5 rounded-md mt-2 inline-block border border-rose-300">
            {entries.filter(e => e.type === 'Debit').length} Debit Logs recorded
          </span>
        </div>

        {/* Net Balance */}
        <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-indigo-600"></div>
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">Net Balance Today (Savings)</p>
          <h3 className={`text-2xl font-black mt-1 ${netBalance >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
            ₹{netBalance.toLocaleString()}
          </h3>
          <span className="text-[11px] text-indigo-700 font-bold bg-indigo-100 px-2.5 py-0.5 rounded-md mt-2 inline-block border border-indigo-300">
            Updated live from database
          </span>
        </div>

      </div>

      {/* SECTION 2: All 7 Detailed Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-emerald-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cash Fee Collections (+)</p>
          <h3 className="text-xl font-black text-emerald-600 mt-1">₹{cashCollections.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-teal-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Online/Bank Collections (+)</p>
          <h3 className="text-xl font-black text-teal-600 mt-1">₹{onlineCollections.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-blue-600"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collection (+)</p>
          <h3 className="text-xl font-black text-blue-700 mt-1">₹{totalCredit.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-rose-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cash Expenses / Salary (-)</p>
          <h3 className="text-xl font-black text-rose-600 mt-1">₹{cashExpenses.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-orange-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Online Expenses / Salary (-)</p>
          <h3 className="text-xl font-black text-orange-600 mt-1">₹{onlineExpenses.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-600"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Cash Balance (रोकड़)</p>
          <h3 className="text-xl font-black text-indigo-700 mt-1">₹{netCashBalance.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden sm:col-span-2">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-sky-600"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Bank / Online Balance</p>
          <h3 className="text-xl font-black text-sky-700 mt-1">₹{netBankBalance.toLocaleString()}</h3>
        </div>

      </div>

      {/* Action Buttons Toolbar with 3D Effect */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Full Transactions Log - [{selectedMonth}]</h3>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-[0_4px_0_0_#cbd5e1] hover:shadow-[0_2px_0_0_#cbd5e1] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 cursor-pointer">
            <FiPrinter size={16} /> Print Report
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-[0_4px_0_0_#cbd5e1] hover:shadow-[0_2px_0_0_#cbd5e1] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 cursor-pointer">
            <FiDownload size={16} /> Export Excel
          </button>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold text-sm rounded-xl border border-blue-600 shadow-[0_4px_0_0_#1e40af] hover:shadow-[0_2px_0_0_#1e40af] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 cursor-pointer">
            <FiPlusCircle size={18} /> Add New Entry
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar Combined in Single Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Filter Tabs (All, Credit, Debit) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['All', 'Credit', 'Debit'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                filterType === type 
                  ? 'bg-slate-900 text-white shadow-[0_3px_0_0_#0f172a] translate-y-[-1px]' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Search particulars or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-inner"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-black tracking-wider">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Particulars / Description</th>
                <th className="py-3.5 px-6">Category / Mode</th>
                <th className="py-3.5 px-6 text-right">Income (+) / Expense (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500 font-medium italic">
                    Loading financial records from Supabase...
                  </td>
                </tr>
              ) : filteredEntries.length > 0 ? (
                filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-500 text-xs font-semibold">{item.date}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.type === 'Credit' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {item.type === 'Credit' ? <FiArrowDownLeft size={12} /> : <FiArrowUpRight size={12} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-900 font-bold">{item.particulars}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400">({item.mode})</span>
                      </div>
                    </td>
                    <td className={`py-4 px-6 text-right font-black ${item.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.type === 'Credit' ? '+' : '-'} ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                    No accounting transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW TRANSACTION MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-300 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <FiPlusCircle className="text-blue-600" /> Add Daybook Transaction Entry
              </h2>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Type</label>
                    <select
                      value={transType}
                      onChange={(e) => setTransType(e.target.value)}
                      className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 font-bold"
                    >
                      <option value="Credit">Credit (Income / Inflow)</option>
                      <option value="Debit">Debit (Expense / Outflow)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={transDate}
                      onChange={(e) => setTransDate(e.target.value)}
                      className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Particulars / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Purchased Science Lab Supplies"
                    value={transParticulars}
                    onChange={(e) => setTransParticulars(e.target.value)}
                    className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Utility, Admin"
                      value={transCategory}
                      onChange={(e) => setTransCategory(e.target.value)}
                      className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                    <select
                      value={transMode}
                      onChange={(e) => setTransMode(e.target.value)}
                      className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 font-bold"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI / Online">UPI / Online</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={transAmount}
                      onChange={(e) => setTransAmount(e.target.value)}
                      className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}