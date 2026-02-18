import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface ValidationItem {
  status: string;
  confidence: number;
}

interface ValidationSummaryProps {
  validations: ValidationItem[];
}

export default function ValidationSummary({ validations }: ValidationSummaryProps) {
  const totalTerms = validations.length || 1;
  const validatedTerms = validations.filter(v => v.status === "validated").length;
  const errorTerms = validations.filter(v => v.status === "error").length;
  const warningTerms = validations.filter(v => v.status === "warning").length;

  const averageConfidence = totalTerms > 0
    ? Math.round(validations.reduce((sum, v) => sum + v.confidence, 0) / (validations.length || 1))
    : 0;

  const items = [
    {
      title: "Integrity Index",
      value: `${Math.round((validatedTerms / totalTerms) * 100)}%`,
      icon: <CheckCircle2 size={20} />,
      description: "Validated compliance",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Critical Drift",
      value: `${Math.round((errorTerms / totalTerms) * 100)}%`,
      icon: <AlertCircle size={20} />,
      description: "Binding violations",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      title: "Anomaly Rate",
      value: `${Math.round((warningTerms / totalTerms) * 100)}%`,
      icon: <AlertTriangle size={20} />,
      description: "Semantic warnings",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Extract Precision",
      value: `${averageConfidence}%`,
      icon: <ShieldCheck size={20} />,
      description: "Heuristic confidence",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    }
  ];

  return (
    <>
      {items.map((item, i) => (
        <div
          key={i}
          className="sleek-card p-8 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500 group"
        >
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className={cn(
                "p-3 rounded-2xl border border-white/5 group-hover:scale-110 group-hover:bg-white/5 transition-all duration-500",
                "bg-white/[0.02]"
              )}>
                {React.cloneElement(item.icon, { className: cn("text-white/40 group-hover:text-white transition-colors") })}
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase",
                item.bg, item.color
              )}>
                Live Pulse
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
                {item.title}
              </p>
              <p className="text-4xl font-bold tracking-tight text-white leading-tight">
                {item.value}
              </p>
            </div>

            <p className="text-[10px] font-medium text-white/10 group-hover:text-white/20 uppercase tracking-[0.15em] border-t border-white/5 pt-4 transition-colors">
              — {item.description}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
