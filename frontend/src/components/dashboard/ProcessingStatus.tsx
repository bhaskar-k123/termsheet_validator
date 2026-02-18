import { FileText, Zap, ExternalLink, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ProcessingStatus() {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['termsheets'],
    queryFn: () => api.getTermsheets(),
    refetchInterval: 5000,
  });

  const processingDocs = documents
    .filter((doc: any) => doc.status === 'processing')
    .map((doc: any) => ({
      name: doc.name,
      size: doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "Artifact",
      date: new Date(doc.uploadDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      progress: doc.progress || 65 // Simulated progress if backend doesn't provide granular %
    }));

  const completedDocs = documents
    .filter((doc: any) => doc.status === 'validated')
    .slice(0, 5);

  const recentActivity = documents
    .slice(0, 5)
    .map((doc: any) => ({
      id: doc.id.slice(-4),
      action: doc.status === 'validated' ? `Heuristic scan completed for ${doc.name}` : `Extraction in progress for ${doc.name}`,
      status: doc.status === 'validated' ? 'success' : 'pending',
      time: 'Just now'
    }));
  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Pipeline Activity
        </h2>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Live Feed</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-12">
              <TabsTrigger value="active" className="rounded-xl flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-widest px-6 transition-all duration-300">ACTIVE</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-xl flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-widest px-6 transition-all duration-300">COMPLETED</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-6 space-y-4">
              {processingDocs.map((doc, idx) => (
                <div key={idx} className="p-5 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                        <FileText className="w-5 h-5 text-white/40 group-hover:text-white" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-white tracking-tight group-hover:text-white transition-colors">{doc.name}</p>
                        <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest">{doc.size} // {doc.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{doc.progress}%</span>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${doc.progress}%` }}
                          className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Operation Log</h3>
            <button className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">Clear Stream</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-5 p-4 rounded-3xl bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 border border-transparent hover:border-white/5 group"
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500",
                  activity.status === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500 group-hover:bg-green-500/20" : "bg-white/5 border-white/10 text-white/20 group-hover:text-white/40"
                )}>
                  {activity.status === 'success' ? <Zap size={15} className="animate-pulse" /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-white/60 group-hover:text-white transition-all tracking-tight leading-none">{activity.action}</p>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1 tracking-widest">SEQ_{activity.id} // {activity.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
