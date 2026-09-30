// Filename: FeeDuesAndPassbook.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, Search, Download, Printer, ArrowUpRight, 
  ArrowDownLeft, CheckCircle2, AlertCircle, Loader2, X, FileText 
} from 'lucide-react';

export default function FeeDuesAndPassbook() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [passbookData, setPassbookData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Receipt Modal States
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Fetch Fee Collections & Students from Supabase
  const fetchFeeData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Fee Collections from Supabase
      const { data: feeData, error: feeError } = await supabase
        .from('fee_collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (feeError) throw feeError;

      // 2. Fetch Students for names, father's name, sr_no and class matching
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, student_id, sr_no, student_full_name, class_name, father_name');

      if (studentError) throw studentError;

      // 3. Map and Merge Supabase Data with robust sr_no and student_id check
      if (feeData) {
        const mappedTransactions = feeData.map((item, index) => {
          const student = studentData?.find(
            (s) => 
              (item.student_id && (
                String(s.id) === String(item.student_id) || 
                String(s.student_id) === String(item.student_id) ||
                String(s.sr_no) === String(item.student_id)
              )) ||
              (item.sr_no && (
                String(s.sr_no) === String(item.sr_no) ||
                String(s.student_id) === String(item.sr_no) ||
                String(s.id) === String(item.sr_no)
              ))
          );

          return {
            id: `TXN-${item.receipt_no || String(item.id).slice(0, 6)}`,
            date: item.receipt_date || item.created_at?.split('T')[0] || '2026-09-29',
            studentName: student ? student.student_full_name : 'Unknown Student',
            fatherName: student ? (student.father_name || 'N/A') : 'N/A',
            srNo: student ? (student.sr_no || student.student_id || '718') : '718',
            class: item.class_name || (student ? student.class_name : 'Unassigned'),
            description: `Tuition Fee Allocation (${item.allocation_month || 'December 2026 - March 2027'})`,
            allocationMonth: item.allocation_month || 'December 2026 - March 2027 (3rd Instalment)',
            amount: item.total_paid || 4000,
            lateFine: item.late_fine || 0,
            remainingDue: item.remaining_due || 0,
            paymentMode: item.payment_mode || 'Cash',
            type: 'Credit', // Paid fee collections
            status: 'Success',
            receiptNo: item.receipt_no || `2262`,
          };
        });

        setPassbookData(mappedTransactions);
      }
    } catch (error) {
      console.error('Error fetching fee collections from Supabase:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const totalPaid = passbookData
    .filter(item => item.type === 'Credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDue = passbookData
    .filter(item => item.type === 'Debit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTransactions = passbookData.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.receiptNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || item.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleViewReceipt = (item) => {
    setActiveReceipt(item);
    setShowReceiptModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* 🚀 Top Summary Cards (Gradient Colors Unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Paid Card - Emerald/Teal Gradient */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 p-5 rounded-2xl shadow-lg flex items-center justify-between text-white border border-emerald-400/30">
          <div>
            <p className="text-xs font-black uppercase text-emerald-100 tracking-wider">Total Paid Amount</p>
            <h3 className="text-3xl font-black text-white mt-1">₹ {totalPaid.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-emerald-100/80 mt-1">Successfully credited to accounts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <ArrowDownLeft size={24} />
          </div>
        </div>

        {/* Pending Dues Card - Red/Rose Gradient */}
        <div className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-800 p-5 rounded-2xl shadow-lg flex items-center justify-between text-white border border-rose-400/30">
          <div>
            <p className="text-xs font-black uppercase text-rose-100 tracking-wider">Pending Dues</p>
            <h3 className="text-3xl font-black text-white mt-1">₹ {totalDue.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-rose-100/80 mt-1">Amount yet to be collected</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner">
            <ArrowUpRight size={24} />
          </div>
        </div>

        {/* Action Card - Royal Blue Gradient with 3D Dabne Wala Effect */}
        <div className="bg-gradient-to-br from-[#1B3A6B] via-[#244A85] to-[#2F6690] p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between border border-blue-400/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase text-sky-200 tracking-wider">Quick Actions</p>
              <h4 className="text-lg font-black mt-1">Fee Passbook & Ledger</h4>
            </div>
            <Wallet className="text-sky-300" size={24} />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center justify-center gap-1 cursor-pointer active:translate-y-0.5 active:shadow-none">
              <Printer size={14} /> Print Ledger
            </button>
            <button className="flex-1 bg-[#38BDF8] hover:bg-[#0284C7] text-slate-900 font-black py-2 rounded-xl text-xs transition-all shadow flex items-center justify-center gap-1 cursor-pointer active:translate-y-0.5 active:shadow-none">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

      </div>

      {/* 📋 Transaction History Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header & Search */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              📖
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Student Fee Passbook Ledger</h3>
              <p className="text-xs font-semibold text-slate-500">Track individual payment logs, receipts and due statuses from database</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search student or TXN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Success">Success (Paid)</option>
              <option value="Pending">Pending (Due)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-5">TXN & Date</th>
                <th className="py-3 px-5">Student Details</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Receipt No</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-indigo-600" size={24} />
                      Loading fee transactions from database...
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-black text-slate-800">{item.id}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{item.date}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-black text-slate-900">{item.studentName}</p>
                      <p className="text-[11px] text-indigo-600 font-bold">{item.class}</p>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-600">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">
                      {item.receiptNo}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`font-black text-sm ${item.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.type === 'Credit' ? '+ ₹ ' : '- ₹ '} {item.amount}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {item.status === 'Success' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                          <AlertCircle size={12} /> Due
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        onClick={() => handleViewReceipt(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer active:translate-y-0.5 active:shadow-none"
                      >
                        {item.status === 'Success' ? 'View Receipt' : 'Collect Fee'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">
                    No transaction or dues history found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 🧾 Official Fee Receipt Modal */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#111827] text-slate-100 rounded-2xl max-w-lg w-full p-5 border border-slate-700 shadow-2xl relative my-8">
            
            {/* Close Icon Header */}
            <button 
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-all cursor-pointer active:translate-y-0.5"
            >
              <X size={18} />
            </button>

            {/* Receipt Inner Paper Style Matching Image */}
            <div className="bg-white text-slate-900 rounded-xl p-5 shadow-inner mt-4 border border-slate-300">
              
              {/* School Header */}
              <div className="text-center pb-3 border-b-2 border-slate-900">
                <h2 className="text-lg font-black tracking-wider text-slate-900 uppercase">BLUE HEAVEN KIDS ACADEMY</h2>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">Dev Nagar, Benad Road, Jaipur</p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded">
                  TUITION FEE OFFICIAL RECEIPT
                </div>
                <p className="text-[10px] font-bold text-slate-700 mt-1.5">
                  Academic Session: 2026-27 | For Period/Month: {activeReceipt.allocationMonth}
                </p>
              </div>

              {/* Receipt No & Date */}
              <div className="flex justify-between items-center text-xs font-black py-3 border-b border-slate-200">
                <span>Receipt No: {activeReceipt.receiptNo}</span>
                <span>Date: {activeReceipt.date}</span>
              </div>

              {/* Student Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3 space-y-1.5 text-xs font-bold text-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-slate-500 font-semibold">Student Name:</span> {activeReceipt.studentName.toUpperCase()}</p>
                  <p><span className="text-slate-500 font-semibold">Class:</span> {activeReceipt.class}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-slate-500 font-semibold">Father Name:</span> {activeReceipt.fatherName.toUpperCase()}</p>
                  <p><span className="text-slate-500 font-semibold">SR. No:</span> {activeReceipt.srNo}</p>
                </div>
                <div>
                  <p><span className="text-slate-500 font-semibold">Payment Mode:</span> {activeReceipt.paymentMode}</p>
                </div>
              </div>

              {/* Fee Particulars Table */}
              <div className="border border-slate-900 rounded-lg overflow-hidden my-3">
                <div className="bg-slate-900 text-white text-[11px] font-black px-3 py-2 flex justify-between uppercase tracking-wider">
                  <span>Particulars / Heads ({activeReceipt.allocationMonth.toUpperCase()})</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="divide-y divide-slate-200 text-xs font-semibold text-slate-800">
                  <div className="px-3 py-2 flex justify-between">
                    <span>Tuition Fee / Instalment Deposit</span>
                    <span className="font-black">₹{activeReceipt.amount}</span>
                  </div>
                  <div className="px-3 py-2 flex justify-between">
                    <span>Late Fine / Penalty Paid</span>
                    <span className="font-black">₹{activeReceipt.lateFine}</span>
                  </div>
                  <div className="px-3 py-2.5 flex justify-between bg-slate-100 font-black text-slate-900 text-sm">
                    <span>TOTAL AMOUNT RECEIVED:</span>
                    <span className="text-emerald-700">₹{activeReceipt.amount + activeReceipt.lateFine}</span>
                  </div>
                  <div className="px-3 py-2 flex justify-between font-black text-slate-900">
                    <span>REMAINING TUITION FEE DUE:</span>
                    <span className="text-red-600">₹{activeReceipt.remainingDue}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Footer Note */}
              <div className="flex justify-between items-end pt-6 pb-2 text-[10px] font-bold text-slate-500">
                <div>
                  <p>Computer Generated Receipt</p>
                </div>
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 mb-1"></div>
                  <p className="text-slate-700 font-black">Authorized Cashier</p>
                </div>
              </div>

            </div>

            {/* Modal Bottom Action (Only Close button as requested) */}
            <div className="mt-5 flex justify-end">
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 active:shadow-none"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}