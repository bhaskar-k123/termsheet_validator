import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, FileDown, Filter, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import PerformanceOverview from "@/components/analytics/PerformanceOverview";
import DocumentTrends from "@/components/analytics/DocumentTrends";
import FinancialTermsAnalysis from "@/components/analytics/FinancialTermsAnalysis";
import ErrorDistribution from "@/components/analytics/ErrorDistribution";
import ComplianceMetrics from "@/components/analytics/ComplianceMetrics";
import { motion } from "framer-motion";

export default function Analytics() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            Intelligence <span className="text-white/40">Suite</span>
          </motion.h1>
          <p className="text-lg text-white/40 font-medium max-w-2xl">
            Advanced heuristic analysis and throughput metrics for your derivative pipeline.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold text-sm">
                <CalendarIcon className="h-4 w-4 text-white/40" />
                <span>{date ? format(date, "PPP") : "Select Window"}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="text-white rounded-2xl"
              />
            </PopoverContent>
          </Popover>

          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold text-sm">
            <Filter className="h-4 w-4 text-white/40" />
            <span>Filters</span>
          </button>

          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-black hover:scale-105 transition-all font-bold text-sm">
            <FileDown className="h-4 w-4" />
            <span>Export Intelligence</span>
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 mb-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 inline-flex">
            <TabsTrigger value="overview" className="rounded-xl px-12 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-[0.2em] transition-all duration-300">AGGREGATION</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl px-12 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-[0.2em] transition-all duration-300">THROUGHPUT</TabsTrigger>
            <TabsTrigger value="validation" className="rounded-xl px-12 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-[0.2em] transition-all duration-300">HEURISTICS</TabsTrigger>
            <TabsTrigger value="compliance" className="rounded-xl px-12 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-[0.2em] transition-all duration-300">GOVERNANCE</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-12 outline-none">
          <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
            <PerformanceOverview />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
              <DocumentTrends />
            </div>
            <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
              <ErrorDistribution />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-12 outline-none">
          <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
            <DocumentTrends fullHeight />
          </div>
          <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
            <FinancialTermsAnalysis />
          </div>
        </TabsContent>

        <TabsContent value="validation" className="outline-none">
          <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
            <ErrorDistribution fullHeight />
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="outline-none">
          <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
            <ComplianceMetrics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
