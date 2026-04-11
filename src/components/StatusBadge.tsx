import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  occupancy: number;
  max: number;
  className?: string;
}

export function StatusBadge({ occupancy, max, className }: StatusBadgeProps) {
  const status = occupancy === 0 ? "available" : occupancy < max ? "partial" : "full";
  const labels = { available: "Available", partial: `${occupancy}/${max}`, full: "Full" };
  const colors = {
    available: "bg-success text-success-foreground",
    partial: "bg-warning text-warning-foreground",
    full: "bg-destructive text-destructive-foreground",
  };
  const dots = { available: "🟢", partial: "🟡", full: "🔴" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", colors[status], className)}>
      <span>{dots[status]}</span>
      {labels[status]}
    </span>
  );
}
