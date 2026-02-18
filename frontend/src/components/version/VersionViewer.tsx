import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScannedDocument } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function diffTerms(prevTerms: any[], currTerms: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevMap = new Map(prevTerms.map((t: any) => [t.term, t.value]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currMap = new Map(currTerms.map((t: any) => [t.term, t.value]));
  const diffs = [];

  // Find added/changed terms
  currTerms.forEach(curr => {
    if (!prevMap.has(curr.term)) {
      diffs.push({ ...curr, type: "added" });
    } else if (prevMap.get(curr.term) !== curr.value) {
      diffs.push({ ...curr, prev: prevMap.get(curr.term), type: "changed" });
    }
  });

  // Find removed terms
  prevTerms.forEach(prev => {
    if (!currMap.has(prev.term)) {
      diffs.push({ ...prev, type: "removed" });
    }
  });

  return diffs;
}

export default function VersionViewer({ document }: { document: ScannedDocument }) {
  const [activeVersion, setActiveVersion] = useState(0);

  const currentVersion = document.versions[activeVersion];
  const previousVersion = activeVersion > 0 ? document.versions[activeVersion - 1] : null;
  const termDiffs = previousVersion ? diffTerms(previousVersion.highlightedTerms, currentVersion.highlightedTerms) : [];

  return (
    <div className="space-y-12">
      <Tabs value={String(activeVersion)} onValueChange={v => setActiveVersion(Number(v))} className="w-full">
        <div className="px-4 mb-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 inline-flex">
            {document.versions.map((v: any, idx: number) => (
              <TabsTrigger
                key={idx}
                value={String(idx)}
                className="rounded-xl px-10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-[0.2em] transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span>ITERATION {idx + 1}</span>
                  <span className="text-[8px] opacity-40 group-data-[state=active]:opacity-100 transition-opacity">{new Date(v.uploadDate).toLocaleDateString()}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4">
          {/* Document Content */}
          <div className="sleek-card bg-white/[0.01] border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white/40" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white tracking-tight">Artifact Content</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Extraction Repository // v{activeVersion + 1}</p>
                </div>
              </div>
            </div>
            <div className="p-10 flex-1">
              <div className="text-white/60 font-medium text-sm leading-relaxed whitespace-pre-wrap selection:bg-white selection:text-black font-mono bg-black/20 p-8 rounded-[2rem] border border-white/5">
                {currentVersion.extractedText}
              </div>
            </div>
          </div>

          {/* Intelligence Diffs */}
          <div className="sleek-card bg-white/[0.01] border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white/40" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white tracking-tight">Delta Analysis</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Heuristic variance tracking</p>
                </div>
              </div>
              {previousVersion && (
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Sequence Sync</span>
                </div>
              )}
            </div>

            <div className="p-8 space-y-4 flex-1">
              {!previousVersion ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-white/5 border-dashed rounded-[3rem] bg-white/[0.01]">
                  <Clock className="h-12 w-12 text-white/5 mb-6" strokeWidth={1} />
                  <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-xs">Initial sequence // No prior delta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {termDiffs.map((diff, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-white group-hover:text-white transition-colors tracking-tight">{diff.term}</span>
                        <span className={cn(
                          "px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all",
                          diff.type === 'added' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            diff.type === 'removed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        )}>
                          {diff.type}
                        </span>
                      </div>

                      {diff.type === 'changed' && (
                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-black/40 border border-white/5">
                          <span className="text-[10px] font-bold text-red-500/40 line-through tracking-widest uppercase">{diff.prev}</span>
                          <ArrowRight className="h-3 w-3 text-white/10" />
                          <span className="text-[10px] font-bold text-white tracking-widest uppercase">{diff.value}</span>
                        </div>
                      )}
                      {(diff.type === 'added' || diff.type === 'removed') && (
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 p-4 rounded-3xl bg-black/40 border border-white/5">
                          Sequence Value: <span className="text-white ml-2">{diff.value}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {termDiffs.length === 0 && (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-white/5 border-dashed rounded-[3rem] bg-white/[0.01]">
                      <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-xs">No heuristical variance detected</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
