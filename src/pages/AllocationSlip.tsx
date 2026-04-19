import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrentAcademicYear, useBookings } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/lib/store";

export default function AllocationSlip() {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const ay = useCurrentAcademicYear();
  const { bookings } = useBookings(ay?.year);
  const [roommates, setRoommates] = useState<Profile[]>([]);

  const booking = bookings.find(b => b.student_id === user?.id);

  useEffect(() => {
    if (!loading && (!user || role !== "student")) navigate("/student/login");
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (!booking) return;
    const others = bookings.filter(
      b => b.hall_name === booking.hall_name && b.block === booking.block
        && b.room_number === booking.room_number && b.student_id !== user?.id
    );
    if (others.length === 0) { setRoommates([]); return; }
    supabase.from("profiles").select("*").in("id", others.map(o => o.student_id))
      .then(({ data }) => setRoommates((data as Profile[]) || []));
  }, [booking, bookings, user?.id]);

  if (loading || !profile || !ay) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!booking) { navigate("/student/dashboard"); return null; }

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 print:hidden">
          <Button variant="ghost" size="sm" onClick={() => navigate("/student/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex-1" />
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" /> Print / Download
          </Button>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-lg">
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-2xl font-bold text-primary">University Hall Accommodation</h1>
            <h2 className="text-lg text-muted-foreground mt-1">Room Allocation Slip</h2>
            <p className="text-sm text-muted-foreground mt-1">Academic Year: {ay.year}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            {[
              ["Full Name", profile.full_name],
              ["Index Number", profile.index_number],
              ["Program", profile.program],
              ["Level", profile.level ? `Level ${profile.level}` : "—"],
              ["Contact", profile.contact],
              ["Email", profile.email],
            ].map(([label, val]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{val}</dd>
              </div>
            ))}
          </div>

          <div className="bg-muted rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3">Room Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                ["Hall", booking.hall_name],
                ["Block", `Block ${booking.block}`],
                ["Room", `Room ${booking.room_number}`],
                ["Date", new Date(booking.booked_at).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold">{val}</dd>
                </div>
              ))}
            </div>
          </div>

          {roommates.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-2 text-sm">Roommates</h3>
              <ul className="text-sm space-y-1">
                {roommates.map(r => <li key={r.id}>• {r.full_name} ({r.index_number})</li>)}
              </ul>
            </div>
          )}

          <div className="border-t pt-4 text-xs text-muted-foreground text-center">
            <p>This allocation slip is computer-generated and serves as proof of accommodation booking.</p>
            <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
