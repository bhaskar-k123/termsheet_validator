import ValidationFilters from "@/components/validations/ValidationFilters";
import ValidationSummary from "@/components/validations/ValidationSummary";
import { Download, Search, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ValidationItem {
  term: string;
  extractedValue: string;
  expectedValue: string;
  confidence: number;
  status: string;
}

const mockValidations: ValidationItem[] = [
  { term: "Valuation", extractedValue: "$10M", expectedValue: "$10M", confidence: 95, status: "validated" },
  { term: "Amount", extractedValue: "$2M", expectedValue: "$2M", confidence: 98, status: "validated" },
  { term: "Price per share", extractedValue: "$1.25", expectedValue: "$1.25", confidence: 99, status: "validated" },
  { term: "Liquidation Preference", extractedValue: "1x", expectedValue: "1x", confidence: 85, status: "validated" },
  { term: "Vesting", extractedValue: "4 years", expectedValue: "4 years", confidence: 92, status: "validated" },
  { term: "Valuation", extractedValue: "$9M", expectedValue: "$10M", confidence: 60, status: "error" },
  { term: "Amount", extractedValue: "$1.8M", expectedValue: "$2M", confidence: 70, status: "warning" },
  { term: "Price per share", extractedValue: "$1.20", expectedValue: "$1.25", confidence: 75, status: "warning" },
  { term: "Liquidation Preference", extractedValue: "1.2x", expectedValue: "1x", confidence: 50, status: "error" },
  { term: "Vesting", extractedValue: "3 years", expectedValue: "4 years", confidence: 40, status: "error" },
];

export default function Validations() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredValidations = useMemo(() => {
    let filtered = mockValidations;
    if (selectedFilter !== "all") {
      filtered = filtered.filter(v => v.status === selectedFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(v => v.term.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [selectedFilter, searchTerm]);

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            Validation <span className="text-white/40">Protocol</span>
          </motion.h1>
          <p className="text-lg text-white/40 font-medium max-w-2xl">
            High-fidelity verification of extracted financial semantics and threshold monitoring.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold text-sm">
            <BarChart3 className="h-4 w-4 text-white/40" />
            <span>Heuristic Report</span>
          </button>

          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-black hover:scale-105 transition-all font-bold text-sm">
            <Download className="h-4 w-4" />
            <span>Export Artifacts</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        <ValidationSummary validations={filteredValidations} />
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-8 items-center px-8 py-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl mx-4">
          <ValidationFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Query semantic vectors..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10 text-white"
            />
          </div>
        </div>

        <div className="sleek-card bg-white/[0.01] border border-white/5 overflow-hidden mx-4">
          <div className="p-10 border-b border-white/5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Heuristic Analysis Grid</h2>
            <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest mt-2">Semantic drift & threshold monitoring</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-left px-10 py-6">Field Vector</th>
                  <th className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-left px-10 py-6">Extracted Value</th>
                  <th className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-left px-10 py-6">Golden Source</th>
                  <th className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-center px-10 py-6">Confidence Index</th>
                  <th className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-left px-10 py-6">Status</th>
                  <th className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-right px-10 py-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y border-white/5 divide-white/5 bg-transparent">
                <AnimatePresence mode="popLayout">
                  {filteredValidations.map((v, i) => (
                    <motion.tr
                      key={`${v.term}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-10 py-8">
                        <span className="text-sm font-semibold text-white tracking-tight">{v.term}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className={cn(
                          "inline-flex px-4 py-1.5 rounded-full border font-bold text-[10px] uppercase tracking-widest",
                          v.status === "error" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white border-white/10"
                        )}>
                          {v.extractedValue}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-[11px] font-semibold text-white/20 uppercase tracking-widest">{v.expectedValue || "N/A"}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-[10px] font-bold tabular-nums text-white/40 leading-none">{v.confidence}%</span>
                          <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${v.confidence}%` }}
                              className={cn(
                                "h-full transition-all duration-1000",
                                v.confidence > 90 ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" : v.confidence > 70 ? "bg-white/40" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                              )}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest",
                          v.status === "validated" ? "text-green-500 bg-green-500/10 border-green-500/20" :
                            v.status === "warning" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                              "text-red-500 bg-red-500/10 border-red-500/20"
                        )}>
                          {v.status === "validated" ? <CheckCircle2 size={12} /> :
                            v.status === "warning" ? <AlertTriangle size={12} /> :
                              <AlertCircle size={12} />}
                          {v.status}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
