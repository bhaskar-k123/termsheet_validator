
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Mock data
const performanceData = [
  { name: "Documents", total: 126, validated: 87, errors: 24, pending: 15 },
  { name: "Financial Terms", total: 845, validated: 742, errors: 78, pending: 25 },
  { name: "Compliance", total: 65, validated: 52, errors: 10, pending: 3 },
  { name: "Alerts", total: 42, validated: 0, errors: 30, pending: 12 },
];

const chartData = {
  labels: performanceData.map((d) => d.name),
  datasets: [
    {
      label: "Validated",
      data: performanceData.map((d) => d.validated),
      backgroundColor: "#10b981",
      borderRadius: 6,
      barThickness: 32,
    },
    {
      label: "Errors",
      data: performanceData.map((d) => d.errors),
      backgroundColor: "#ef4444",
      borderRadius: 6,
      barThickness: 32,
    },
    {
      label: "Pending",
      data: performanceData.map((d) => d.pending),
      backgroundColor: "#f59e0b",
      borderRadius: 6,
      barThickness: 32,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "rgba(255,255,255,0.7)",
        font: { family: "'IBM Plex Sans'", size: 11, weight: 'bold' as const },
        usePointStyle: true,
        padding: 20,
      }
    },
    tooltip: {
      backgroundColor: "rgba(5, 11, 26, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      titleFont: { family: "'IBM Plex Sans'", size: 13, weight: 'bold' as const },
      bodyFont: { family: "'IBM Plex Sans'", size: 12 },
      displayColors: true,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: {
        color: "rgba(255,255,255,0.5)",
        font: { family: "'IBM Plex Sans'", size: 11 },
      }
    },
    y: {
      stacked: true,
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: {
        color: "rgba(255,255,255,0.5)",
        font: { family: "'IBM Plex Sans'", size: 11 },
      }
    },
  },
};

export default function PerformanceOverview() {
  const totalValidated = performanceData.reduce((acc, item) => acc + item.validated, 0);
  const totalItems = performanceData.reduce((acc, item) => acc + item.total, 0);
  const validationPercentage = Math.round((totalValidated / totalItems) * 100);
  const totalErrors = performanceData.reduce((acc, item) => acc + item.errors, 0);
  const errorPercentage = Math.round((totalErrors / totalItems) * 100);

  return (
    <Card className="bg-card/50 border-white/5 shadow-2xl overflow-hidden rounded-3xl p-4">
      <CardHeader className="pb-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight text-white">Performance Overview</CardTitle>
            <CardDescription className="text-muted-foreground/60">
              Metric aggregation for validation layers
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              {validationPercentage}% Validated
            </div>
            <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
              {errorPercentage}% Errors
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full mt-4">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}

