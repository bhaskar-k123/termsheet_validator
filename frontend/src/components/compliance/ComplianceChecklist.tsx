import { useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const complianceItems = [
  {
    section: "Disclosure Architecture",
    items: [
      { id: "1.1", requirement: "Financial Term Definition", status: "compliant", details: "Terms indexed in registry v2.1", riskLevel: "low" },
      { id: "1.2", requirement: "Valuation Metrology", status: "compliant", details: "Derived from standard ISO vectors", riskLevel: "low" },
      { id: "1.3", requirement: "Capital Structure Accuracy", status: "warning", details: "Incomplete post-money calculus detected", riskLevel: "medium" },
    ],
  },
  {
    section: "Institutional Entitlements",
    items: [
      { id: "2.1", requirement: "Pro-rata Rights Allocation", status: "compliant", details: "Indexed in Section 3.2", riskLevel: "low" },
      { id: "2.2", requirement: "Liquidation Cascade Protocol", status: "violation", details: "Exceeds regulatory bounds for retail exposure", riskLevel: "high", regulation: "SEC Rule 10b-5" },
    ],
  },
];

export default function ComplianceChecklist() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Disclosure Architecture": true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {complianceItems.map((section, idx) => (
        <div key={section.section} className="sleek-card overflow-hidden bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-500">
          <div
            className={cn(
              "p-6 cursor-pointer flex items-center justify-between transition-colors hover:bg-white/[0.03]",
              expandedSections[section.section] ? "border-b border-white/5" : ""
            )}
            onClick={() => toggleSection(section.section)}
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                <ShieldCheck className="h-6 w-6 text-white/40" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white tracking-tight">{section.section}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  {section.items.filter(item => item.status === "compliant").length} / {section.items.length} Points Verified
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/20 hover:text-white transition-all">
              {expandedSections[section.section] ? <p className="rotate-180 transition-transform"><ChevronDown size={18} /></p> : <ChevronDown size={18} />}
            </div>
          </div>

          <AnimatePresence>
            {expandedSections[section.section] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="p-6 space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all duration-500",
                        item.status === "compliant" ? "bg-white/[0.02] border-white/5" :
                          item.status === "warning" ? "bg-amber-500/5 border-amber-500/10" :
                            "bg-red-500/5 border-red-500/10"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-5">
                          <div className="mt-1">
                            {item.status === "compliant" ? <CheckCircle2 className="h-5 w-5 text-green-500/60" /> :
                              item.status === "warning" ? <AlertTriangle className="h-5 w-5 text-amber-500/60" /> :
                                <AlertCircle className="h-5 w-5 text-red-500/60" />}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-semibold text-white tracking-tight">{item.requirement}</span>
                            <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest">{item.details}</span>
                            {item.regulation && (
                              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                Violation: {item.regulation}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest",
                          item.riskLevel === "low" ? "bg-white/5 text-white/40 border-white/10" :
                            item.riskLevel === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {item.riskLevel} Risk
                        </div>
                      </div>

                      {item.status !== "compliant" && (
                        <div className="mt-6 flex justify-end">
                          <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all font-bold text-[9px] uppercase tracking-widest text-white/60">
                            Mitigate Vulnerability
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
