import ComplianceChecklist from "@/components/compliance/ComplianceChecklist";
import ComplianceTimeline from "@/components/compliance/ComplianceTimeline";
import RiskMatrix from "@/components/compliance/RiskMatrix";
import RegulatoryFrameworks from "@/components/compliance/RegulatoryFrameworks";
import { Shield, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Compliance() {
  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            Governance <span className="text-white/40">& Risk</span>
          </motion.h1>
          <p className="text-lg text-white/40 font-medium max-w-2xl">
            Real-time regulatory alignment and vulnerability monitoring for your assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">System Compliant</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="sleek-card p-1 bg-white/[0.01] border border-white/5">
            <div className="p-8">
              <ComplianceChecklist />
            </div>
          </div>
          <div className="sleek-card p-1 bg-white/[0.01] border border-white/5">
            <div className="p-8">
              <ComplianceTimeline />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="sleek-card p-10 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 h-full flex flex-col group">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                <Activity className="h-7 w-7 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Health Aggregate</h3>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Heuristic score distribution</p>
              </div>
            </div>

            <div className="space-y-10 flex-1">
              {[
                { label: "Financial Disclosures", value: 85, color: "bg-white" },
                { label: "Legal Requirements", value: 92, color: "bg-white" },
                { label: "Risk Disclosures", value: 78, color: "bg-red-500" }
              ].map((m, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
                    <span>{m.label}</span>
                    <span className="tabular-nums text-white/60 font-bold">{m.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn("h-full transition-all duration-1000 rounded-full", m.color)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center group/btn cursor-pointer">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest group-hover/btn:text-white transition-colors">View detailed breakdown</span>
              <ChevronRight size={18} className="text-white/10 group-hover/btn:text-white transition-all transform group-hover/btn:translate-x-1" />
            </div>
          </div>

          <RiskMatrix />
          <RegulatoryFrameworks />
        </div>
      </div>
    </div>
  );
}
