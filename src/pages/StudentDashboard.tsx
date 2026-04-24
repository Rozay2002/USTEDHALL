import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, BookOpen, Home, LogOut, BedDouble } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrentAcademicYear, useBookings } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/lib/store";
import { StudentAnnouncements } from "@/components/announcements/StudentAnnouncements";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentDashboard() {
  const { user, profile, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const ay = useCurrentAcademicYear();
  const { bookings } = useBookings(ay?.year);
  const [roommates, setRoommates] = useState<Profile[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/student/login"); return; }
    if (role && role !== "student") navigate("/student/login");
  }, [user, role, loading, navigate]);

  const myBooking = bookings.find(b => b.student_id === user?.id);

  useEffect(() => {
    if (!myBooking) { setRoommates([]); return; }
    const others = bookings.filter(
      b => b.hall_name === myBooking.hall_name && b.block === myBooking.block
        && b.room_number === myBooking.room_number && b.student_id !== user?.id
    );
    if (others.length === 0) { setRoommates([]); return; }
    supabase.from("profiles").select("*").in("id", others.map(o => o.student_id))
      .then(({ data }) => setRoommates((data as Profile[]) || []));
  }, [myBooking, bookings, user?.id]);

  if (loading || !profile || !ay) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BedDouble className="h-6 w-6" />
            <h1 className="text-lg font-bold">UniHall</h1>
          </div>
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <Avatar className="h-8 w-8 ring-2 ring-primary-foreground/30">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-primary bg-primary-foreground text-xs">
                  {profile.full_name.split(" ").map(s => s[0]).slice(0,2).join("")}
                </AvatarFallback>
              </Avatar>
            ) : null}
            <span className="text-sm hidden sm:inline">{profile.full_name}</span>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl mb-1">Welcome, {profile.full_name.split(" ")[0]}!</h2>
          <p className="text-muted-foreground">Academic Year: {ay.year} • {ay.is_open ? "Booking Open" : "Booking Closed"}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-xl border p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Personal Information</h3>
            </div>
            <div className="flex justify-center mb-5 pb-5 border-b">
              <ProfilePhotoUpload />
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ["Full Name", profile.full_name],
                ["Index Number", profile.index_number],
                ["Contact", profile.contact],
                ["Email", profile.email],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-card rounded-xl border p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Academic Information</h3>
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ["Program", profile.program],
                ["Level", profile.level ? `Level ${profile.level}` : "—"],
                ["Academic Year", ay.year],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-card rounded-xl border p-6 md:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Room Allocation</h3>
            </div>
            {myBooking ? (
              <div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                  {[
                    ["Hall", myBooking.hall_name],
                    ["Block", `Block ${myBooking.block}`],
                    ["Room", `Room ${myBooking.room_number}`],
                    ["Booked", new Date(myBooking.booked_at).toLocaleDateString()],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-semibold text-lg">{val}</dd>
                    </div>
                  ))}
                </dl>
                {roommates.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Roommates:</p>
                    <div className="flex flex-wrap gap-2">
                      {roommates.map(r => (
                        <span key={r.id} className="bg-muted px-3 py-1 rounded-full text-sm">{r.full_name}</span>
                      ))}
                    </div>
                  </div>
                )}
                <Button className="mt-4" variant="outline" onClick={() => navigate("/student/allocation-slip")}>
                  Download Allocation Slip
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No room allocated yet</p>
                {ay.is_open ? (
                  <Button onClick={() => navigate("/student/book")}>Book a Room</Button>
                ) : (
                  <p className="text-sm text-destructive">Booking is currently closed</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <StudentAnnouncements studentHall={myBooking?.hall_name ?? null} />
        </div>
      </main>
    </div>
  );
}
