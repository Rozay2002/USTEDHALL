import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AnnouncementTarget = "all" | "Opoku Ware Hall" | "Autonomy Hall" | "Atwima Hall";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target_hall: AnnouncementTarget;
  created_by: string;
  created_at: string;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await (supabase as any)
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnouncements((data as Announcement[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("announcements-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { announcements, loading, refetch: fetch };
}