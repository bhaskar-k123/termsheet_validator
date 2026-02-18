import { AlertTriangle, File, FileWarning, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    title: "Critical compliance issue detected",
    document: "Acme Corp - Series A",
    severity: "critical",
    timestamp: "10:23 AM",
    message: "Missing required regulatory disclosures in section 4.2.",
  },
  {
    id: 2,
    title: "Unusual term detected",
    document: "TechStart Inc - Seed Round",
    severity: "warning",
    timestamp: "Yesterday",
    message: "Non-standard liquidation preference terms identified.",
  },
  {
    id: 3,
    title: "Potential conflict detected",
    document: "Global Finance - Term Sheet",
    severity: "warning",
    timestamp: "Yesterday",
    message: "Conflicting statements between sections 2.1 and 3.4.",
  },
  {
    id: 4,
    title: "Failed validation",
    document: "Innovate LLC - Investment",
    severity: "critical",
    timestamp: "Aug 12",
    message: "Document format not recognized. Manual review required.",
  },
];

export default function RecentAlerts() {
  return (
    <div className="sleek-card bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden h-full flex flex-col">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
            <AlertCircle className="h-6 w-6 text-white/40" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white tracking-tight">Incident Stream</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Critical event orchestration</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-4 flex-1">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group relative overflow-hidden",
              alert.severity === "critical"
                ? "bg-red-500/5 border-red-500/10 hover:border-red-500/20 hover:bg-red-500/10"
                : "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/20 hover:bg-amber-500/10"
            )}
          >
            <div className="flex items-start gap-6 relative z-10">
              <div className={cn(
                "p-3 rounded-2xl border transition-all duration-500",
                alert.severity === "critical" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              )}>
                {alert.severity === "critical" ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-white transition-colors">{alert.title}</h4>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    {alert.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-3 w-3 text-white/20" />
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                    {alert.document}
                  </span>
                </div>
                <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors leading-relaxed line-clamp-2">{alert.message}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className={cn(
                    "px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all",
                    alert.severity === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    {alert.severity}
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-white/40 transition-all" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
