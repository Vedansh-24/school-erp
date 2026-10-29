'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Globe, Mail, Shield, Save, Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SystemConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [platformName, setPlatformName] = useState('SaaS ERP Enterprise');
  const [masterDomain, setMasterDomain] = useState('https://app.saaserp.com');
  const [supportEmail, setSupportEmail] = useState('support@saaserp.com');
  const [paymentSecret, setPaymentSecret] = useState('rzp_live_secret_key_9812739182');
  const [smsApiKey, setSmsApiKey] = useState('sms_api_key_849182391238');
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);

  // Fetch settings from Supabase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .limit(1)
          .single();

        if (data) {
          setPlatformName(data.platform_name || 'SaaS ERP Enterprise');
          setMasterDomain(data.master_domain || 'https://app.saaserp.com');
          setSupportEmail(data.support_email || 'support@saaserp.com');
          setPaymentSecret(data.payment_secret || 'rzp_live_secret_key_9812739182');
          setSmsApiKey(data.sms_api_key || 'sms_api_key_849182391238');
          setSmtpHost(data.smtp_host || 'smtp.mailgun.org');
          setMaintenanceMode(data.maintenance_mode ?? false);
          setAllowRegistrations(data.allow_registrations ?? true);
        }
      } catch (err) {
        console.log('Using default configuration state.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save Settings to Supabase
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const payload = {
        platform_name: platformName,
        master_domain: masterDomain,
        support_email: supportEmail,
        payment_secret: paymentSecret,
        sms_api_key: smsApiKey,
        smtp_host: smtpHost,
        maintenance_mode: maintenanceMode,
        allow_registrations: allowRegistrations,
        updated_at: new Date()
      };

      // Check if a row already exists
      const { data: existing, error: fetchError } = await supabase.from('system_settings').select('id').limit(1);
      
      if (fetchError) {
        throw new Error("Table check error: " + fetchError.message);
      }

      let error;
      if (existing && existing.length > 0) {
        const res = await supabase.from('system_settings').update(payload).eq('id', existing[0].id);
        error = res.error;
      } else {
        const res = await supabase.from('system_settings').insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      alert('Master settings saved successfully to Supabase!');
    } catch (err) {
      console.error('Error saving settings:', err);
      // अब पॉप-अप में असली रीज़न साफ़-साफ़ दिखेगा
      alert('Failed to save settings: ' + (err.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B3A6B] uppercase tracking-wide">Global System Configurations</h1>
          <p className="text-sm font-semibold text-[#5C6B7A] mt-1">Manage API keys, system branding, SMTP details, and platform defaults.</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="bg-[#00A99D] text-white text-xs font-bold px-5 py-2.5 rounded-lg border-b-4 border-[#006e66] active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center gap-2 uppercase tracking-wide w-fit cursor-pointer disabled:opacity-50"
        >
          <Save size={16} strokeWidth={3} /> {saving ? 'Saving...' : 'Save Master Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General SaaS Info */}
        <div className="p-6 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] space-y-4">
          <h3 className="font-black text-sm text-[#1B3A6B] tracking-wide uppercase flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Globe size={18} className="text-[#00AEEF]" /> Platform Identity & Domain
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-[#5C6B7A]">SaaS Platform Name</label>
              <input 
                type="text" 
                value={platformName} 
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs font-semibold bg-[#F5F7FA] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#00AEEF]" 
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-[#5C6B7A]">Primary Master Domain</label>
              <input 
                type="text" 
                value={masterDomain} 
                onChange={(e) => setMasterDomain(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs font-semibold bg-[#F5F7FA] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#00AEEF]" 
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-[#5C6B7A]">Support Email Address</label>
              <input 
                type="email" 
                value={supportEmail} 
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs font-semibold bg-[#F5F7FA] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#00AEEF]" 
              />
            </div>
          </div>
        </div>

        {/* API Integration Settings */}
        <div className="p-6 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF] space-y-4">
          <h3 className="font-black text-sm text-[#1B3A6B] tracking-wide uppercase flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Cpu size={18} className="text-[#EC1E79]" /> API Gateways & Credentials
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-[#5C6B7A]">Payment Gateway Secret (Razorpay/Stripe)</label>
              <input 
                type="password" 
                value={paymentSecret} 
                onChange={(e) => setPaymentSecret(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs font-semibold bg-[#F5F7FA] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#00AEEF]" 
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-[#5C6B7A]">SMS Gateway API Key</label>
              <input 
                type="password" 
                value={smsApiKey} 
                onChange={(e) => setSmsApiKey(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs font-semibold bg-[#F5F7FA] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#00AEEF]" 
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-[#5C6B7A]">SMTP Server Host</label>
              <input 
                type="text" 
                value={smtpHost} 
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs font-semibold bg-[#F5F7FA] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#00AEEF]" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Global Toggles */}
      <div className="p-6 rounded-xl shadow-sm border border-[#E2E8F0] bg-[#FFFFFF]">
        <h3 className="font-black text-sm text-[#1B3A6B] tracking-wide uppercase flex items-center gap-2 border-b border-[#E2E8F0] pb-3 mb-4">
          <Shield size={18} className="text-[#FFD400]" /> Master System Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 bg-[#F5F7FA] rounded-lg border border-[#E2E8F0]">
            <div>
              <p className="font-bold text-xs text-[#1A2332]">Maintenance Mode</p>
              <p className="text-[10px] text-[#5C6B7A] font-semibold">Disable user logins during upgrades</p>
            </div>
            <input 
              type="checkbox" 
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 accent-[#ED1C24] cursor-pointer" 
            />
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[#F5F7FA] rounded-lg border border-[#E2E8F0]">
            <div>
              <p className="font-bold text-xs text-[#1A2332]">Allow New Branch Registrations</p>
              <p className="text-[10px] text-[#5C6B7A] font-semibold">Enable self-signup for prospective clients</p>
            </div>
            <input 
              type="checkbox" 
              checked={allowRegistrations}
              onChange={(e) => setAllowRegistrations(e.target.checked)}
              className="w-4 h-4 accent-[#00A99D] cursor-pointer" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}