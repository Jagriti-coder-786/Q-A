import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]/40 focus:ring-offset-1 focus:ring-offset-[#070A13] disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-[#6D5EF7] hover:bg-[#5B4DE0] text-white shadow-sm border border-[#A78BFA]/30 hover:border-[#A78BFA]/60",
    secondary: "bg-[#0D1220] dark:bg-[#0D1220] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#131A2A] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm",
    outline: "bg-transparent text-[#6D5EF7] dark:text-[#A78BFA] border border-[#6D5EF7]/30 hover:bg-[#6D5EF7]/10 hover:border-[#6D5EF7]/60",
    accent: "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 hover:bg-[#22D3EE]/20 hover:border-[#22D3EE]/60",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#131A2A] hover:text-slate-900 dark:hover:text-slate-100",
    danger: "bg-rose-600/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600/30 transition-colors"
  };

  const sizes = {
    xs: "text-[11px] px-2 py-1 gap-1 rounded-md",
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5 font-semibold"
  };

  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      whileHover={disabled || isLoading ? undefined : { scale: 1.01 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </motion.button>
  );
}
