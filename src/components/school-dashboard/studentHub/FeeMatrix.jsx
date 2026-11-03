'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function FeeMatrix() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [prices, setPrices] = useState({
    general: '',
    obc: '',
    sc: '',
    st: '',
  });

  const classesList = [
    'PP.3+', 'PP.4+', 'PP.5+', 
    'First', 'Second', 'Third', 
    'Fourth', 'Fifth', 'Sixth', 
    'Seventh', 'Eight', 'Ninth', 'Tenth',
    'Eleventh (Arts)', 'Eleventh (Commerce)', 'Eleventh (Science)',
    'Twelth (Arts)', 'Twelth (Commerce)', 'Twelth (Science)'
  ];

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Data load karne me error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPrices((prev) => ({ ...prev, [name]: value }));
  };

  const getCount = (className, categoryKey, genderKey) => {
    return students.filter((s) => {
      // Class matching
      const studentClass = (s.class_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetClass = className.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchClass = studentClass === targetClass;

      // Category / Caste matching
      const rawCategory = Array.isArray(s.category)
        ? s.category.join(' ')
        : (s.category || s.caste || '');
      const matchCaste = rawCategory.toLowerCase().includes(categoryKey.toLowerCase());

      // Gender matching ('Male', 'Female', 'Boy', 'Girl' supports all)
      const rawGender = (s.gender || '').toLowerCase();
      const matchGender = genderKey === 'Boy' 
        ? (rawGender.includes('male') || rawGender.includes('boy') || rawGender.includes('छात्र') || rawGender === 'm')
        : (rawGender.includes('female') || rawGender.includes('girl') || rawGender.includes('छात्रा') || rawGender === 'f');
      
      return matchClass && matchCaste && matchGender;
    }).length;
  };

  const getClassTotalStudents = (className) => {
    return students.filter((s) => {
      const studentClass = (s.class_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetClass = className.toLowerCase().replace(/[^a-z0-9]/g, '');
      return studentClass === targetClass;
    }).length;
  };

  const getCategoryGenderTotal = (categoryKey, genderKey) => {
    return classesList.reduce((sum, cls) => sum + getCount(cls, categoryKey, genderKey), 0);
  };

  const totalStudentsCount = students.length;

  const totalGeneral = getCategoryGenderTotal('General', 'Boy') + getCategoryGenderTotal('General', 'Girl');
  const totalObc = getCategoryGenderTotal('OBC', 'Boy') + getCategoryGenderTotal('OBC', 'Girl');
  const totalSc = getCategoryGenderTotal('SC', 'Boy') + getCategoryGenderTotal('SC', 'Girl');
  const totalSt = getCategoryGenderTotal('ST', 'Boy') + getCategoryGenderTotal('ST', 'Girl');

  const generalTotalAmount = totalGeneral * (parseFloat(prices.general) || 0);
  const obcTotalAmount = totalObc * (parseFloat(prices.obc) || 0);
  const scTotalAmount = totalSc * (parseFloat(prices.sc) || 0);
  const stTotalAmount = totalSt * (parseFloat(prices.st) || 0);

  const grandTotalAmount = generalTotalAmount + obcTotalAmount + scTotalAmount + stTotalAmount;

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full overflow-x-hidden">
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-[16px] sm:text-[18px] font-bold text-slate-800">
            Class-wise Category Breakdown & Manual Price Calculator
          </h2>
          <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
            Har class ke samne General, OBC, SC, ST ke Boys aur Girls ki sankhya dikhegi. Niche diye gaye per-student price daalne par category-wise aur Grand Total calculate hoga.
          </p>
        </div>
        <button
          onClick={fetchStudentsData}
          className="w-full sm:w-auto bg-gradient-to-b from-white to-slate-100 hover:from-slate-50 hover:to-slate-200 border border-slate-300 text-slate-700 text-[14px] px-4 py-2.5 rounded-lg font-bold shadow-[0_2px_0_#cbd5e1] active:shadow-[0_0_0_#cbd5e1] active:translate-y-[2px] transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          🔄 Refresh Matrix
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[14px] text-slate-400 font-medium bg-white border border-slate-200 rounded-xl shadow-sm">
          Data load ho raha hai...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full">
            <table className="w-full text-center border-collapse text-[14px] whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                  <th className="py-3.5 px-4 text-left font-bold min-w-[160px]">Class</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold px-4">General</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold px-4">OBC</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold px-4">SC</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold px-4">ST</th>
                  <th className="border-l border-slate-200 py-3.5 px-5 font-bold min-w-[120px]">Total Students</th>
                </tr>
                <tr className="border-b border-slate-200 text-[12px] text-slate-400 bg-slate-50/50">
                  <th className="text-left pb-2.5"></th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium px-3">Boy</th>
                  <th className="pb-2.5 font-medium px-3">Girl</th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium px-3">Boy</th>
                  <th className="pb-2.5 font-medium px-3">Girl</th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium px-3">Boy</th>
                  <th className="pb-2.5 font-medium px-3">Girl</th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium px-3">Boy</th>
                  <th className="pb-2.5 font-medium px-3">Girl</th>
                  <th className="border-l border-slate-200 pb-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {classesList.map((cls) => {
                  const genBoy = getCount(cls, 'General', 'Boy');
                  const genGirl = getCount(cls, 'General', 'Girl');
                  const obcBoy = getCount(cls, 'OBC', 'Boy');
                  const obcGirl = getCount(cls, 'OBC', 'Girl');
                  const scBoy = getCount(cls, 'SC', 'Boy');
                  const scGirl = getCount(cls, 'SC', 'Girl');
                  const stBoy = getCount(cls, 'ST', 'Boy');
                  const stGirl = getCount(cls, 'ST', 'Girl');
                  const rowTotal = getClassTotalStudents(cls);

                  const formatClassName = (name) => {
                    if (name.includes('(')) {
                      const parts = name.split('(');
                      return (
                        <div className="flex flex-col">
                          <span className="font-bold">{parts[0].trim()}</span>
                          <span className="text-[11px] text-slate-500 font-semibold">({parts[1]}</span>
                        </div>
                      );
                    }
                    return <span className="font-bold text-slate-800">{name}</span>;
                  };

                  return (
                    <tr key={cls} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 text-left font-bold text-slate-800 min-w-[160px]">{formatClassName(cls)}</td>
                      <td className="border-l border-slate-200 py-3.5 px-3 font-normal">{genBoy}</td>
                      <td className="py-3.5 px-3 font-normal">{genGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 px-3 font-normal">{obcBoy}</td>
                      <td className="py-3.5 px-3 font-normal">{obcGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 px-3 font-normal">{scBoy}</td>
                      <td className="py-3.5 px-3 font-normal">{scGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 px-3 font-normal">{stBoy}</td>
                      <td className="py-3.5 px-3 font-normal">{stGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 px-5 font-bold text-sky-600 min-w-[120px]">{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 font-bold bg-slate-50 text-slate-800">
                  <td className="py-3.5 px-4 text-left min-w-[160px]">TOTAL</td>
                  <td className="border-l border-slate-200 py-3.5 px-3">{getCategoryGenderTotal('General', 'Boy')}</td>
                  <td className="py-3.5 px-3">{getCategoryGenderTotal('General', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5 px-3">{getCategoryGenderTotal('OBC', 'Boy')}</td>
                  <td className="py-3.5 px-3">{getCategoryGenderTotal('OBC', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5 px-3">{getCategoryGenderTotal('SC', 'Boy')}</td>
                  <td className="py-3.5 px-3">{getCategoryGenderTotal('SC', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5 px-3">{getCategoryGenderTotal('ST', 'Boy')}</td>
                  <td className="py-3.5 px-3">{getCategoryGenderTotal('ST', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5 px-5 text-sky-600 min-w-[120px]">{totalStudentsCount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="text-[14px] font-bold uppercase tracking-wider flex items-center gap-2 text-slate-800">
              <span>💰</span> Manual Price Multiplier & Category-wise Total Calculation
            </h3>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center flex flex-col items-center">
                <label className="block text-[12px] font-bold text-slate-700 mb-1 text-center h-[54px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-bold">General<br/>per Student<br/>(₹)</span>
                  <span className="hidden sm:inline">General Price per Student (₹)</span>
                </label>
                <input
                  type="number"
                  name="general"
                  value={prices.general}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal text-center mt-1"
                />
              </div>
              <div className="text-center flex flex-col items-center">
                <label className="block text-[12px] font-bold text-slate-700 mb-1 text-center h-[54px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-bold">OBC<br/>per Student<br/>(₹)</span>
                  <span className="hidden sm:inline">OBC Price per Student (₹)</span>
                </label>
                <input
                  type="number"
                  name="obc"
                  value={prices.obc}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal text-center mt-1"
                />
              </div>
              <div className="text-center flex flex-col items-center">
                <label className="block text-[12px] font-bold text-slate-700 mb-1 text-center h-[54px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-bold">SC<br/>per Student<br/>(₹)</span>
                  <span className="hidden sm:inline">SC Price per Student (₹)</span>
                </label>
                <input
                  type="number"
                  name="sc"
                  value={prices.sc}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal text-center mt-1"
                />
              </div>
              <div className="text-center flex flex-col items-center">
                <label className="block text-[12px] font-bold text-slate-700 mb-1 text-center h-[54px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-bold">ST<br/>per Student<br/>(₹)</span>
                  <span className="hidden sm:inline">ST Price per Student (₹)</span>
                </label>
                <input
                  type="number"
                  name="st"
                  value={prices.st}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal text-center mt-1"
                />
              </div>
            </div>

            {/* Total Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-[12px] font-medium text-slate-500 text-center h-[38px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-medium">General<br/>Total:</span>
                  <span className="hidden sm:inline">General Total:</span>
                </p>
                <p className="text-[15px] font-bold text-sky-600 mt-1 text-center">₹{generalTotalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-[12px] font-medium text-slate-500 text-center h-[38px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-medium">OBC<br/>Total:</span>
                  <span className="hidden sm:inline">OBC Total:</span>
                </p>
                <p className="text-[15px] font-bold text-sky-600 mt-1 text-center">₹{obcTotalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-[12px] font-medium text-slate-500 text-center h-[38px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-medium">SC<br/>Total:</span>
                  <span className="hidden sm:inline">SC Total:</span>
                </p>
                <p className="text-[15px] font-bold text-sky-600 mt-1 text-center">₹{scTotalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-[12px] font-medium text-slate-500 text-center h-[38px] sm:h-auto flex flex-col justify-center">
                  <span className="sm:hidden font-medium">ST<br/>Total:</span>
                  <span className="hidden sm:inline">ST Total:</span>
                </p>
                <p className="text-[15px] font-bold text-sky-600 mt-1 text-center">₹{stTotalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 text-[14px]">
              <span className="text-slate-600 font-medium">
                Total Students Count: <strong className="text-slate-800 font-bold">{totalStudentsCount}</strong>
              </span>
              <span className="text-[15px] sm:text-[16px] font-bold text-emerald-600">
                Grand Total Amount: ₹{grandTotalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}