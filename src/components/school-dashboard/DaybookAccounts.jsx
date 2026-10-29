'use client';
import React, { useState } from 'react';
import { 
  FiPlusCircle, FiDownload, FiSearch, 
  FiArrowUpRight, FiArrowDownLeft, FiPrinter, FiDollarSign, FiCalendar 
} from 'react-icons/fi';

export default function DaybookAccounts() {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('Full Month-wise (Monthly)');
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  // Sample Data combining all features
  const entries = [
    { id: 1, date: '2026-04-06', particulars: 'Tuition Fee Collected - Class 10th', type: 'Credit', amount: 45000, mode: 'Cash', category: 'Fee' },
    { id: 2, date: '2026-04-06', particulars: 'Electricity Bill Payment (May)', type: 'Debit', amount: 12400, mode: 'Bank Transfer', category: 'Utility' },
    { id: 3, date: '2026-04-05', particulars: 'Library Books Purchase', type: 'Debit', amount: 8500, mode: 'Cash', category: 'Library' },
    { id: 4, date: '2026-04-05', particulars: 'Bus Transport Fee - Route 4', type: 'Credit', amount: 18000, mode: 'Online', category: 'Transport' },
    { id: 5, date: '2026-04-04', particulars: 'Stationery & Office Supplies', type: 'Debit', amount: 3200, mode: 'Cash', category: 'Admin' },
  ];

  const filteredEntries = entries.filter(item => {
    const matchesFilter = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.particulars.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
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
          <p className="text-sm text-slate-500 mt-1">Manage daily school income, expenses, and financial logs with complete transparency.</p>
        </div>

        {/* View Mode & Month Selectors (April to March) */}
        <div className="flex items-center gap-3 flex-wrap">
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

      {/* SECTION 1: 3 Main Summary Cards with Distinct Color Coding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Credit / Collection (Green Theme) */}
        <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-emerald-600"></div>
          <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Total Credit (Inflow / Collection)</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹63,000</h3>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md mt-2 inline-block border border-emerald-300">
            +12% from yesterday
          </span>
        </div>

        {/* Total Debit / Expense (Red Theme) */}
        <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-rose-600"></div>
          <p className="text-[11px] font-black uppercase tracking-wider text-rose-800">Total Debit (Outflow / Expense)</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">₹24,100</h3>
          <span className="text-[11px] text-rose-700 font-bold bg-rose-100 px-2.5 py-0.5 rounded-md mt-2 inline-block border border-rose-300">
            4 Transactions recorded
          </span>
        </div>

        {/* Net Balance (Indigo / Blue Theme) */}
        <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-indigo-600"></div>
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">Net Balance Today (Savings)</p>
          <h3 className="text-2xl font-black text-indigo-700 mt-1">₹38,900</h3>
          <span className="text-[11px] text-indigo-700 font-bold bg-indigo-100 px-2.5 py-0.5 rounded-md mt-2 inline-block border border-indigo-300">
            Updated live
          </span>
        </div>

      </div>

      {/* SECTION 2: All 7 Detailed Summary Cards with Color Differentiation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-emerald-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cash Fee Collections (+)</p>
          <h3 className="text-xl font-black text-emerald-600 mt-1">₹45,000</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-teal-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Online/Bank Collections (+)</p>
          <h3 className="text-xl font-black text-teal-600 mt-1">₹18,000</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-blue-600"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collection (+)</p>
          <h3 className="text-xl font-black text-blue-700 mt-1">₹63,000</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-rose-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cash Expenses / Salary (-)</p>
          <h3 className="text-xl font-black text-rose-600 mt-1">₹11,700</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-orange-500"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Online Expenses / Salary (-)</p>
          <h3 className="text-xl font-black text-orange-600 mt-1">₹12,400</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-600"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Cash Balance (रोकड़)</p>
          <h3 className="text-xl font-black text-indigo-700 mt-1">₹33,300</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden sm:col-span-2">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-sky-600"></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Bank / Online Balance</p>
          <h3 className="text-xl font-black text-sky-700 mt-1">₹5,600</h3>
        </div>

      </div>

      {/* Action Buttons Toolbar with 3D Effect */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Full Monthly Transactions Log - [{selectedMonth}]</h3>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-[0_4px_0_0_#cbd5e1] hover:shadow-[0_2px_0_0_#cbd5e1] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150">
            <FiPrinter size={16} /> Print Report
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-[0_4px_0_0_#cbd5e1] hover:shadow-[0_2px_0_0_#cbd5e1] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150">
            <FiDownload size={16} /> Export Excel
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold text-sm rounded-xl border border-blue-600 shadow-[0_4px_0_0_#1e40af] hover:shadow-[0_2px_0_0_#1e40af] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150">
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
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 ${
                filterType === type 
                  ? 'bg-slate-900 text-white shadow-[0_3px_0_0_#0f172a] translate-y-[-1px]' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Box on the same row */}
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
              {filteredEntries.length > 0 ? (
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
                    No accounting transactions recorded for {selectedMonth}.
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