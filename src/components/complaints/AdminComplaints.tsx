import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { HALLS, Profile } from "@/lib/store";
import { Eye } from "lucide-react";

type Status = "pending" | "in_progress" | "resolved";

interface Complaint {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: string | null;
  status: Status;
  hall_name: string | null;
  block: string | null;
  room_number: number | null;
  created_at: string;
}

const statusStyles: Record<Status, string> = {
  pending: "bg-destructive/10 text-destructive border-destructive/30",
  in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400",
  resolved: "bg-success/10 text-success border-success/30",
};

export function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [hallFilter, setHallFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Complaint | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });
    const items = (data as Complaint[]) || [];
    setComplaints(items);
    const ids = Array.from(new Set(items.map((c) => c.student_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
      const map: Record<string, Profile> = {};
      (profs as Profile[] | null)?.forEach((p) => { map[p.id] = p; });
      setProfiles(map);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  const filtered = useMemo(() => complaints.filter((c) => {
    if (hallFilter !== "all" && c.hall_name !== hallFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  }), [complaints, hallFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hall:</span>
          <Select value={hallFilter} onValueChange={setHallFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Halls</SelectItem>
              {HALLS.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">No complaints found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Student", "Index", "Contact", "Hall", "Block", "Room", "Title", "Date", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const p = profiles[c.student_id];
                  return (
                    <tr key={c.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3">{p?.full_name ?? "Unknown"}</td>
                      <td className="px-4 py-3 font-mono">{p?.index_number ?? "—"}</td>
                      <td className="px-4 py-3">{p?.contact ?? p?.email ?? "—"}</td>
                      <td className="px-4 py-3">{c.hall_name ?? "—"}</td>
                      <td className="px-4 py-3">{c.block ?? "—"}</td>
                      <td className="px-4 py-3">{c.room_number ?? "—"}</td>
                      <td className="px-4 py-3">{c.title}</td>
                      <td className="px-4 py-3">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[c.status]}`}>
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Student:</span> {profiles[selected.student_id]?.full_name ?? "—"}</div>
                <div><span className="text-muted-foreground">Index:</span> {profiles[selected.student_id]?.index_number ?? "—"}</div>
                <div><span className="text-muted-foreground">Contact:</span> {profiles[selected.student_id]?.contact ?? "—"}</div>
                <div><span className="text-muted-foreground">Email:</span> {profiles[selected.student_id]?.email ?? "—"}</div>
                <div><span className="text-muted-foreground">Hall:</span> {selected.hall_name ?? "—"}</div>
                <div><span className="text-muted-foreground">Block / Room:</span> {selected.block ?? "—"} / {selected.room_number ?? "—"}</div>
                <div><span className="text-muted-foreground">Category:</span> {selected.category ?? "—"}</div>
                <div><span className="text-muted-foreground">Submitted:</span> {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Description</p>
                <p className="whitespace-pre-wrap border rounded-md p-3 bg-muted/50">{selected.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Update status:</span>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as Status)}>
                  <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}