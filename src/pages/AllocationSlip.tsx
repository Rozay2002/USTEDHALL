import { useAuth } from "@/lib/auth-context";
import { Student, getStudentBooking, getRoomOccupants, getAcademicYear } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useRef } from "react";

export default function AllocationSlip() {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const student = user as Student;
  const ay = getAcademicYear();
  const booking = student ? getStudentBooking(student.id, ay.year) : undefined;
  const roommates = booking ? getRoomOccupants(booking.hallName, booking.block, booking.roomNumber, ay.year).filter(s => s.id !== student.id) : [];
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || userType !== "student") navigate("/student/login");
    if (user && !booking) navigate("/student/dashboard");
  }, [user, userType, booking, navigate]);

  const handlePrint = () => window.print();

  if (!student || !booking) return null;

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 print:hidden">
          <Button variant="ghost" size="sm" onClick={() => navigate("/student/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex-1" />
          <Button onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" /> Print / Download
          </Button>
        </div>

        <div ref={slipRef} className="bg-card border rounded-xl p-8 shadow-lg">
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-2xl font-bold text-primary">University Hall Accommodation</h1>
            <h2 className="text-lg text-muted-foreground mt-1">Room Allocation Slip</h2>
            <p className="text-sm text-muted-foreground mt-1">Academic Year: {ay.year}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            {[
              ["Full Name", student.fullName],
              ["Index Number", student.indexNumber],
              ["Program", student.program],
              ["Level", `Level ${student.level}`],
              ["Contact", student.contact],
              ["Email", student.email],
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
                ["Hall", booking.hallName],
                ["Block", `Block ${booking.block}`],
                ["Room", `Room ${booking.roomNumber}`],
                ["Date", new Date(booking.bookedAt).toLocaleDateString()],
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
                {roommates.map(r => <li key={r.id}>• {r.fullName} ({r.indexNumber})</li>)}
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
