'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/staff-dashboard/Sidebar';
import Header from '@/components/staff-dashboard/Header';
import StatsCard from '@/components/staff-dashboard/StatsCard';
import QuickActions from '@/components/staff-dashboard/QuickActions';
import ClassSchedule from '@/components/staff-dashboard/ClassSchedule';
import NoticesCard from '@/components/staff-dashboard/NoticesCard';
import AttendanceView from '@/components/staff-dashboard/AttendanceView';
import HomeworkView from '@/components/staff-dashboard/HomeworkView';
import TimetableView from '@/components/staff-dashboard/TimetableView';

export default function StaffDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-slate-100 flex font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Top Header */}
        <Header />

        {/* Dynamic Body based on Active Tab */}
        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <>
              <StatsCard />
              <QuickActions setActiveTab={setActiveTab} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ClassSchedule />
                </div>
                <div>
                  <NoticesCard />
                </div>
              </div>
            </>
          )}

          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'homework' && <HomeworkView />}
          {activeTab === 'timetable' && <TimetableView />}
          {activeTab === 'reports' && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
              <h3 className="text-xl font-bold text-white mb-2">Student Reports Portal</h3>
              <p className="text-sm">Exam grades and performance analytics module coming soon.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}