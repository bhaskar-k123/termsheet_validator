
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Mock data for the financial terms analysis
const financialTermsData = [
  { name: "Valuation", value: 35 },
  { name: "Equity", value: 25 },
  { name: "Liquidation", value: 15 },
  { name: "Vesting", value: 10 },
  { name: "Convertible Note", value: 8 },
  { name: "Other", value: 7 },
];

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#94a3b8", // Slate
];

const total = financialTermsData.reduce((acc, item) => acc + item.value, 0);

const chartData = {
  labels: financialTermsData.map((d) => d.name),
  datasets: [
    {
      data: financialTermsData.map((d) => d.value),
      backgroundColor: COLORS.map(c => `${c}cc`),
      hoverBackgroundColor: COLORS,
      borderColor: "rgba(255,255,255,0.05)",
      borderWidth: 2,
      spacing: 5,
      offset: 10,
      hoverOffset: 20,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
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
        label: (ctx: any) => {
          const pct = Math.round((ctx.parsed / total) * 100);
          return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
        },
      },
    },
  },
};

export default function FinancialTermsAnalysis() {
  return (
    <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold tracking-tight text-white/90">Semantic Term Distribution</CardTitle>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          Lexical density of extracted entities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-4">
          <div className="h-64 relative">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{total}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Terms</span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              {financialTermsData.map((term, index) => (
                <div key={index} className="group cursor-default">
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{term.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground/70 tabular-nums">
                      {Math.round((term.value / total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(term.value / total) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

