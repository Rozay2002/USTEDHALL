import { Megaphone, Calendar, Building2 } from "lucide-react";
import type { Announcement } from "@/hooks/useAnnouncements";

interface Props {
  announcement: Announcement;
  onDelete?: (id: string) => void;
}

export function AnnouncementCard({ announcement, onDelete }: Props) {
  const isAll = announcement.target_hall === "all";
  return (
    <div className="bg-card border rounded-xl p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-secondary/20 text-secondary-foreground rounded-lg p-2">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-semibold">{announcement.title}</h4>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isAll ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>
          <Building2 className="inline h-3 w-3 mr-1" />
          {isAll ? "All Halls" : announcement.target_hall}
        </span>
      </div>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap mb-3">{announcement.message}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(announcement.created_at).toLocaleString()}
        </span>
        <span>— Admin</span>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(announcement.id)}
          className="mt-3 text-xs text-destructive hover:underline"
        >
          Delete
        </button>
      )}
    </div>
  );
}