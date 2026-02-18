
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Mock data for the validation trends over time
const trendData = [
  { date: "Jul 1", total: 35, validated: 25, issues: 10 },
  { date: "Jul 8", total: 42, validated: 32, issues: 10 },
  { date: "Jul 15", total: 38, validated: 30, issues: 8 },
  { date: "Jul 22", total: 45, validated: 34, issues: 11 },
  { date: "Jul 29", total: 50, validated: 40, issues: 10 },
  { date: "Aug 5", total: 55, validated: 42, issues: 13 },
  { date: "Aug 12", total: 60, validated: 48, issues: 12 },
];

const chartData = {
  labels: trendData.map((d) => d.date),
  datasets: [
    {
      label: "Total Documents",
      data: trendData.map((d) => d.total),
      borderColor: "#0A84FF",
      backgroundColor: "rgba(10, 132, 255, 0.1)",
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 8,
      tension: 0.4,
    },
    {
      label: "Validated",
      data: trendData.map((d) => d.validated),
      borderColor: "#4caf50",
      backgroundColor: "rgba(76, 175, 80, 0.1)",
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.4,
    },
    {
      label: "Issues Found",
      data: trendData.map((d) => d.issues),
      borderColor: "#f44336",
      backgroundColor: "rgba(244, 67, 54, 0.1)",
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
    tooltip: {
      backgroundColor: "hsl(222.2, 84%, 4.9%)",
      borderColor: "hsl(217.2, 32.6%, 17.5%)",
      borderWidth: 1,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.06)" },
      ticks: { color: "hsl(215, 20.2%, 65.1%)" },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.06)" },
      ticks: { color: "hsl(215, 20.2%, 65.1%)" },
    },
  },
};

export default function ValidationTrends() {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Validation Trends</CardTitle>
        <CardDescription>Weekly validation metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
