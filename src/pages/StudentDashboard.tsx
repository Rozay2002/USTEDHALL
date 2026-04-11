import { useAuth } from "@/lib/auth-context";
import { Student, getStudentBooking, getRoomOccupants, getAcademicYear } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, BookOpen, Home, LogOut, BedDouble } from "lucide-react";
import { useEffect } from "react";

export default function StudentDashboard() {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const student = user as Student;
  const ay = getAcademicYear();
  const booking = student ? getStudentBooking(student.id, ay.year) : undefined;
  const roommates = booking ? getRoomOccupants(booking.hallName, booking.block, booking.roomNumber, ay.year).filter(s => s.id !== student.id) : [];

  useEffect(() => {
    if (!user || userType !== "student") navigate("/student/login");
  }, [user, userType, navigate]);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BedDouble className="h-6 w-6" />
            <h1 className="text-lg font-bold">UniHall</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:inline">{student.fullName}</span>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl mb-1">Welcome, {student.fullName.split(" ")[0]}!</h2>
          <p className="text-muted-foreground">Academic Year: {ay.year} • {ay.isOpen ? "Booking Open" : "Booking Closed"}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <div className="bg-card rounded-xl border p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Personal Information</h3>
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ["Full Name", student.fullName],
                ["Index Number", student.indexNumber],
                ["Contact", student.contact],
                ["Email", student.email],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Academic Info */}
          <div className="bg-card rounded-xl border p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Academic Information</h3>
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ["Program", student.program],
                ["Level", `Level ${student.level}`],
                ["Academic Year", ay.year],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Room Allocation */}
          <div className="bg-card rounded-xl border p-6 md:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Room Allocation</h3>
            </div>
            {booking ? (
              <div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                  {[
                    ["Hall", booking.hallName],
                    ["Block", `Block ${booking.block}`],
                    ["Room", `Room ${booking.roomNumber}`],
                    ["Booked", new Date(booking.bookedAt).toLocaleDateString()],
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
                        <span key={r.id} className="bg-muted px-3 py-1 rounded-full text-sm">{r.fullName}</span>
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
                {ay.isOpen ? (
                  <Button onClick={() => navigate("/student/book")}>Book a Room</Button>
                ) : (
                  <p className="text-sm text-destructive">Booking is currently closed</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
