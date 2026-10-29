'use client';
import { useState } from 'react';

export default function ExpensesLog() {
  // Helper function current date (YYYY-MM-DD) input date picker ke liye
  const getTodayDateForInput = () => new Date().toISOString().split('T')[0];

  // Date ko DD-MM-YYYY format me convert karne ke liye function
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr; // Pehle se hi DD-MM-YYYY hai
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts[2].length === 4) {
        // DD/MM/YYYY -> DD-MM-YYYY
        return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
      }
    }
    return dateStr;
  };

  // Table se date ko YYYY-MM-DD format me lane ke liye (Date input field ke liye)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return getTodayDateForInput();
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) return dateStr; // YYYY-MM-DD
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD-MM-YYYY -> YYYY-MM-DD
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD/MM/YYYY -> YYYY-MM-DD
    }
    return dateStr;
  };

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electricity & Bills');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDateForInput());
  
  // Edit track karne ke liye state
  const [editingId, setEditingId] = useState(null);

  const [expensesList, setExpensesList] = useState([
    { id: 1, date: '24-08-2026', particulars: 'Petrol', category: 'Other Expense', mode: 'UPI / Online', amount: 2000 },
    { id: 2, date: '14-08-2026', particulars: 'petrol', category: 'Other Expense', mode: 'Cash', amount: 2000 },
    { id: 3, date: '19-08-2026', particulars: 'Petrol', category: 'Other Expense', mode: 'UPI / Online', amount: 2000 },
    { id: 4, date: '11-08-2026', particulars: 'Socks Amount', category: 'Other Expense', mode: 'UPI / Online', amount: 1500 },
    { id: 5, date: '12-08-2026', particulars: 'Socks Amount', category: 'Other Expense', mode: 'UPI / Online', amount: 2250 },
    { id: 6, date: '12-08-2026', particulars: 'Advance for uniform making', category: 'Other Expense', mode: 'UPI / Online', amount: 10000 },
  ]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setExpenseDate(getTodayDateForInput());
    setCategory('Electricity & Bills');
    setPaymentMode('Cash');
    setEditingId(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      alert('कृपया Expense Title और Amount भरें!');
      return;
    }

    const formattedDate = formatDateForDisplay(expenseDate || getTodayDateForInput());

    if (editingId) {
      // Record ko update karne ke liye
      setExpensesList(
        expensesList.map((item) =>
          item.id === editingId
            ? {
                ...item,
                date: formattedDate,
                particulars: title,
                category: category,
                mode: paymentMode,
                amount: Number(amount)
              }
            : item
        )
      );
      alert('खर्च का रिकॉर्ड सफलतापूर्वक अपडेट कर दिया गया है!');
    } else {
      // Naya record add karne ke liye
      const newRecord = {
        id: Date.now(),
        date: formattedDate,
        particulars: title,
        category: category,
        mode: paymentMode,
        amount: Number(amount)
      };
      setExpensesList([newRecord, ...expensesList]);
      alert('खर्च का रिकॉर्ड सफलतापूर्वक सेव कर लिया गया है!');
    }

    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm('क्या आप इस खर्च के रिकॉर्ड को डिलीट करना चाहते हैं?')) {
      setExpensesList(expensesList.filter(item => item.id !== id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.particulars);
    setCategory(item.category);
    setPaymentMode(item.mode);
    setAmount(item.amount);
    setExpenseDate(formatDateForInput(item.date));
  };

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full">
      
      {/* Top Section: Add School Expense / Miscellaneous Cost */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-[16px] font-bold text-sky-700 tracking-wide">
          {editingId ? 'Edit School Expense Record' : 'Add School Expense / Miscellaneous Cost'}
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Expense Title */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Expense Title / Reason</label>
              <input
                type="text"
                placeholder="e.g. Electricity Bill, Chalk, Repair"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Category (श्रेणी)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm cursor-pointer font-medium"
              >
                <option value="Electricity & Bills">Electricity & Bills</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Stationery">Stationery</option>
                <option value="Other Expense">Other Expense</option>
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Payment Mode (माध्यम)</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm cursor-pointer font-medium"
              >
                <option value="Cash">Cash (नकद)</option>
                <option value="UPI / Online">UPI / Online</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Expense Date */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-[13px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 transition shadow-sm cursor-pointer font-medium"
              />
            </div>

          </div>

          <div className="pt-2 flex items-center gap-3">
            {/* 3D Elevated Save/Update Button */}
            <button
              type="submit"
              className={`font-bold text-[13px] px-6 py-2.5 rounded-xl transition-all cursor-pointer text-white ${
                editingId
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-[0_4px_0_#047857] active:shadow-[0_1px_0_#047857] active:translate-y-[3px]'
                  : 'bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-[0_4px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[3px]'
              }`}
            >
              {editingId ? 'Update Expense Record' : 'Save Expense Record'}
            </button>

            {/* Cancel Edit Button */}
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[13px] px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bottom Section: School Expenses Log History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-[16px] font-bold text-sky-700 tracking-wide">
          School Expenses Log History
        </h2>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 text-[13px] text-slate-800 font-bold bg-slate-50">
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Expense Particulars</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Mode</th>
                  <th className="px-4 py-3.5">Amount Paid (₹)</th>
                  <th className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[13px] font-normal text-slate-800">
                {expensesList.length > 0 ? (
                  expensesList.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 transition ${editingId === item.id ? 'bg-amber-50/60' : ''}`}
                    >
                      <td className="px-4 py-3.5 text-slate-600 font-mono">
                        {formatDateForDisplay(item.date)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{item.particulars}</td>
                      <td className="px-4 py-3.5 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3.5 text-slate-600">{item.mode}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">₹{item.amount}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* 3D Edit Button */}
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-[13px] font-bold px-3.5 py-1.5 rounded-lg shadow-[0_3px_0_#0369a1] active:shadow-[0_1px_0_#0369a1] active:translate-y-[2px] transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          {/* 3D Delete Button */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-[13px] font-bold px-3.5 py-1.5 rounded-lg shadow-[0_3px_0_#9f1239] active:shadow-[0_1px_0_#9f1239] active:translate-y-[2px] transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[13px] text-slate-500">
                      No expense records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}