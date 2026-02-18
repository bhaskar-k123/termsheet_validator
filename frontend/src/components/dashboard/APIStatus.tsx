import { Check, AlertTriangle, Zap, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const apiStatus = [
  {
    name: "Document Processing API",
    status: "operational",
    uptime: 99.98,
    responseTime: 245,
    lastChecked: "2 min ago",
  },
  {
    name: "Financial Terms Extraction",
    status: "operational",
    uptime: 99.95,
    responseTime: 320,
    lastChecked: "3 min ago",
  },
  {
    name: "Compliance Validation",
    status: "operational",
    uptime: 100,
    responseTime: 180,
    lastChecked: "1 min ago",
  },
  {
    name: "Notification Service",
    status: "degraded",
    uptime: 98.2,
    responseTime: 450,
    lastChecked: "5 min ago",
  },
];

const apiCalls = [
  { endpoint: "/api/validate", status: "success", time: "12:32:45", duration: "0.24s" },
  { endpoint: "/api/extract/terms", status: "success", time: "12:30:12", duration: "0.31s" },
  { endpoint: "/api/compliance/check", status: "success", time: "12:28:53", duration: "0.18s" },
  { endpoint: "/api/notifications/send", status: "error", time: "12:25:37", duration: "1.2s" },
];

export default function APIStatus() {
  return (
    <div className="sleek-card bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden h-full flex flex-col">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
            <Server className="h-6 w-6 text-white/40" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white tracking-tight">System Integrity</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">API health orchestration</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 flex-1">
        <div className="space-y-4">
          {apiStatus.map((api, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-500 group">
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors tracking-tight">{api.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest leading-none">
                    {api.uptime}% Uptime
                  </span>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">
                    {api.responseTime}ms
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
                  {api.lastChecked}
                </span>
                <div className={cn(
                  "px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all",
                  api.status === "operational" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {api.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 leading-none">Transaction Stream</h4>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
          <div className="space-y-2">
            {apiCalls.map((call, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center border",
                    call.status === "success" ? "bg-white/5 border-white/10 text-white/20" : "bg-red-500/10 border-red-500/20 text-red-500"
                  )}>
                    {call.status === "success" ? <Check size={12} /> : <AlertTriangle size={12} />}
                  </div>
                  <span className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">{call.endpoint}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest group-hover:text-white/30">{call.time}</span>
                  <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{call.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
