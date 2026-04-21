import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useAnnouncements, AnnouncementTarget } from "@/hooks/useAnnouncements";
import { HALLS } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnnouncementCard } from "./AnnouncementCard";
import { toast } from "sonner";
import { Send, Megaphone } from "lucide-react";

export function AdminAnnouncements() {
  const { user } = useAuth();
  const { announcements } = useAnnouncements();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<AnnouncementTarget>("all");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (title.trim().length < 3) return toast.error("Title too short");
    if (message.trim().length < 5) return toast.error("Message too short");
    setSending(true);
    const { error } = await (supabase as any).from("announcements").insert({
      title: title.trim(),
      message: message.trim(),
      target_hall: target,
      created_by: user.id,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success("Announcement sent");
    setTitle(""); setMessage(""); setTarget("all");
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("announcements").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Announcement deleted");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSend} className="bg-card border rounded-xl p-6 space-y-4 h-fit">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">New Announcement</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ann-title">Title</Label>
          <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Water maintenance notice" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ann-msg">Message</Label>
          <Textarea id="ann-msg" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={5} placeholder="Write your announcement..." />
        </div>
        <div className="space-y-2">
          <Label>Target audience</Label>
          <Select value={target} onValueChange={(v) => setTarget(v as AnnouncementTarget)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students (All Halls)</SelectItem>
              {HALLS.map((h) => (
                <SelectItem key={h} value={h}>{h} students only</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={sending} className="w-full">
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Send Announcement"}
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="font-semibold">Past Announcements ({announcements.length})</h3>
        {announcements.length === 0 ? (
          <p className="bg-card border rounded-xl p-6 text-center text-muted-foreground text-sm">No announcements yet</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}