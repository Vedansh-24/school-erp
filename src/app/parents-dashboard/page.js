'use client';

import { useRouter } from 'next/navigation';
import ParentsPortalOverview from '@/components/parents-portal/ParentsPortalOverview';

export default function ParentsDashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header with Logout Button */}
        <div className="flex justify-between items-center bg-white border border-slate-300 p-5 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-sky-900 tracking-wide uppercase">
              Parents Access Portal
            </h1>
            <p className="text-xs text-slate-600 font-medium">Student Progress, Homework & Updates</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 transition hover:bg-rose-100 cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Parents Portal Overview Component */}
        <ParentsPortalOverview />

      </div>
    </main>
  );
}