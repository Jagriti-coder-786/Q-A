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

  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Knowledge Spaces', to: '/app/spaces', icon: FolderKanban },
    { label: 'Documents', to: '/app/documents', icon: Files },
    { label: 'Chat & Reasoning', to: '/app/chat', icon: MessageSquare },
    { label: 'Study Hub', to: '/app/study', icon: GraduationCap },
    { label: 'Document Compare', to: '/app/compare', icon: Scale },
    { label: 'Notes & Highlights', to: '/app/notes', icon: Highlighter },
    { label: 'Analytics', to: '/app/analytics', icon: BarChart3 },
    { label: 'Team', to: '/app/team', icon: Users },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  const storageUsedMB = Math.round((user?.storageUsedBytes || 48 * 1024 * 1024) / (1024 * 1024));
  const storageLimitMB = Math.round((user?.storageLimitBytes || 2 * 1024 * 1024 * 1024) / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((storageUsedMB / (storageLimitMB || 1)) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                DocuMind
              </span>
              <span className="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400 ml-1.5 px-1 py-0.5 bg-brand-50 dark:bg-brand-950/80 rounded">
                AI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Storage & Usage Footer Widget */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" /> Storage
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {storageUsedMB} MB / {storageLimitMB} MB
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{user?.plan?.toUpperCase() || 'PRO'} Plan</span>
              <span>{user?.aiQueryCount || 0} / {user?.aiQueryLimit || 500} Qs</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
