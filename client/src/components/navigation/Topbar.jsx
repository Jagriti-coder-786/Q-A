import React, { useState } from 'react';
import {
  Menu,
  Search,
  Mic,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Shield,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSpace } from '../../context/SpaceContext.jsx';
import { Badge } from '../common/Badge.jsx';

export function Topbar({ onOpenSidebar, onOpenVoice, onOpenSearch, onOpenCreateSpace }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { spaces, currentSpace, setCurrentSpace } = useSpace();
  const [isSpaceMenuOpen, setIsSpaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070A13]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu & Knowledge Space Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#131A2A] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Space Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSpaceMenuOpen(!isSpaceMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#0D1220] hover:bg-slate-100 dark:hover:bg-[#131A2A] transition text-xs font-medium text-slate-800 dark:text-[#F8FAFC] shadow-2xs"
          >
            <div className="w-2 h-2 rounded-full bg-[#22D3EE] shadow-sm shadow-[#22D3EE]/50 animate-pulse" />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">
              {currentSpace?.name || 'All Knowledge Spaces'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSpaceMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsSpaceMenuOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-[#64748B] uppercase tracking-wider">
                  Knowledge Spaces
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {spaces.map((space) => {
                    const isSelected = (space._id || space.id) === (currentSpace?._id || currentSpace?.id);
                    return (
                      <button
                        key={space._id || space.id}
                        onClick={() => {
                          setCurrentSpace(space);
                          setIsSpaceMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[#6D5EF7]/10 text-[#6D5EF7] dark:text-[#A78BFA] font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#131A2A]'
                        }`}
                      >
                        <span className="truncate">{space.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {space.documentCount || 0} docs
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-1 px-1">
                  <button
                    onClick={() => {
                      setIsSpaceMenuOpen(false);
                      if (onOpenCreateSpace) onOpenCreateSpace();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-[#6D5EF7] dark:text-[#A78BFA] hover:bg-[#6D5EF7]/10 flex items-center gap-2"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    New Knowledge Space
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center/Right: Global Search, Voice Assistant, Theme Toggle & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button / trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#0D1220] text-slate-500 dark:text-[#94A3B8] text-xs hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-[#F8FAFC] transition shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search documents, notes...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#131A2A] border border-slate-200 dark:border-slate-700/80 text-[10px] text-[#22D3EE] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Voice Assistant Button */}
        <button
          onClick={onOpenVoice}
          title="Voice Assistant (Hindi / English / Hinglish)"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#131A2A] border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <Mic className="w-4 h-4 text-[#6D5EF7] dark:text-[#A78BFA]" />
          <span className="hidden md:inline">Voice</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#131A2A] border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#131A2A] transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D5EF7] to-[#22D3EE] text-white font-semibold flex items-center justify-center text-xs shadow-sm ring-2 ring-slate-800/80">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800/90 shadow-2xl py-2 z-30">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/70">
                  <div className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                    {user?.email}
                  </div>
                  <div className="mt-2">
                    <Badge variant="brand" size="xs">
                      {user?.plan?.toUpperCase()} PLAN
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
