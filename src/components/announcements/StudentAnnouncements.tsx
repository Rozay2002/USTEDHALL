import { useMemo, useState, useEffect, useRef } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { AnnouncementCard } from "./AnnouncementCard";
import { Megaphone, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  studentHall: string | null;
}

export function StudentAnnouncements({ studentHall }: Props) {
  const { announcements } = useAnnouncements();
  const [filter, setFilter] = useState<"all" | "general" | "hall">("all");
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  // Notify on new announcements
  useEffect(() => {
    if (!initialized.current) {
      announcements.forEach((a) => seenIds.current.add(a.id));
      initialized.current = true;
      return;
    }
    announcements.forEach((a) => {
      if (!seenIds.current.has(a.id)) {
        seenIds.current.add(a.id);
        toast.info(`📢 ${a.title}`, { description: a.message.slice(0, 80) });
      }
    });
  }, [announcements]);

  const filtered = useMemo(() => {
    if (filter === "general") return announcements.filter((a) => a.target_hall === "all");
    if (filter === "hall" && studentHall) return announcements.filter((a) => a.target_hall === studentHall);
    return announcements;
  }, [announcements, filter, studentHall]);

  return (
    <div className="bg-card rounded-xl border p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Announcements</h3>
          {announcements.length > 0 && (
            <span className="bg-secondary text-secondary-foreground text-xs font-bold rounded-full px-2 py-0.5">
              {announcements.length}
            </span>
          )}
        </div>
        <div className="flex gap-1 text-xs">
          {(["all", "general", ...(studentHall ? ["hall"] as const : [])] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="h-7 px-3 text-xs"
            >
              {f === "all" ? "All" : f === "general" ? "General" : "My Hall"}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No announcements to show</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
}