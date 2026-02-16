import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import ProcessingStatus from "@/components/dashboard/ProcessingStatus";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Index() {
  const [totaldocs, setTotalDocs] = useState(0);
  const [validationRate, setValidationRate] = useState(0);
  const [issues, setIssues] = useState(0);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchData = async () => {
      try {
        const resp = await fetch(
          `${API_BASE_URL}/trader_stats?email=${user.emailAddresses[0]?.emailAddress}`,
          { method: "GET" }
        );
        if (resp.ok) {
          const data = await resp.json();
          setTotalDocs(data.total_documents);
          setValidationRate(data.validation_rate);
          setIssues(data.total_unvalidated_fields);
        }
      } catch (error) {
        console.error("Failed to fetch trader stats:", error);
      }
    };
    fetchData();
  }, [user, isLoaded]);

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          SheetSense Dashboard
        </h1>
        <p className="text-muted-foreground">
          AI-powered analytics and validation dashboard for term sheet
          processing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Documents"
          value={totaldocs}
          description="Last 30 days"
          icon={<FileText size={18} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Validation Rate"
          value={validationRate}
          description="Documents validated successfully"
          icon={<CheckCircle2 size={18} />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Issues Detected"
          value={issues}
          description="Requiring attention"
          icon={<AlertTriangle size={18} />}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Average Processing Time"
          value="42s"
          description="Per document"
          icon={<TrendingUp size={18} />}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-3">
          <ProcessingStatus />
        </div>
      </div>
    </MainLayout>
  );
}
