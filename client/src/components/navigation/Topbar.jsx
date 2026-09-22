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
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu & Knowledge Space Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Space Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSpaceMenuOpen(!isSpaceMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="truncate max-w-[160px] sm:max-w-[220px]">
              {currentSpace?.name || 'Select Knowledge Space'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isSpaceMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsSpaceMenuOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                        className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="truncate">{space.name}</span>
                        <span className="text-xs text-slate-400">
                          {space.documentCount || 0} docs
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-1">
                  <button
                    onClick={() => {
                      setIsSpaceMenuOpen(false);
                      if (onOpenCreateSpace) onOpenCreateSpace();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 flex items-center gap-2"
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
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search documents, notes...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Voice Assistant Button */}
        <button
          onClick={onOpenVoice}
          title="Voice Assistant (Hindi / English / Hinglish)"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <Mic className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="hidden md:inline">Voice</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center text-xs border border-slate-300 dark:border-slate-600">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-30">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
                    <LogOut className="w-4 h-4" />
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
