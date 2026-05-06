import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquareWarning, Plus } from "lucide-react";
import { useCurrentAcademicYear, useBookings } from "@/hooks/useBookings";

const CATEGORIES = ["Maintenance", "Electricity", "Water", "Roommate issue", "Other"];

const statusStyles: Record<string, string> = {
  pending: "bg-destructive/10 text-destructive border-destructive/30",
  in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400",
  resolved: "bg-success/10 text-success border-success/30",
};

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string | null;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
}

export function StudentComplaints() {
  const { user } = useAuth();
  const ay = useCurrentAcademicYear();
  const { bookings } = useBookings(ay?.year);
  const myBooking = bookings.find((b) => b.student_id === user?.id);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [list, setList] = useState<Complaint[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("complaints")
      .select("id, title, description, category, status, created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    setList((data as Complaint[]) || []);
  };

  useEffect(() => { load(); }, [user?.id]);

  const submit = async () => {
    if (!user || !title.trim() || !description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("complaints").insert({
      student_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category || null,
      hall_name: myBooking?.hall_name ?? null,
      block: myBooking?.block ?? null,
      room_number: myBooking?.room_number ?? null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Your complaint has been submitted successfully");
    setTitle(""); setDescription(""); setCategory("");
    setOpen(false);
    load();
  };

  return (
    <div className="bg-card rounded-xl border p-6 animate-slide-up" style={{ animationDelay: "0.35s" }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">My Complaints</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Report Issue</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Report an Issue</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Brief title" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select a category (optional)" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={5} placeholder="Describe the issue in detail" />
              </div>
              {myBooking ? (
                <p className="text-xs text-muted-foreground">
                  Will be tagged with: {myBooking.hall_name} • Block {myBooking.block} • Room {myBooking.room_number}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No room booking detected — submission will not include room details.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">You have not submitted any complaints yet.</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {list.map((c) => (
            <div key={c.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-medium text-sm">{c.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[c.status]}`}>
                  {c.status.replace("_", " ")}
                </span>
              </div>
              {c.category && <p className="text-xs text-muted-foreground mb-1">{c.category}</p>}
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}