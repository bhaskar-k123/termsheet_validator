import { CheckCircle2, AlertTriangle, AlertCircle, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function ValidationFilters({
  selectedFilter,
  onFilterChange,
}: ValidationFiltersProps) {
  const filters = [
    { value: "all", label: "Aggregation", icon: <ListFilter className="h-3.5 w-3.5" /> },
    { value: "validated", label: "Validated", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    { value: "error", label: "Critical", icon: <AlertCircle className="h-3.5 w-3.5" /> },
    { value: "warning", label: "Anomalies", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex bg-white/[0.02] border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "flex items-center gap-3 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-xl",
            selectedFilter === filter.value
              ? "bg-white/10 text-white shadow-xl border border-white/10"
              : "text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent"
          )}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
