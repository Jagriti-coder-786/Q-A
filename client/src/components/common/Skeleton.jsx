import React from 'react';

export function Skeleton({ className = '', variant = 'rectangular' }) {
  const base = "animate-pulse bg-slate-200/70 dark:bg-[#131A2A] rounded-lg";
  const variants = {
    rectangular: "",
    circular: "rounded-full",
    text: "h-3.5 rounded"
  };

  return <div className={`${base} ${variants[variant]} ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton variant="circular" className="w-6 h-6" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function DocumentListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/70 bg-white dark:bg-[#0D1220] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40 sm:w-56" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
