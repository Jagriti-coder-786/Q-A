import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070A13] text-slate-900 dark:text-[#F8FAFC] overflow-hidden">
      {/* Subtle Aurora Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#6D5EF7]/15 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#6D5EF7] text-white flex items-center justify-center font-bold shadow-sm shadow-[#6D5EF7]/30 transition group-hover:scale-105">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-[#F8FAFC]">DocuMind OS</span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
          Professional AI Document Intelligence & Research Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#0D1220] py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800/90">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

