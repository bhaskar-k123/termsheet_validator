import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { PieChart } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const financialTermsData = [
  { name: "Valuation", value: 35 },
  { name: "Equity", value: 25 },
  { name: "Liquidation", value: 15 },
  { name: "Vesting", value: 10 },
  { name: "Other", value: 15 },
];

const COLORS = [
  "rgba(255, 255, 255, 0.4)",
  "rgba(255, 255, 255, 0.2)",
  "rgba(255, 255, 255, 0.1)",
  "rgba(255, 255, 255, 0.05)",
  "rgba(255, 255, 255, 0.02)",
];

const total = financialTermsData.reduce((acc, item) => acc + item.value, 0);

const chartData = {
  labels: financialTermsData.map((d) => d.name),
  datasets: [
    {
      data: financialTermsData.map((d) => d.value),
      backgroundColor: COLORS,
      hoverBackgroundColor: "rgba(255, 255, 255, 0.6)",
      borderColor: "rgba(255,255,255,0.05)",
      borderWidth: 2,
      spacing: 4,
      cutout: '80%',
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "rgba(255,255,255,0.2)",
        font: { family: "'Inter', sans-serif", size: 10, weight: '600' },
        usePointStyle: true,
        padding: 20,
      }
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropBlur: 10,
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 16,
      titleFont: { family: "'Inter', sans-serif", size: 12, weight: 'bold' as const },
      bodyFont: { family: "'Inter', sans-serif", size: 11 },
      callbacks: {
        label: (ctx: any) => {
          const val = ctx.parsed;
          const pct = Math.round((val / total) * 100);
          return ` ${ctx.label}: ${pct}%`;
        },
      },
    },
  },
};

export default function FinancialTermsChart() {
  return (
    <div className="sleek-card bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden h-full flex flex-col">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
            <PieChart className="h-6 w-6 text-white/40" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white tracking-tight">Entity Analysis</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Core Term breakdown</p>
          </div>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col items-center justify-center">
        <div className="h-64 w-full relative">
          <Doughnut data={chartData} options={chartOptions as any} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
            <span className="text-3xl font-bold text-white tracking-tighter">{total}</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold">Total Index</span>
          </div>
        </div>
      </div>
    </div>
  );
}
