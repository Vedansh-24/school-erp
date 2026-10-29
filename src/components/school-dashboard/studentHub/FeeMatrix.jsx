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
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 font-sans flex flex-col h-full">
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-[18px] font-bold text-slate-800">
            Class-wise Category Breakdown & Manual Price Calculator
          </h2>
          <p className="text-[13px] text-slate-500 mt-1">
            Har class ke samne General, OBC, SC, ST ke Boys aur Girls ki sankhya dikhegi. Niche diye gaye per-student price daalne par category-wise aur Grand Total calculate hoga.
          </p>
        </div>
        <button
          onClick={fetchStudentsData}
          className="bg-gradient-to-b from-white to-slate-100 hover:from-slate-50 hover:to-slate-200 border border-slate-300 text-slate-700 text-[14px] px-4 py-2.5 rounded-lg font-bold shadow-[0_2px_0_#cbd5e1] active:shadow-[0_0_0_#cbd5e1] active:translate-y-[2px] transition cursor-pointer flex items-center gap-1.5"
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
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <table className="w-full text-center border-collapse text-[14px] whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                  <th className="py-3.5 px-4 text-left font-bold">Class</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold">General</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold">OBC</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold">SC</th>
                  <th colSpan="2" className="border-l border-slate-200 py-2.5 font-bold">ST</th>
                  <th className="border-l border-slate-200 py-3.5 px-4 font-bold">Total Students</th>
                </tr>
                <tr className="border-b border-slate-200 text-[12px] text-slate-400 bg-slate-50/50">
                  <th className="text-left pb-2.5"></th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium">Boy</th>
                  <th className="pb-2.5 font-medium">Girl</th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium">Boy</th>
                  <th className="pb-2.5 font-medium">Girl</th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium">Boy</th>
                  <th className="pb-2.5 font-medium">Girl</th>
                  <th className="border-l border-slate-200 pb-2.5 font-medium">Boy</th>
                  <th className="pb-2.5 font-medium">Girl</th>
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

                  return (
                    <tr key={cls} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 text-left font-bold text-slate-800">{cls}</td>
                      <td className="border-l border-slate-200 py-3.5 font-normal">{genBoy}</td>
                      <td className="py-3.5 font-normal">{genGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 font-normal">{obcBoy}</td>
                      <td className="py-3.5 font-normal">{obcGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 font-normal">{scBoy}</td>
                      <td className="py-3.5 font-normal">{scGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 font-normal">{stBoy}</td>
                      <td className="py-3.5 font-normal">{stGirl}</td>
                      <td className="border-l border-slate-200 py-3.5 font-bold text-sky-600">{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 font-bold bg-slate-50 text-slate-800">
                  <td className="py-3.5 px-4 text-left">TOTAL</td>
                  <td className="border-l border-slate-200 py-3.5">{getCategoryGenderTotal('General', 'Boy')}</td>
                  <td className="py-3.5">{getCategoryGenderTotal('General', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5">{getCategoryGenderTotal('OBC', 'Boy')}</td>
                  <td className="py-3.5">{getCategoryGenderTotal('OBC', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5">{getCategoryGenderTotal('SC', 'Boy')}</td>
                  <td className="py-3.5">{getCategoryGenderTotal('SC', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5">{getCategoryGenderTotal('ST', 'Boy')}</td>
                  <td className="py-3.5">{getCategoryGenderTotal('ST', 'Girl')}</td>
                  <td className="border-l border-slate-200 py-3.5 text-sky-600">{totalStudentsCount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-[14px] font-bold uppercase tracking-wider flex items-center gap-2 text-slate-800">
              <span>💰</span> Manual Price Multiplier & Category-wise Total Calculation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">General Price per Student (₹)</label>
                <input
                  type="number"
                  name="general"
                  value={prices.general}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">OBC Price per Student (₹)</label>
                <input
                  type="number"
                  name="obc"
                  value={prices.obc}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">SC Price per Student (₹)</label>
                <input
                  type="number"
                  name="sc"
                  value={prices.sc}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">ST Price per Student (₹)</label>
                <input
                  type="number"
                  name="st"
                  value={prices.st}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[14px] text-slate-800 outline-none focus:border-sky-500 shadow-sm font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm">
                <p className="text-[12px] font-medium text-slate-500">General Total:</p>
                <p className="text-[15px] font-bold text-sky-600 mt-0.5">₹{generalTotalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm">
                <p className="text-[12px] font-medium text-slate-500">OBC Total:</p>
                <p className="text-[15px] font-bold text-sky-600 mt-0.5">₹{obcTotalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm">
                <p className="text-[12px] font-medium text-slate-500">SC Total:</p>
                <p className="text-[15px] font-bold text-sky-600 mt-0.5">₹{scTotalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm">
                <p className="text-[12px] font-medium text-slate-500">ST Total:</p>
                <p className="text-[15px] font-bold text-sky-600 mt-0.5">₹{stTotalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 text-[14px]">
              <span className="text-slate-600 font-medium">
                Total Students Count: <strong className="text-slate-800 font-bold">{totalStudentsCount}</strong>
              </span>
              <span className="text-[16px] font-bold text-emerald-600">
                Grand Total Amount: ₹{grandTotalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}