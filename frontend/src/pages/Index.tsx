import StatCard from "@/components/dashboard/StatCard";
import ProcessingStatus from "@/components/dashboard/ProcessingStatus";
import { RefinedUploader } from "@/components/dashboard/RefinedUploader";
import { useAuthUser } from "@/lib/auth-hooks";
import { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Index() {
  const { user, isLoaded } = useAuthUser();
  const email = user?.emailAddresses[0]?.emailAddress || "";

  const { data: stats, isLoading } = useQuery({
    queryKey: ['trader_stats', email],
    queryFn: () => api.getTraderStats(email),
    enabled: !!email && isLoaded,
    refetchInterval: 10000,
  });

  const totaldocs = stats?.total_documents || 0;
  const validationRate = stats?.validation_rate || 0;
  const issues = stats?.total_unvalidated_fields || 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16"
    >
      <div className="flex flex-col gap-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
        >
          Operational Intelligence
        </motion.h1>
        <p className="text-lg text-white/40 font-medium max-w-2xl">
          Complete visibility into your derivative validation pipeline with heuristic analysis and real-time indexing.
        </p>
      </div>

      <motion.div variants={item}>
        <RefinedUploader />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <StatCard
            title="Registry Total"
            value={totaldocs}
            description="Total sheets indexed"
            icon={<FileText size={20} className="text-black" />}
            trend={{ value: 12.4, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Validation Health"
            value={`${validationRate}%`}
            description="Across all swaps"
            icon={<ShieldCheck size={20} className="text-black" />}
            trend={{ value: 4.2, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Pending Errors"
            value={issues}
            description="Requires validation"
            icon={<AlertCircle size={20} className="text-black" />}
            trend={{ value: 2.1, isPositive: false }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="System Latency"
            value="1.2s"
            description="Avg extraction time"
            icon={<Zap size={20} className="text-black" />}
            trend={{ value: 8.5, isPositive: true }}
          />
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Active Pipeline</h2>
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Real-time processing status and activity</p>
        </div>
        <div className="sleek-card p-10 bg-white/[0.02] border border-white/5">
          <ProcessingStatus />
        </div>
      </motion.div>
    </motion.div>
  );
}

