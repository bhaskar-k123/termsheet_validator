import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

const riskItems = [
  { id: "1", term: "Liquidation Pref", value: "1.5x", riskLevel: "high", impact: "high", description: "Standard violation of Rule 10b-5", mitigation: "Align to 1x" },
  { id: "2", term: "Option Pool", value: "10% Post", riskLevel: "medium", impact: "medium", description: "Sub-market indexing detected", mitigation: "Adjust to 15%" },
  { id: "3", term: "Valuation Cap", value: "$10M Pre", riskLevel: "low", impact: "low", description: "Vector within market variance", mitigation: "None" },
];

export default function RiskMatrix() {
  return (
    <div className="sleek-card bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
            <Zap className="h-6 w-6 text-white/40" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white tracking-tight">Vulnerability Matrix</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Risk vector orchestration</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-4">
        {riskItems.map((item) => (
          <div key={item.id} className="relative group/item">
            <div className="relative p-6 rounded-[2rem] border border-white/5 group-hover/item:border-white/10 group-hover/item:bg-white/[0.03] transition-all duration-500 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]",
                  item.riskLevel === "high" ? "bg-red-500 shadow-red-500/20" : item.riskLevel === "medium" ? "bg-amber-500 shadow-amber-500/20" : "bg-white shadow-white/20"
                )} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white tracking-tight">{item.term}</span>
                  <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest leading-none">{item.value}</span>
                </div>
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all",
                item.riskLevel === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  item.riskLevel === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-white/5 text-white/40 border-white/10"
              )}>
                {item.riskLevel} Impact
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
