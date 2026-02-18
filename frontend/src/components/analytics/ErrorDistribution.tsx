
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Mock data
const errorDistributionData = [
  { type: "Missing Data", count: 36, details: "Essential financial values not found" },
  { type: "Format Error", count: 28, details: "Incorrect format in financial notation" },
  { type: "Inconsistency", count: 15, details: "Values don't match across document" },
  { type: "Compliance", count: 12, details: "Terms violate regulatory requirements" },
  { type: "Calculation", count: 9, details: "Numeric calculation errors" },
];

const barColors = [
  "rgba(239, 68, 68, 0.8)", // red-500
  "rgba(249, 115, 22, 0.8)", // orange-500
  "rgba(245, 158, 11, 0.8)", // amber-500
  "rgba(234, 179, 8, 0.8)",  // yellow-500
  "rgba(250, 204, 21, 0.8)", // yellow-400
];

const chartData = {
  labels: errorDistributionData.map((d) => d.type),
  datasets: [
    {
      label: "Issues Detected",
      data: errorDistributionData.map((d) => d.count),
      backgroundColor: barColors,
      hoverBackgroundColor: barColors.map(c => c.replace('0.8', '1')),
      borderWidth: 0,
      borderRadius: 4,
      barThickness: 24,
    },
  ],
};

const chartOptions = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(5, 11, 26, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      titleFont: { family: "'IBM Plex Sans'", size: 12, weight: 'bold' as const },
      bodyFont: { family: "'IBM Plex Sans'", size: 11 },
      callbacks: {
        label: (ctx: any) => ` ${ctx.parsed.x} occurrences`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: {
        color: "rgba(255,255,255,0.5)",
        font: { family: "'IBM Plex Sans'", size: 10 },
      }
    },
    y: {
      grid: { display: false },
      ticks: {
        color: "rgba(255,255,255,0.8)",
        font: { family: "'IBM Plex Sans'", size: 11, weight: 'bold' as const },
      }
    },
  },
};

interface ErrorDistributionProps {
  fullHeight?: boolean;
}

export default function ErrorDistribution({ fullHeight = false }: ErrorDistributionProps) {
  return (
    <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold tracking-tight text-white/90">Anomaly Distribution</CardTitle>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          Validation failure taxonomy
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(fullHeight ? "h-96" : "h-72", "px-6")}>
        <div className="h-full w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}

