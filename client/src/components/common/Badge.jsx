import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'sm', dot = false, className = '' }) {
  const variants = {
    neutral: "bg-[#0D1220] text-slate-300 border-slate-700/50",
    brand: "bg-[#6D5EF7]/10 text-[#A78BFA] border-[#6D5EF7]/30",
    accent: "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/25"
  };

  const dotColors = {
    neutral: "bg-slate-400",
    brand: "bg-[#A78BFA]",
    accent: "bg-[#22D3EE]",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-sky-400"
  };

  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5 font-medium rounded tracking-wide",
    sm: "text-xs px-2 py-0.5 font-medium rounded-md",
    md: "text-sm px-2.5 py-1 font-medium rounded-md"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border ${variants[variant] || variants.neutral} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral} animate-pulse`} />
      )}
      {children}
    </span>
  );
}
