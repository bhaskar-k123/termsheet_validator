
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Mock data
const documentTrendsData = [
  { month: "Jan", processed: 65, validated: 42, failed: 23 },
  { month: "Feb", processed: 78, validated: 50, failed: 28 },
  { month: "Mar", processed: 90, validated: 67, failed: 23 },
  { month: "Apr", processed: 81, validated: 62, failed: 19 },
  { month: "May", processed: 95, validated: 80, failed: 15 },
  { month: "Jun", processed: 110, validated: 90, failed: 20 },
  { month: "Jul", processed: 126, validated: 87, failed: 39 },
];

const chartData = {
  labels: documentTrendsData.map((d) => d.month),
  datasets: [
    {
      label: "Throughput",
      data: documentTrendsData.map((d) => d.processed),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: "#3b82f6",
      pointBorderColor: "rgba(255,255,255,0.2)",
      pointBorderWidth: 2,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true,
    },
    {
      label: "Success",
      data: documentTrendsData.map((d) => d.validated),
      borderColor: "#10b981",
      backgroundColor: "transparent",
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0.4,
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
        font: { family: "'IBM Plex Sans'", size: 10, weight: 'bold' as const },
        usePointStyle: true,
        padding: 15,
      }
    },
    tooltip: {
      backgroundColor: "rgba(5, 11, 26, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      titleFont: { family: "'IBM Plex Sans'", size: 12, weight: 'bold' as const },
      bodyFont: { family: "'IBM Plex Sans'", size: 11 },
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: "rgba(255,255,255,0.5)",
        font: { family: "'IBM Plex Sans'", size: 10 },
      }
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: {
        color: "rgba(255,255,255,0.5)",
        font: { family: "'IBM Plex Sans'", size: 10 },
      }
    },
  },
};

interface DocumentTrendsProps {
  fullHeight?: boolean;
}

export default function DocumentTrends({ fullHeight = false }: DocumentTrendsProps) {
  return (
    <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold tracking-tight text-white/90">Workload Velocity</CardTitle>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          Registry ingestion trends
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(fullHeight ? "h-96" : "h-72", "px-4")}>
        <Line data={chartData} options={chartOptions} />
      </CardContent>
    </Card>
  );
}

