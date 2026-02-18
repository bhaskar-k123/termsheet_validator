import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, ChevronRight } from "lucide-react";

export default function ComplianceMetrics() {
  const metrics = [
    { title: "SEC Guidelines", value: 87, color: "text-emerald-400", barColor: "bg-emerald-500" },
    { title: "Financial Disclosure Rules", value: 64, color: "text-amber-400", barColor: "bg-amber-500" },
    { title: "Risk Assessment Standards", value: 92, color: "text-blue-400", barColor: "bg-blue-500" },
    { title: "Anti-Fraud Provisions", value: 51, color: "text-rose-400", barColor: "bg-rose-500" },
  ];

  return (
    <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl overflow-hidden glass-card h-full">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-lg font-bold text-white/90">Governance Index</CardTitle>
        </div>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          Regulatory alignment across ingestion layers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {metrics.map((m, i) => (
            <div key={i} className="group transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{m.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black tabular-nums ${m.color}`}>{m.value}%</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-white/50 transition-all transform group-hover:translate-x-0.5" />
                </div>
              </div>
              <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full ${m.barColor} transition-all duration-1000 ease-out`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
