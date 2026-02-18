import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScannedDocument } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Download,
  FileText,
  Eye,
  GitCompare,
  ShieldCheck,
  AlertCircle,
  Zap
} from "lucide-react";

interface DocumentViewerProps {
  document: ScannedDocument;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('document');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const renderDocumentContent = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white/40" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white tracking-tight truncate max-w-md">
                {document.name}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Asset Repository // {document.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <Download size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 mb-6">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-12 inline-flex">
              <TabsTrigger value="document" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-widest px-8 transition-all duration-300 gap-2">
                <Eye size={14} /> PREVIEW
              </TabsTrigger>
              <TabsTrigger value="comparison" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-widest px-8 transition-all duration-300 gap-2">
                <GitCompare size={14} /> ANALYSIS
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 px-4">
            <TabsContent value="document" className="h-[600px] mt-0 focus:outline-none">
              <div className="w-full h-full bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden flex items-center justify-center group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="flex flex-col items-center gap-4 text-white/10 group-hover:text-white/20 transition-colors duration-500">
                  <FileText size={64} strokeWidth={1} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em]">Protected Preview Layer</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="h-[600px] mt-0 focus:outline-none overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <ShieldCheck className="text-white/20" size={18} />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Expected Parameters</h3>
                  </div>
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {document.expectedTerms?.map((term: any, index: number) => (
                      <div key={index} className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500 flex justify-between items-center group">
                        <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors">{term.term}</span>
                        <span className="text-[11px] font-bold text-white uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">{term.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <Zap className="text-white/20" size={18} />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Extracted Heuristics</h3>
                  </div>
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {document.highlightedTerms?.map((term: any, index: number) => (
                      <div key={index} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-500 flex justify-between items-center group">
                        <span className="text-sm font-semibold text-white group-hover:text-white transition-colors">{term.term}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-white uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/10">{term.value}</span>
                          <AlertCircle size={14} className="text-white/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "sleek-card bg-white/[0.01] border border-white/5 p-8 transition-all duration-500",
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none bg-black/95 backdrop-blur-2xl"
          : "min-h-[700px]"
      )}
      ref={containerRef}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFullscreen ? 'full' : 'normal'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="h-full"
        >
          {renderDocumentContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}