// File path: src/components/school-dashboard/FeeCollectionReceipt.jsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function FeeCollectionReceipt() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Receipt Modal State
  const [selectedReceiptTx, setSelectedReceiptTx] = useState(null);

  // Form States
  const [editingId, setEditingId] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [allocationMonth, setAllocationMonth] = useState('April 2026');
  const [manualReceiptNo, setManualReceiptNo] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  
  // Fee Plan State ('monthly', 'three', 'four', 'yearly')
  const [feePlanType, setFeePlanType] = useState('monthly');
  const [activeInstalmentGroup, setActiveInstalmentGroup] = useState('inst1');
  
  // Dynamic Month Checkboxes State
  const [selectedMonths, setSelectedMonths] = useState({
    'April': true, 'May': false, 'Jun': false, 'July': false,
    'August': false, 'September': false, 'October': false, 'November': false,
    'December': false, 'January': false, 'February': false, 'March': false,
  });

  // Single Fee Amount & Penalty State
  const [feeAmount, setFeeAmount] = useState('1000');
  const [penaltyAmount, setPenaltyAmount] = useState('15');
  
  const [filterDate, setFilterDate] = useState('');

  const classList = [
    'PP.3+', 'PP.4+', 'PP.5+',
    'First', 'Second', 'Third', 'Fourth', 'Fifth',
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    'Eleventh', 'Twelfth'
  ];

  // UUID Format Checking Helper Function
  const isValidUUID = (str) => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(String(str).trim());
  };

  // Helper function to format YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Helper function to accurately get Student Details
  const getStudentDetails = (tx) => {
    if (!tx) return { name: 'N/A', father: 'N/A', sr: 'N/A' };
    
    const matched = students.find(s => 
      (s.id && String(s.id) === String(tx.student_id)) ||
      (s.student_id && String(s.student_id) === String(tx.student_id)) ||
      (s.sr_no && String(s.sr_no) === String(tx.sr_no)) ||
      (s.sr_no && String(s.sr_no) === String(tx.student_id)) ||
      (s.id && String(s.id) === String(tx.sr_no))
    );

    const name = matched
      ? (matched.student_full_name || matched.student_name || matched.name || matched.full_name)
      : (tx.student_name || tx.student_full_name || 'Student');

    const father = matched
      ? (matched.father_name || matched.father_full_name || matched.father_name_en)
      : 'N/A';

    const sr = matched?.sr_no || tx.sr_no || 'N/A';

    return { name, father, sr };
  };

  const getAllocationMonthsList = () => {
    if (feePlanType === 'monthly') {
      return [
        'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026',
        'September 2026', 'October 2026', 'November 2026', 'December 2026',
        'January 2027', 'February 2027', 'March 2027'
      ];
    } else if (feePlanType === 'three') {
      return [
        'April 2026 - July 2026 (1st Instalment)',
        'August 2026 - November 2026 (2nd Instalment)',
        'December 2026 - March 2027 (3rd Instalment)'
      ];
    } else if (feePlanType === 'four') {
      return [
        'April 2026 - June 2026 (1st Instalment)',
        'July 2026 - September 2026 (2nd Instalment)',
        'October 2026 - December 2026 (3rd Instalment)',
        'January 2027 - March 2027 (4th Instalment)'
      ];
    } else if (feePlanType === 'yearly') {
      return ['Full Session 2026-2027 (Yearly Plan)'];
    }
    return ['Full Session 2026-2027'];
  };

  useEffect(() => {
    fetchStudents();
    fetchTransactions();
  }, [filterDate]);

  const handleFeePlanChange = (plan) => {
    setFeePlanType(plan);
    setActiveInstalmentGroup('inst1'); 
    let newMonths = {
      'April': false, 'May': false, 'Jun': false, 'July': false,
      'August': false, 'September': false, 'October': false, 'November': false,
      'December': false, 'January': false, 'February': false, 'March': false
    };

    if (plan === 'monthly') {
      newMonths['April'] = true;
      setAllocationMonth('April 2026');
    } else if (plan === 'three') {
      newMonths['April'] = true; newMonths['May'] = true; newMonths['Jun'] = true; newMonths['July'] = true;
      setAllocationMonth('April 2026 - July 2026 (1st Instalment)');
    } else if (plan === 'four') {
      newMonths['April'] = true; newMonths['May'] = true; newMonths['Jun'] = true;
      setAllocationMonth('April 2026 - June 2026 (1st Instalment)');
    } else if (plan === 'yearly') {
      Object.keys(newMonths).forEach(k => newMonths[k] = true);
      setAllocationMonth('Full Session 2026-2027 (Yearly Plan)');
    }

    setSelectedMonths(newMonths);
    calculateFees(newMonths);
  };

  const handleMonthCheckboxToggle = (monthName) => {
    if (feePlanType === 'monthly') {
      let updatedMonths = {
        'April': false, 'May': false, 'Jun': false, 'July': false,
        'August': false, 'September': false, 'October': false, 'November': false,
        'December': false, 'January': false, 'February': false, 'March': false
      };
      
      updatedMonths[monthName] = true;
      setSelectedMonths(updatedMonths);
      
      const yearStr = ['January', 'February', 'March'].includes(monthName) ? '2027' : '2026';
      setAllocationMonth(`${monthName} ${yearStr}`);
      calculateFees(updatedMonths);
    }
  };

  const handleInstalmentGroupSelect = (groupKey) => {
    setActiveInstalmentGroup(groupKey);
    let updatedMonths = { ...selectedMonths };
    
    if (feePlanType === 'three') {
      Object.keys(updatedMonths).forEach(k => updatedMonths[k] = false);
      if (groupKey === 'inst1') { 
        updatedMonths['April'] = true; updatedMonths['May'] = true; updatedMonths['Jun'] = true; updatedMonths['July'] = true; 
        setAllocationMonth('April 2026 - July 2026 (1st Instalment)');
      }
      if (groupKey === 'inst2') { 
        updatedMonths['August'] = true; updatedMonths['September'] = true; updatedMonths['October'] = true; updatedMonths['November'] = true; 
        setAllocationMonth('August 2026 - November 2026 (2nd Instalment)');
      }
      if (groupKey === 'inst3') { 
        updatedMonths['December'] = true; updatedMonths['January'] = true; updatedMonths['February'] = true; updatedMonths['March'] = true; 
        setAllocationMonth('December 2026 - March 2027 (3rd Instalment)');
      }
    } else if (feePlanType === 'four') {
      Object.keys(updatedMonths).forEach(k => updatedMonths[k] = false);
      if (groupKey === 'inst1') { 
        updatedMonths['April'] = true; updatedMonths['May'] = true; updatedMonths['Jun'] = true; 
        setAllocationMonth('April 2026 - June 2026 (1st Instalment)');
      }
      if (groupKey === 'inst2') { 
        updatedMonths['July'] = true; updatedMonths['August'] = true; updatedMonths['September'] = true; 
        setAllocationMonth('July 2026 - September 2026 (2nd Instalment)');
      }
      if (groupKey === 'inst3') { 
        updatedMonths['October'] = true; updatedMonths['November'] = true; updatedMonths['December'] = true; 
        setAllocationMonth('October 2026 - December 2026 (3rd Instalment)');
      }
      if (groupKey === 'inst4') { 
        updatedMonths['January'] = true; updatedMonths['February'] = true; updatedMonths['March'] = true; 
        setAllocationMonth('January 2027 - March 2027 (4th Instalment)');
      }
    }

    setSelectedMonths(updatedMonths);
    calculateFees(updatedMonths);
  };

  const calculateFees = (monthsObj) => {
    const activeCount = Object.values(monthsObj).filter(Boolean).length;
    let basePerMonthFee = 1000;
    let calculatedAmount = activeCount * basePerMonthFee;
    
    setPenaltyAmount((activeCount * 15).toString());
    setFeeAmount(calculatedAmount.toString());
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase.from('fee_collections').select('*').order('created_at', { ascending: false });
      
      if (filterDate) {
        query = query.eq('receipt_date', filterDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching fee collections:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    setSelectedStudentId('');
    const filtered = students.filter(s => {
      const studentClass = s.class_name || s.class || s.student_class || '';
      return studentClass.toString().trim().toLowerCase() === cls.trim().toLowerCase();
    });
    setFilteredStudents(filtered);
  };

  const handleSaveReceipt = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudentId) {
      alert('Please select Class and Student!');
      return;
    }

    const currentStudent = students.find(s => 
      String(s.id) === String(selectedStudentId) || 
      String(s.student_id) === String(selectedStudentId) || 
      String(s.sr_no) === String(selectedStudentId)
    );
    
    const mainFee = parseFloat(feeAmount) || 0;
    const pAmount = parseFloat(penaltyAmount) || 0;
    const totalPaidVal = mainFee + pAmount;

    let tuitionVal = 0, i1 = 0, i2 = 0, i3 = 0, i4 = 0;
    if (feePlanType === 'monthly' || feePlanType === 'yearly') {
      tuitionVal = mainFee;
    } else {
      if (activeInstalmentGroup === 'inst1') i1 = mainFee;
      else if (activeInstalmentGroup === 'inst2') i2 = mainFee;
      else if (activeInstalmentGroup === 'inst3') i3 = mainFee;
      else if (activeInstalmentGroup === 'inst4') i4 = mainFee;
    }

    let studentUuid = null;
    if (isValidUUID(currentStudent?.id)) {
      studentUuid = currentStudent.id;
    } else if (isValidUUID(currentStudent?.student_id)) {
      studentUuid = currentStudent.student_id;
    } else if (isValidUUID(selectedStudentId)) {
      studentUuid = selectedStudentId;
    }

    const srNoVal = currentStudent?.sr_no 
      ? String(currentStudent.sr_no) 
      : (!isValidUUID(selectedStudentId) ? String(selectedStudentId) : null);

    const txData = {
      receipt_no: manualReceiptNo || Math.floor(1000 + Math.random() * 9000).toString(),
      student_id: studentUuid,
      sr_no: srNoVal,
      class_name: selectedClass,
      allocation_month: allocationMonth,
      receipt_date: receiptDate,
      payment_mode: paymentMode,
      tuition_fee_amount: tuitionVal,
      penalty_amount: pAmount,
      installment_1_amount: i1,
      installment_2_amount: i2,
      installment_3_amount: i3,
      installment_4_amount: i4,
      total_paid: totalPaidVal,
      session: currentStudent?.session || '2026-2027'
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('fee_collections').update(txData).eq('id', editingId);
        if (error) throw error;
        alert('Fee Receipt Updated Successfully!');
        setEditingId(null);
      } else {
        const { error } = await supabase.from('fee_collections').insert([txData]);
        if (error) throw error;
        alert('Fee Receipt Generated & Saved Successfully!');
      }
      
      setFeeAmount('1000');
      setPenaltyAmount('15');
      setManualReceiptNo('');
      setSelectedStudentId('');
      fetchTransactions();
    } catch (err) {
      console.error('Error saving transaction:', err.message);
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setSelectedClass(tx.class_name);
    
    const filtered = students.filter(s => {
      const studentClass = s.class_name || s.class || s.student_class || '';
      return studentClass.toString().trim().toLowerCase() === tx.class_name.trim().toLowerCase();
    });
    setFilteredStudents(filtered);

    setSelectedStudentId(tx.student_id || tx.sr_no || '');
    setAllocationMonth(tx.allocation_month || 'April 2026');
    setManualReceiptNo(tx.receipt_no);
    setReceiptDate(tx.receipt_date);
    setPaymentMode(tx.payment_mode || 'Cash');
    
    const existingMainFee = (tx.tuition_fee_amount || 0) + 
                            (tx.installment_1_amount || 0) + 
                            (tx.installment_2_amount || 0) + 
                            (tx.installment_3_amount || 0) + 
                            (tx.installment_4_amount || 0);
    setFeeAmount(existingMainFee.toString());
    setPenaltyAmount(tx.penalty_amount || '0');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      try {
        const { error } = await supabase.from('fee_collections').delete().eq('id', id);
        if (error) throw error;
        fetchTransactions();
      } catch (err) {
        alert('Delete Error: ' + err.message);
      }
    }
  };

  const handleOpenReceiptModal = (tx) => {
    setSelectedReceiptTx(tx);
  };

  const handleWhatsAppShare = (tx) => {
    const { name, father, sr } = getStudentDetails(tx);
    const formattedDate = formatDate(tx.receipt_date);
    
    const tuitionPaid = (tx.tuition_fee_amount || 0) + 
                        (tx.installment_1_amount || 0) + 
                        (tx.installment_2_amount || 0) + 
                        (tx.installment_3_amount || 0) + 
                        (tx.installment_4_amount || 0);
    const penaltyPaid = tx.penalty_amount || 0;
    const modeDisplay = tx.payment_mode === 'Cash' ? 'Cash (नकद)' : tx.payment_mode;

    const msg = `🧾 *BLUE HEAVEN KIDS ACADEMY*
*TUITION FEE OFFICIAL RECEIPT*
_________________________________________
• *Receipt No:* ${tx.receipt_no}      • *Date:* ${formattedDate}
• *Period/Month:* ${tx.allocation_month}
• *Student Name:* ${name}
• *Father Name:* ${father}
• *Class:* ${tx.class_name} | *SR No:* ${sr}
_________________________________________
*Fee Details:*
• Tuition / Instalment Fee: ₹${tuitionPaid}
• Late Fine / Penalty: ₹${penaltyPaid}
• *Payment Mode:* ${modeDisplay}
_________________________________________
*TOTAL AMOUNT RECEIVED:* ₹${tx.total_paid}
*REMAINING DUE:* ₹0
_________________________________________
Thank you!
*Blue Heaven Kids Academy, Jaipur*`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrintReceiptCard = () => {
    window.print();
  };

  const getFeeLabel = () => {
    if (feePlanType === 'monthly' || feePlanType === 'yearly') return 'Tuition Fee Amount (₹)';
    if (activeInstalmentGroup === 'inst1') return '1st Instalment Amount (₹)';
    if (activeInstalmentGroup === 'inst2') return '2nd Instalment Amount (₹)';
    if (activeInstalmentGroup === 'inst3') return '3rd Instalment Amount (₹)';
    if (activeInstalmentGroup === 'inst4') return '4th Instalment Amount (₹)';
    return 'Fee Amount (₹)';
  };

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 md:p-8 shadow-md space-y-6 text-slate-800 font-sans flex flex-col h-full">
      
      {/* CSS for printing ONLY the Receipt Modal */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #receipt-modal-printable, #receipt-modal-printable * { visibility: visible !important; }
          #receipt-modal-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Section */}
      <div className="no-print pb-3 border-b border-slate-200">
        <h2 className="text-[20px] md:text-[24px] font-extrabold text-sky-900 tracking-wide">
          Fee Deposit Receipt & Instalment Collection System
        </h2>
        <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
          Blue Heaven Kids Academy Portal
        </p>
      </div>

      {/* Fee Deposit Form Section */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 md:p-8 shadow-sm space-y-5">
        <h3 className="text-[15px] font-extrabold text-slate-800 tracking-wide flex items-center justify-between">
          <span>{editingId ? '✏️ Edit Fee Receipt Entry' : '➕ New Fee / Instalment Collection Entry'}</span>
          {editingId && (
            <button 
              type="button"
              onClick={() => { 
                setEditingId(null); 
                setFeePlanType('monthly');
                setFeeAmount('1000'); 
                setPenaltyAmount('15');
                setSelectedStudentId(''); 
              }}
              className="text-[13px] bg-slate-200 hover:bg-slate-300 active:translate-y-0.5 text-slate-700 px-4 py-1 rounded-xl cursor-pointer font-bold shadow-sm transition-all"
            >
              Cancel Edit
            </button>
          )}
        </h3>

        {/* Plan & Month Selection Box */}
        <div className="bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200 rounded-2xl p-5 space-y-5">
          <label className="block text-[14px] font-extrabold text-sky-900 text-center md:text-left">
            📊 Allocation Month / Fee Plan Selection:
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div 
              onClick={() => handleFeePlanChange('monthly')}
              className={`px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center shadow-[0_4px_0_#0284c7] active:translate-y-[3px] active:shadow-none ${feePlanType === 'monthly' ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 border-cyan-300 text-white font-extrabold scale-[1.01]' : 'bg-gradient-to-r from-sky-50 to-cyan-50 border-sky-200 text-sky-900 font-bold hover:border-sky-400'}`}
            >
              <span className="text-[15px] tracking-wide">Monthly Plan</span>
              <span className="text-[11px] opacity-90">{feePlanType === 'monthly' ? '✓ Selected' : 'Click'}</span>
            </div>

            <div 
              onClick={() => handleFeePlanChange('three')}
              className={`px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center shadow-[0_4px_0_#7c3aed] active:translate-y-[3px] active:shadow-none ${feePlanType === 'three' ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-purple-300 text-white font-extrabold scale-[1.01]' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-900 font-bold hover:border-purple-400'}`}
            >
              <span className="text-[15px] tracking-wide">Three Instalment</span>
              <span className="text-[11px] opacity-90">{feePlanType === 'three' ? '✓ Selected' : 'Click'}</span>
            </div>

            <div 
              onClick={() => handleFeePlanChange('four')}
              className={`px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center shadow-[0_4px_0_#059669] active:translate-y-[3px] active:shadow-none ${feePlanType === 'four' ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-green-700 border-emerald-300 text-white font-extrabold scale-[1.01]' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900 font-bold hover:border-emerald-400'}`}
            >
              <span className="text-[15px] tracking-wide">Four Instalment</span>
              <span className="text-[11px] opacity-90">{feePlanType === 'four' ? '✓ Selected' : 'Click'}</span>
            </div>

            <div 
              onClick={() => handleFeePlanChange('yearly')}
              className={`px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center shadow-[0_4px_0_#d97706] active:translate-y-[3px] active:shadow-none ${feePlanType === 'yearly' ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 border-amber-300 text-white font-extrabold scale-[1.01]' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-900 font-bold hover:border-amber-400'}`}
            >
              <span className="text-[15px] tracking-wide">Yearly Plan</span>
              <span className="text-[11px] opacity-90">{feePlanType === 'yearly' ? '✓ Selected' : 'Click'}</span>
            </div>

          </div>

          {feePlanType === 'three' && (
            <div className="flex flex-wrap gap-3 pt-2 pb-1 items-center justify-center">
              <span className="text-[13px] font-extrabold text-indigo-900 w-full text-center md:w-auto">Select Instalment Period:</span>
              <button type="button" onClick={() => handleInstalmentGroupSelect('inst1')} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:translate-y-0.5 ${activeInstalmentGroup === 'inst1' ? 'bg-indigo-900 text-white shadow-inner' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>1st Inst (Apr-Jul)</button>
              <button type="button" onClick={() => handleInstalmentGroupSelect('inst2')} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:translate-y-0.5 ${activeInstalmentGroup === 'inst2' ? 'bg-indigo-900 text-white shadow-inner' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>2nd Inst (Aug-Nov)</button>
              <button type="button" onClick={() => handleInstalmentGroupSelect('inst3')} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:translate-y-0.5 ${activeInstalmentGroup === 'inst3' ? 'bg-indigo-900 text-white shadow-inner' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>3rd Inst (Dec-Mar)</button>
            </div>
          )}

          {feePlanType === 'four' && (
            <div className="flex flex-wrap gap-3 pt-2 pb-1 items-center justify-center">
              <span className="text-[13px] font-extrabold text-emerald-900 w-full text-center md:w-auto">Select Instalment Period:</span>
              <button type="button" onClick={() => handleInstalmentGroupSelect('inst1')} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:translate-y-0.5 ${activeInstalmentGroup === 'inst1' ? 'bg-emerald-900 text-white shadow-inner' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>1st Inst (Apr-Jun)</button>
              <button type="button" onClick={() => handleInstalmentGroupSelect('inst2')} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:translate-y-0.5 ${activeInstalmentGroup === 'inst2' ? 'bg-emerald-900 text-white shadow-inner' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>2nd Inst (Jul-Sep)</button>
              <button type="button" onClick={() => handleInstalmentGroupSelect('inst3')} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:translate-y-0.5 ${activeInstalmentGroup === 'inst3' ? 'bg-emerald-900 text-white shadow-inner' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>3rd Inst (Oct-Dec)</button>
              <button type="button" onClick={() => handleInstalmentGroupSelect('inst4')} className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer active:translate-y-0.5 ${activeInstalmentGroup === 'inst4' ? 'bg-emerald-900 text-white shadow-inner' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>4th Inst (Jan-Mar)</button>
            </div>
          )}

          <div className="pt-2">
            <p className="text-[13px] font-extrabold text-slate-700 mb-2.5 text-center md:text-left">
              {feePlanType === 'monthly' ? 'Click on the exact month you want to collect fee for:' : feePlanType === 'yearly' ? 'All months selected for Annual/Yearly Plan:' : 'Auto-selected months based on chosen instalment:'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.keys(selectedMonths).map((mKey) => (
                <label key={mKey} onClick={() => handleMonthCheckboxToggle(mKey)} className={`flex items-center space-x-2.5 bg-white border-2 px-3 py-2 rounded-xl text-[13px] font-bold shadow-sm transition ${feePlanType === 'monthly' ? 'cursor-pointer hover:border-sky-500 hover:bg-sky-50/50' : 'cursor-default opacity-90 border-slate-200'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedMonths[mKey]} 
                    onChange={() => {}} 
                    disabled={feePlanType !== 'monthly'}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span className={selectedMonths[mKey] ? 'text-sky-900 font-extrabold' : 'text-slate-600'}>{mKey} {selectedMonths[mKey] && '✓'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveReceipt} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 items-end pt-2">
          
          <div>
            <label className="block text-[13px] font-extrabold text-slate-700 mb-1.5">Select Class *</label>
            <select 
              value={selectedClass} 
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-bold cursor-pointer"
              required
            >
              <option value="">-- Select Class --</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-slate-700 mb-1.5">
              Select Student ({filteredStudents.length}) *
            </label>
            <select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-bold cursor-pointer"
              required
            >
              <option value="">-- Select Student --</option>
              {filteredStudents.map((s) => {
                const sId = s.id || s.student_id || s.sr_no;
                const sName = s.student_full_name || s.student_name || s.name || s.full_name || 'Student Name';
                const sSr = s.sr_no || s.student_id || 'N/A';
                return (
                  <option key={sId} value={sId}>
                    {sName} (SR: {sSr})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-slate-700 mb-1.5">Allocation Month / Plan Period</label>
            <select 
              value={allocationMonth} 
              onChange={(e) => setAllocationMonth(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-bold cursor-pointer"
            >
              {getAllocationMonthsList().map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-slate-700 mb-1.5">Receipt No.</label>
            <input 
              type="text" 
              placeholder="Auto / Manual"
              value={manualReceiptNo}
              onChange={(e) => setManualReceiptNo(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-slate-700 mb-1.5">Receipt Date</label>
            <input 
              type="date" 
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-bold cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-slate-700 mb-1.5">Payment Mode</label>
            <select 
              value={paymentMode} 
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-bold cursor-pointer"
            >
              <option value="Cash">Cash (नकद)</option>
              <option value="UPI / Online">UPI / Online</option>
              <option value="Cheque / Bank">Cheque / Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-sky-900 mb-1.5">{getFeeLabel()}</label>
            <input 
              type="number" 
              placeholder="Amount"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="w-full bg-slate-50 border-2 border-sky-300 rounded-xl px-4 py-2 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-[13px] font-extrabold text-slate-700 mb-1.5">Penalty Amount (₹)</label>
            <input 
              type="number" 
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm font-bold"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <label className="block text-[13px] font-extrabold text-emerald-800 mb-1.5">Total Payable (₹)</label>
            <input 
              type="number" 
              value={(parseFloat(feeAmount) || 0) + (parseFloat(penaltyAmount) || 0)}
              disabled
              className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 py-2 text-[15px] text-emerald-900 font-extrabold outline-none shadow-sm cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-2 lg:col-span-3 pt-3 flex justify-end">
            <button 
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-extrabold rounded-2xl px-10 py-3 text-[15px] shadow-[0_4px_0_#065f46] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="text-lg">💾</span> {editingId ? 'Update Receipt' : 'Save & Generate Receipt'}
            </button>
          </div>

        </form>
      </div>

      {/* Transactions List Table Section */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <h3 className="text-[16px] font-extrabold text-slate-800 tracking-wide">
            Fee Collection Transactions List
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-extrabold text-slate-700">Filter Date:</span>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-50 border-2 border-slate-200 text-slate-800 text-[13px] rounded-xl px-4 py-1.5 outline-none focus:border-sky-500 shadow-sm font-bold cursor-pointer"
            />
            
            <button 
              onClick={fetchTransactions}
              className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-extrabold px-4 py-2 rounded-xl text-[13px] shadow-[0_3px_0_#0369a1] active:translate-y-[2px] active:shadow-none hover:brightness-110 cursor-pointer transition-all"
            >
              🔍 Search
            </button>

            <button 
              onClick={() => setFilterDate('')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold px-4 py-2 rounded-xl text-[13px] shadow-[0_3px_0_#c2410c] active:translate-y-[2px] active:shadow-none hover:brightness-110 cursor-pointer transition-all"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-[14px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-100 text-slate-900 font-extrabold">
                <th className="p-3.5">Receipt No</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Class</th>
                <th className="p-3.5">Month/Session</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5">Fee Breakup</th>
                <th className="p-3.5">Total Paid</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500 font-bold text-[15px]">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 font-bold text-[15px]">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const { name } = getStudentDetails(tx);
                  const feeAmt = (tx.tuition_fee_amount || 0) + 
                                 (tx.installment_1_amount || 0) + 
                                 (tx.installment_2_amount || 0) + 
                                 (tx.installment_3_amount || 0) + 
                                 (tx.installment_4_amount || 0);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-extrabold text-sky-800">{tx.receipt_no}</td>
                      <td className="p-3.5 text-slate-700 font-bold">{formatDate(tx.receipt_date)}</td>
                      <td className="p-3.5 font-extrabold uppercase text-slate-900">
                        {name}
                      </td>
                      <td className="p-3.5 text-slate-700 font-bold">{tx.class_name}</td>
                      <td className="p-3.5 text-slate-600 font-semibold">{tx.allocation_month}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-[12px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {tx.payment_mode}
                        </span>
                      </td>
                      <td className="p-3.5 text-indigo-800 font-bold text-[12px]">
                        <div>Fee Amount: ₹{feeAmt}</div>
                        {tx.penalty_amount > 0 && <div className="text-rose-600">Penalty: ₹{tx.penalty_amount}</div>}
                      </td>
                      <td className="p-3.5 font-extrabold text-emerald-600 text-[15px]">₹{tx.total_paid}</td>
                      
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button 
                            onClick={() => handleOpenReceiptModal(tx)} 
                            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-[12px] shadow-[0_2px_0_#115e59] active:translate-y-[2px] active:shadow-none hover:brightness-110 cursor-pointer whitespace-nowrap flex items-center gap-1 transition-all"
                          >
                            🖨️ Print
                          </button>

                          <button 
                            onClick={() => handleWhatsAppShare(tx)} 
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-[12px] shadow-[0_2px_0_#15803d] active:translate-y-[2px] active:shadow-none hover:brightness-110 cursor-pointer whitespace-nowrap flex items-center gap-1 transition-all"
                          >
                            📲 WhatsApp
                          </button>

                          <button 
                            onClick={() => handleEdit(tx)} 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-[12px] shadow-[0_2px_0_#3730a3] active:translate-y-[2px] active:shadow-none hover:brightness-110 cursor-pointer whitespace-nowrap transition-all"
                          >
                            ✏️ Edit
                          </button>

                          <button 
                            onClick={() => handleDelete(tx.id)} 
                            className="bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-[12px] shadow-[0_2px_0_#991b1b] active:translate-y-[2px] active:shadow-none hover:brightness-110 cursor-pointer whitespace-nowrap transition-all"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Fee Receipt Popup Modal */}
      {selectedReceiptTx && (() => {
        const { name, father, sr } = getStudentDetails(selectedReceiptTx);

        const tuitionPaid = (selectedReceiptTx.tuition_fee_amount || 0) + 
                            (selectedReceiptTx.installment_1_amount || 0) + 
                            (selectedReceiptTx.installment_2_amount || 0) + 
                            (selectedReceiptTx.installment_3_amount || 0) + 
                            (selectedReceiptTx.installment_4_amount || 0);
        const penaltyPaid = selectedReceiptTx.penalty_amount || 0;
        const totalReceived = selectedReceiptTx.total_paid || (tuitionPaid + penaltyPaid);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div 
              id="receipt-modal-printable" 
              className="bg-white border-2 border-slate-900 rounded-3xl shadow-2xl max-w-[620px] w-full overflow-hidden text-slate-900 flex flex-col my-auto"
            >
              <div className="p-6 md:p-8 space-y-5">
                <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                  <h1 className="text-[22px] md:text-[25px] font-black tracking-tight text-slate-950 uppercase">
                    BLUE HEAVEN KIDS ACADEMY
                  </h1>
                  <p className="text-[13px] font-extrabold text-slate-700">
                    Dev Nagar, Benad Road, Jaipur
                  </p>
                  <h2 className="text-[17px] font-black text-slate-950 underline decoration-2 underline-offset-4 tracking-wide pt-1">
                    TUITION FEE OFFICIAL RECEIPT
                  </h2>
                  <p className="text-[13px] font-bold text-slate-800 pt-0.5">
                    Academic Session: <span className="font-extrabold text-slate-950">{selectedReceiptTx.session || '2026–2027'}</span> | For Period/Month: <span className="font-extrabold text-slate-950">{selectedReceiptTx.allocation_month}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between font-black text-[15px] text-slate-950 px-1 border-b border-slate-300 pb-2">
                  <div>Receipt No: <span className="text-sky-950 font-black">{selectedReceiptTx.receipt_no}</span></div>
                  <div>Date: <span className="font-black">{formatDate(selectedReceiptTx.receipt_date)}</span></div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-4 text-[14px] grid grid-cols-2 gap-y-2 font-bold text-slate-900">
                  <div>
                    Student Name: <span className="uppercase font-black text-slate-950">{name}</span>
                  </div>
                  <div>
                    Class: <span className="font-black text-slate-950">{selectedReceiptTx.class_name}</span>
                  </div>
                  <div>
                    Father Name: <span className="uppercase font-black text-slate-950">{father}</span>
                  </div>
                  <div>
                    SR. No: <span className="font-black text-slate-950">{sr}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-300 mt-1">
                    Payment Mode: <span className="font-black text-slate-950">{selectedReceiptTx.payment_mode}</span>
                  </div>
                </div>

                <div className="border-2 border-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[14px]">
                    <thead>
                      <tr className="bg-[#1e293b] text-white font-black uppercase text-[13px]">
                        <th className="p-3 border-r border-slate-700">PARTICULARS / HEADS ({selectedReceiptTx.allocation_month})</th>
                        <th className="p-3 text-right w-[150px]">AMOUNT (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-800 font-bold text-slate-950">
                      <tr>
                        <td className="p-3 border-r-2 border-slate-800 font-extrabold">Tuition Fee / Instalment Deposit</td>
                        <td className="p-3 text-right font-black text-[15px]">₹{tuitionPaid}</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-r-2 border-slate-800 font-extrabold">Late Fine / Penalty Paid</td>
                        <td className="p-3 text-right font-black text-[15px]">₹{penaltyPaid}</td>
                      </tr>
                      <tr className="bg-slate-200 font-black text-[15px]">
                        <td className="p-3 border-r-2 border-slate-800">TOTAL AMOUNT RECEIVED:</td>
                        <td className="p-3 text-right text-emerald-900 font-black text-[16px]">₹{totalReceived}</td>
                      </tr>
                      <tr className="bg-slate-100 font-black text-[14px]">
                        <td className="p-3 border-r-2 border-slate-800">REMAINING TUITION FEE DUE:</td>
                        <td className="p-3 text-right text-rose-700 font-black">₹0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-8 flex items-end justify-between text-[12px] font-extrabold text-slate-700">
                  <div>Computer Generated Receipt</div>
                  <div className="text-center border-t-2 border-slate-900 pt-1 w-[170px] text-slate-950 font-black">
                    Authorized Cashier
                  </div>
                </div>

              </div>

              <div className="no-print bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button 
                  onClick={handlePrintReceiptCard}
                  className="flex-1 min-w-[160px] bg-sky-600 hover:bg-sky-500 active:translate-y-0.5 text-white font-black px-4 py-2.5 rounded-xl text-[13px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  🖨️ Print A4 Half Receipt
                </button>

                <button 
                  onClick={() => handleWhatsAppShare(selectedReceiptTx)}
                  className="flex-1 min-w-[150px] bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-black px-4 py-2.5 rounded-xl text-[13px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  📲 Share WhatsApp
                </button>

                <button 
                  onClick={() => setSelectedReceiptTx(null)}
                  className="bg-rose-600 hover:bg-rose-500 active:translate-y-0.5 text-white font-black px-5 py-2.5 rounded-xl text-[13px] shadow-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}