'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SaaSBilling() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', branch: 'Delhi Public School, RJ', plan: 'Enterprise Plan', amount: '₹1,50,000', date: '01 Mar 2026', status: 'Paid' },
    { id: 'INV-2026-002', branch: "St. Xavier's, Mumbai", plan: 'Pro Annual', amount: '₹85,000', date: '28 Feb 2026', status: 'Paid' },
    { id: 'INV-2026-003', branch: 'Blue Heaven Kids Academy', plan: 'Basic Monthly', amount: '₹12,000', date: '25 Feb 2026', status: 'Pending' },
    { id: 'INV-2026-004', branch: 'Sunrise Model School', plan: 'Enterprise Plan', amount: '₹1,50,000', date: '10 Feb 2026', status: 'Overdue' },
  ]);

  // Fetch billing data from Supabase on mount
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saas_invoices')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          setInvoices(data);
        }
      } catch (err) {
        console.log('Using default mock billing data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const handleExportReport = () => {
    alert('Billing & Invoices report exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B3A6B] uppercase tracking-wide">SaaS Billing & Subscriptions</h1>
          <p className="text-sm font-semibold text-[#5C6B7A] mt-1">Track recurring revenue, invoicing, and subscription tier performance.</p>
        </div>
        <button 
          onClick={handleExportReport}
          className="bg-[#ED1C24] text-white text-xs font-bold px-5 py-2.5 rounded-lg border-b-4 border-[#a31217] active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center gap-2 uppercase tracking-wide w-fit cursor-pointer"
        >
          <Download size={16} strokeWidth={3} /> Export Billing Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] border-t-4 border-t-[#EC1E79] flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">Monthly Recurring Revenue</p>
            <h2 className="text-2xl font-black text-[#1A2332] mt-1">₹12,45,000</h2>
            <p className="text-[10px] font-bold text-[#2E7D4F] mt-1 uppercase">+14.2% from last month</p>
          </div>
          <div className="p-3 rounded-xl bg-[#EC1E79] text-white">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="p-5 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] border-t-4 border-t-[#00A99D] flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">Active Subscriptions</p>
            <h2 className="text-2xl font-black text-[#1A2332] mt-1">118 Clients</h2>
            <p className="text-[10px] font-bold text-[#5C6B7A] mt-1 uppercase">6 Trial accounts</p>
          </div>
          <div className="p-3 rounded-xl bg-[#00A99D] text-white">
            <CreditCard size={22} />
          </div>
        </div>

        <div className="p-5 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] border-t-4 border-t-[#ED1C24] flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A]">Pending Collection</p>
            <h2 className="text-2xl font-black text-[#1A2332] mt-1">₹1,62,000</h2>
            <p className="text-[10px] font-bold text-[#ED1C24] mt-1 uppercase">2 Overdue Invoices</p>
          </div>
          <div className="p-3 rounded-xl bg-[#ED1C24] text-white">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FA]/50 flex items-center justify-between">
          <h3 className="font-black text-sm text-[#1B3A6B] tracking-wide uppercase flex items-center gap-2">
            <CreditCard size={18} className="text-[#ED1C24]" /> Recent Invoices & Payments {loading && <span className="text-xs text-[#5C6B7A] font-normal">(Loading...)</span>}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white text-[#1B3A6B] border-b border-[#E2E8F0] uppercase font-bold text-[11px] tracking-wider">
                <th className="py-4 px-5">Invoice No & Branch</th>
                <th className="py-4 px-5">Subscription Plan</th>
                <th className="py-4 px-5">Billing Date</th>
                <th className="py-4 px-5">Total Amount</th>
                <th className="py-4 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#1A2332]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F5F7FA] transition-colors">
                  <td className="py-4 px-5">
                    <p className="font-black text-[#1B3A6B] text-sm">{inv.branch}</p>
                    <p className="text-[10px] font-bold text-[#5C6B7A] uppercase mt-0.5">{inv.id}</p>
                  </td>
                  <td className="py-4 px-5 font-bold text-[#5C6B7A]">{inv.plan}</td>
                  <td className="py-4 px-5 font-semibold text-[#5C6B7A]">{inv.date}</td>
                  <td className="py-4 px-5 font-black text-[#1A2332]">{inv.amount}</td>
                  <td className="py-4 px-5">
                    {inv.status === 'Paid' && (
                      <span className="px-2.5 py-1 bg-[#2E7D4F]/15 text-[#2E7D4F] border border-[#2E7D4F]/30 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> Paid
                      </span>
                    )}
                    {inv.status === 'Pending' && (
                      <span className="px-2.5 py-1 bg-[#FFD400]/20 text-[#D49000] border border-[#FFD400]/50 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                    {inv.status === 'Overdue' && (
                      <span className="px-2.5 py-1 bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/30 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                        <AlertCircle size={12} /> Overdue
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}