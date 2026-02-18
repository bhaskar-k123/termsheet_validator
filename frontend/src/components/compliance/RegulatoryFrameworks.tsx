import { Lock, ShieldCheck, Globe, ChevronRight } from "lucide-react";

export default function RegulatoryFrameworks() {
  return (
    <div className="sleek-card bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
            <Lock className="h-6 w-6 text-white/40" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white tracking-tight">Standard Integrity</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Global regulatory baseline</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-4">
        {[
          { icon: <ShieldCheck className="h-5 w-5" />, label: "SEC Rule 10b-5", status: "Active" },
          { icon: <Globe className="h-5 w-5" />, label: "Basal IV Compliance", status: "Verified" },
          { icon: <Lock className="h-5 w-5" />, label: "MiFID II Standards", status: "Aligned" }
        ].map((f, i) => (
          <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 group/item cursor-pointer">
            <div className="flex items-center gap-5 text-white/60 group-hover/item:text-white transition-colors">
              <div className="opacity-40 group-hover/item:opacity-100 transition-opacity">{f.icon}</div>
              <span className="text-sm font-semibold tracking-tight">{f.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full group-hover/item:bg-white/10 group-hover/item:text-white transition-all">
                {f.status}
              </span>
              <ChevronRight className="h-4 w-4 text-white/10 group-hover/item:text-white/40 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
