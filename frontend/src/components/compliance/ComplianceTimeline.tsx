import { CheckCircle2, AlertCircle, Clock, ChevronRight, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const timelineEvents = [
  { id: "1", date: "Jul 15, 2023", title: "Review Complete", description: "85% alignment achieved", status: "complete", user: "Protocol Alpha", time: "14:32" },
  { id: "2", date: "Jul 15, 2023", title: "Critical Vulnerability", description: "Binding terms exceed threshold", status: "issue", user: "Heuristic Engine", time: "14:35" },
  { id: "3", date: "Jul 16, 2023", title: "Mitigation Applied", description: "Liquidation cascade revised", status: "resolved", user: "Sarah Williams", time: "10:15" },
];

export default function ComplianceTimeline() {
  return (
    <div className="sleek-card bg-white/[0.01] border border-white/5 overflow-hidden flex flex-col group">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
            <History className="h-7 w-7 text-white/40 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Audit Chronology</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mt-1">Immutable governance ledger</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Sequence Active</span>
        </div>
      </div>

      <div className="p-10 relative">
        <div className="absolute top-0 bottom-0 left-[55px] w-px bg-white/5 group-hover:bg-white/10 transition-colors" />

        <div className="space-y-16">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-24 group/item"
            >
              <div
                className={cn(
                  "absolute left-[40px] top-0 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 z-10",
                  event.status === "complete" || event.status === "resolved" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                    event.status === "issue" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-white/5 text-white/40 border-white/10"
                )}
              >
                {event.status === "complete" || event.status === "resolved" ? <CheckCircle2 className="h-4 w-4" /> :
                  event.status === "issue" ? <AlertCircle className="h-4 w-4" /> :
                    <Clock className="h-4 w-4" />}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <time className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover/item:text-white/40 transition-colors">
                      {event.date} <span className="mx-2 opacity-20">//</span> {event.time}
                    </time>
                    <div className={cn(
                      "px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest",
                      event.status === "complete" || event.status === "resolved" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                        "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                      {event.status}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest italic group-hover/item:text-white/20 transition-colors">{event.user}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white tracking-tight">{event.title}</h4>
                  <p className="text-[11px] font-medium text-white/40 leading-relaxed max-w-lg uppercase tracking-wide">{event.description}</p>
                </div>

                {event.status === "issue" && (
                  <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all w-fit">
                    INVESTIGATE NODE <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
