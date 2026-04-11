import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Admin, getStudents, getBookings, getAcademicYear, setAcademicYear, deleteStudent, cancelBooking, HALLS, BLOCKS, ROOMS_PER_BLOCK, MAX_OCCUPANCY, getRoomOccupancy } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Shield, LogOut, Users, Building2, CalendarDays, BookOpen, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const admin = user as Admin;
  const [, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const ay = getAcademicYear();
  const students = getStudents();
  const bookings = getBookings();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!user || userType !== "admin") navigate("/admin/login");
  }, [user, userType, navigate]);

  if (!admin) return null;

  const toggleBooking = () => {
    setAcademicYear({ ...ay, isOpen: !ay.isOpen });
    toast.success(ay.isOpen ? "Booking closed" : "Booking opened");
    refresh();
  };

  const handleDeleteStudent = () => {
    if (deleteTarget) {
      deleteStudent(deleteTarget);
      setDeleteTarget(null);
      toast.success("Student removed");
      refresh();
    }
  };

  const handleCancelBooking = (id: string) => {
    cancelBooking(id);
    toast.success("Booking cancelled");
    refresh();
  };

  const totalRooms = HALLS.length * BLOCKS.length * ROOMS_PER_BLOCK;
  const totalCapacity = totalRooms * MAX_OCCUPANCY;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:inline">{admin.fullName}</span>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Students", value: students.length, color: "text-primary" },
            { icon: BookOpen, label: "Bookings", value: bookings.length, color: "text-success" },
            { icon: Building2, label: "Total Rooms", value: totalRooms, color: "text-secondary" },
            { icon: CalendarDays, label: "Capacity", value: `${bookings.length}/${totalCapacity}`, color: "text-muted-foreground" },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4 animate-fade-in">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Academic Year Control */}
        <div className="bg-card border rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Academic Year: {ay.year}</h3>
            <p className="text-sm text-muted-foreground">Control booking availability</p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="booking-toggle">{ay.isOpen ? "Booking Open" : "Booking Closed"}</Label>
            <Switch id="booking-toggle" checked={ay.isOpen} onCheckedChange={toggleBooking} />
          </div>
        </div>

        <Tabs defaultValue="students">
          <TabsList className="mb-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <div className="bg-card border rounded-xl overflow-hidden">
              {students.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">No students registered yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {["Name", "Index", "Program", "Level", "Email", ""].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3">{s.fullName}</td>
                          <td className="px-4 py-3 font-mono">{s.indexNumber}</td>
                          <td className="px-4 py-3">{s.program}</td>
                          <td className="px-4 py-3">{s.level}</td>
                          <td className="px-4 py-3">{s.email}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(s.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="bg-card border rounded-xl overflow-hidden">
              {bookings.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {["Student", "Hall", "Block", "Room", "Year", "Date", ""].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => {
                        const st = students.find(s => s.id === b.studentId);
                        return (
                          <tr key={b.id} className="border-t hover:bg-muted/50">
                            <td className="px-4 py-3">{st?.fullName ?? "Unknown"}</td>
                            <td className="px-4 py-3">{b.hallName}</td>
                            <td className="px-4 py-3">{b.block}</td>
                            <td className="px-4 py-3">{b.roomNumber}</td>
                            <td className="px-4 py-3">{b.academicYear}</td>
                            <td className="px-4 py-3">{new Date(b.bookedAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm" onClick={() => handleCancelBooking(b.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
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
          </TabsContent>

          <TabsContent value="rooms">
            <div className="space-y-6">
              {HALLS.map(hall => (
                <div key={hall} className="bg-card border rounded-xl p-6">
                  <h3 className="font-bold mb-4">{hall}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {BLOCKS.map(block => (
                      <div key={block} className="border rounded-lg p-3">
                        <p className="font-semibold mb-2">Block {block}</p>
                        <div className="space-y-1">
                          {Array.from({ length: ROOMS_PER_BLOCK }, (_, i) => i + 1).map(room => {
                            const occ = getRoomOccupancy(hall, block, room, ay.year);
                            return (
                              <div key={room} className="flex items-center justify-between text-xs">
                                <span>Room {room}</span>
                                <StatusBadge occupancy={occ} max={MAX_OCCUPANCY} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation */}
        <Dialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Remove Student</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This will remove the student and all their bookings. This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteStudent}>Remove</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
