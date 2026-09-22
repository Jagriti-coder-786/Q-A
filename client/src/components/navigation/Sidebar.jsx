import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Files,
  MessageSquare,
  GraduationCap,
  Scale,
  Highlighter,
  BarChart3,
  Users,
  Settings,
  HardDrive,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const navCategories = [
    {
      name: 'WORKSPACE',
      items: [
        { label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
        { label: 'Spaces', to: '/app/spaces', icon: FolderKanban },
        { label: 'Documents', to: '/app/documents', icon: Files }
      ]
    },
    {
      name: 'INTELLIGENCE',
      items: [
        { label: 'AI Chat', to: '/app/chat', icon: MessageSquare },
        { label: 'Study', to: '/app/study', icon: GraduationCap },
        { label: 'Compare', to: '/app/compare', icon: Scale }
      ]
    },
    {
      name: 'PRODUCTIVITY',
      items: [
        { label: 'Notes', to: '/app/notes', icon: Highlighter },
        { label: 'Analytics', to: '/app/analytics', icon: BarChart3 },
        { label: 'Team', to: '/app/team', icon: Users }
      ]
    },
    {
      name: 'SYSTEM',
      items: [
        { label: 'Settings', to: '/app/settings', icon: Settings }
      ]
    }
  ];

  const rawBytes = user?.storageUsedBytes || 0;
  const storageUsedMB = (rawBytes / (1024 * 1024)).toFixed(1);
  const storageLimitMB = Math.round((user?.storageLimitBytes || 2 * 1024 * 1024 * 1024) / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((rawBytes / (user?.storageLimitBytes || 2 * 1024 * 1024 * 1024)) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#070A13]/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-[#0A0F1C] border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6D5EF7] text-white flex items-center justify-center font-bold shadow-sm shadow-[#6D5EF7]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                DocuMind
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] px-1.5 py-0.5 bg-[#6D5EF7]/10 rounded border border-[#6D5EF7]/20">
                OS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navCategories.map((category) => (
            <div key={category.name} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 dark:text-[#64748B] tracking-wider uppercase">
                {category.name}
              </div>
              {category.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => `
                    relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-slate-100 dark:bg-[#131A2A] text-[#6D5EF7] dark:text-[#F8FAFC] font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-[#6D5EF7] before:rounded-r'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#0D1220] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#6D5EF7] dark:text-[#A78BFA]' : 'text-slate-400 dark:text-[#64748B]'
                      }`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Storage & Usage Footer Widget */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/70 shrink-0 bg-slate-50/50 dark:bg-[#070A13]/50">
          <div className="p-3 rounded-xl bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#94A3B8] mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <HardDrive className="w-3.5 h-3.5 text-[#22D3EE]" /> Storage
              </span>
              <span className="font-semibold text-slate-800 dark:text-[#F8FAFC] text-[11px]">
                {storageUsedMB} / {storageLimitMB} MB
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-[#131A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6D5EF7] to-[#22D3EE] rounded-full transition-all duration-300"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-[#64748B]">
              <span className="font-semibold text-[#A78BFA] uppercase">{user?.plan || 'PRO'}</span>
              <span>{user?.aiQueryCount || 0} / {user?.aiQueryLimit || 500} queries</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
