import DocumentViewer from "@/components/documents/DocumentViewer";
import { useState } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusConfig = {
  validated: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    label: "VALIDATED"
  },
  processing: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "bg-white/5 text-white/60 border-white/10",
    label: "PROCESSING"
  },
  error: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "CRITICAL"
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: "bg-white/10 text-white/40 border-white/10",
    label: "PENDING"
  }
};

function Alldocs() {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['termsheets'],
    queryFn: () => api.getTermsheets(),
    refetchInterval: 5000, // Poll every 5s to show processing updates
  });

  const filteredDocuments = documents
    .filter((doc: any) => (statusFilter ? doc.status === statusFilter : true))
    .filter((doc: any) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-12">
      {!selectedDocument ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-12"
        >
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-2 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
            <div className="relative w-full md:w-full group px-2">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none pl-12 pr-6 py-4 text-sm focus:outline-none transition-all placeholder:text-white/20 text-white"
                placeholder="Query repository index..."
              />
            </div>

            <div className="flex items-center gap-3 pr-2">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3 text-xs font-semibold uppercase tracking-widest focus:border-white/20 focus:outline-none transition-all cursor-pointer hover:bg-white/10 text-white"
                >
                  <option value="" className="bg-zinc-900">ALL STATUS</option>
                  <option value="pending" className="bg-zinc-900">PENDING</option>
                  <option value="validated" className="bg-zinc-900">VALIDATED</option>
                  <option value="processing" className="bg-zinc-900">PROCESSING</option>
                  <option value="error" className="bg-zinc-900">ERROR</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 h-4 w-4 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Registry Table UI */}
          <div className="space-y-4">
            <div className="flex items-center px-10 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <div className="w-2/5 flex items-center gap-2">Asset Identity <ArrowUpDown size={12} /></div>
              <div className="w-1/5">Timeline</div>
              <div className="w-1/5">Metric Status</div>
              <div className="w-1/5 text-right">Interaction</div>
            </div>

            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Syncing with registry...</p>
                </div>
              ) : filteredDocuments.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-center px-8 py-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer">
                    <div className="w-2/5 flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                        <FileText className="h-6 w-6 text-white/60" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-white tracking-tight">{doc.name}</span>
                        <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "Artifact"}</span>
                      </div>
                    </div>

                    <div className="w-1/5">
                      <span className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">
                        {new Date(doc.uploadDate || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="w-1/5">
                      <div className={cn(
                        "inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                        statusConfig[doc.status as keyof typeof statusConfig]?.color
                      )}>
                        {statusConfig[doc.status as keyof typeof statusConfig]?.icon}
                        {statusConfig[doc.status as keyof typeof statusConfig]?.label}
                      </div>
                    </div>

                    <div className="w-1/5 flex justify-end gap-3">
                      <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <ExternalLink className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && filteredDocuments.length === 0 && (
              <div className="p-20 text-center rounded-[3rem] bg-white/[0.01] border border-dashed border-white/10">
                <p className="text-white/20 font-medium uppercase tracking-widest text-xs">No matching artifacts found in registry</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-12"
        >
          <button
            onClick={() => setSelectedDocument(null)}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-semibold text-sm"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>Back to repository index</span>
          </button>
          <div className="sleek-card p-1">
            <DocumentViewer document={selectedDocument} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Alldocs;