import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("sleek-card p-6 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500 group h-full", className)}>
      <div className="flex flex-col h-full justify-between gap-6">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
            {icon && React.cloneElement(icon as React.ReactElement, { size: 20, className: "text-white/40 group-hover:text-white transition-colors" })}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all duration-500",
              trend.isPositive ? "bg-green-500/10 text-green-500 group-hover:bg-green-500/20" : "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
            )}>
              {trend.isPositive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">{title}</p>
          <p className="text-4xl font-bold tracking-tight text-white leading-none">{value}</p>
        </div>

        {description && (
          <p className="text-[11px] font-medium text-white/20 uppercase tracking-wide border-t border-white/5 pt-4 group-hover:text-white/30 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">{description}</p>
        )}
      </div>
    </div>
  );
}
