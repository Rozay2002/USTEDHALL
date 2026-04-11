import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Student, HALLS, BLOCKS, ROOMS_PER_BLOCK, MAX_OCCUPANCY, getRoomOccupancy, getAcademicYear, bookRoom, getSuggestedRooms } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BedDouble, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEffect } from "react";

type Step = "hall" | "block" | "room";

export default function BookRoom() {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const student = user as Student;
  const ay = getAcademicYear();

  const [step, setStep] = useState<Step>("hall");
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [confirmRoom, setConfirmRoom] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user || userType !== "student") navigate("/student/login");
  }, [user, userType, navigate]);

  if (!student) return null;

  const handleSelectHall = (hall: string) => {
    setSelectedHall(hall);
    setStep("block");
  };

  const handleSelectBlock = (block: string) => {
    setSelectedBlock(block);
    setStep("room");
  };

  const handleBook = () => {
    if (!confirmRoom) return;
    try {
      bookRoom(student.id, selectedHall, selectedBlock, confirmRoom);
      setConfirmRoom(null);
      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err.message);
      setConfirmRoom(null);
    }
  };

  const goBack = () => {
    if (step === "room") setStep("block");
    else if (step === "block") setStep("hall");
    else navigate("/student/dashboard");
  };

  const roomOccupancy = (room: number) => getRoomOccupancy(selectedHall, selectedBlock, room, ay.year);

  const suggestions = selectedHall ? getSuggestedRooms(selectedHall, ay.year) : [];

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <BedDouble className="h-6 w-6" />
          <h1 className="text-lg font-bold">Book a Room</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={goBack} className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-muted-foreground">/</span>
          <span className={step === "hall" ? "font-semibold" : "text-muted-foreground"}>Hall</span>
          {step !== "hall" && <>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={step === "block" ? "font-semibold" : "text-muted-foreground"}>{selectedHall}</span>
          </>}
          {step === "room" && <>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold">Block {selectedBlock}</span>
          </>}
        </div>

        {/* Step: Select Hall */}
        {step === "hall" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Select a Hall</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {HALLS.map((hall, i) => (
                <button key={hall} onClick={() => handleSelectHall(hall)}
                  className="bg-card border rounded-xl p-6 text-left card-hover animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-3">
                    <BedDouble className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold">{hall}</h3>
                  <p className="text-sm text-muted-foreground mt-1">4 Blocks • 40 Rooms</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Select Block */}
        {step === "block" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Select a Block in {selectedHall}</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {BLOCKS.map((block, i) => {
                const totalOcc = Array.from({ length: ROOMS_PER_BLOCK }, (_, j) => getRoomOccupancy(selectedHall, block, j + 1, ay.year)).reduce((a, b) => a + b, 0);
                const maxTotal = ROOMS_PER_BLOCK * MAX_OCCUPANCY;
                return (
                  <button key={block} onClick={() => handleSelectBlock(block)}
                    className="bg-card border rounded-xl p-6 text-center card-hover animate-slide-up"
                    style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="text-3xl font-bold text-primary mb-2">{block}</div>
                    <p className="text-sm text-muted-foreground">{totalOcc}/{maxTotal} occupied</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Select Room */}
        {step === "room" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4">{selectedHall} — Block {selectedBlock}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: ROOMS_PER_BLOCK }, (_, i) => i + 1).map(room => {
                const occ = roomOccupancy(room);
                const isFull = occ >= MAX_OCCUPANCY;
                return (
                  <button key={room} disabled={isFull}
                    onClick={() => setConfirmRoom(room)}
                    className={`bg-card border rounded-xl p-4 flex items-center justify-between card-hover ${isFull ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <div>
                      <span className="font-semibold">Room {room}</span>
                      <p className="text-xs text-muted-foreground">{occ}/{MAX_OCCUPANCY} students</p>
                    </div>
                    <StatusBadge occupancy={occ} max={MAX_OCCUPANCY} />
                  </button>
                );
              })}
            </div>

            {suggestions.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Suggested Available Rooms</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button key={`${s.block}-${s.room}`}
                      onClick={() => { setSelectedBlock(s.block); setConfirmRoom(s.room); }}
                      className="bg-card border rounded-lg px-3 py-2 text-sm hover:border-primary transition-colors">
                      Block {s.block}, Room {s.room} <StatusBadge occupancy={s.occupancy} max={MAX_OCCUPANCY} className="ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirm Dialog */}
        <Dialog open={confirmRoom !== null} onOpenChange={() => setConfirmRoom(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              You are about to book <strong>Room {confirmRoom}</strong>, <strong>Block {selectedBlock}</strong> in <strong>{selectedHall}</strong> for the <strong>{ay.year}</strong> academic year.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmRoom(null)}>Cancel</Button>
              <Button onClick={handleBook}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={() => { setShowSuccess(false); navigate("/student/dashboard"); }}>
          <DialogContent>
            <div className="text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground text-sm mb-4">Your room has been successfully booked.</p>
              <Button onClick={() => { setShowSuccess(false); navigate("/student/dashboard"); }}>
                Go to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
