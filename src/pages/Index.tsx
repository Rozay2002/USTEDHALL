import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BedDouble, GraduationCap, Shield, ArrowRight } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BedDouble className="h-7 w-7" />
            <span className="text-xl font-bold font-heading">UniHall</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/student/login"><Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">Student</Button></Link>
            <Link to="/admin/login"><Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">Admin</Button></Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-muted px-4">
        <div className="max-w-3xl w-full text-center py-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Booking Open — 2025/2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            University Hall<br />
            <span className="text-primary">Room Booking System</span>
          </h1>
          <div className="mb-10 max-w-xl mx-auto h-[5.5rem] sm:h-[4rem] flex items-start justify-center">
            <p className="text-muted-foreground text-lg leading-relaxed overflow-hidden whitespace-normal sm:whitespace-nowrap border-r-2 border-primary animate-typewriter animate-blink-caret">
              Book your accommodation quickly and easily. View real-time availability, select your preferred room, and get your allocation slip instantly.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            <Link to="/student/login" className="group">
              <div className="bg-card border rounded-xl p-8 card-hover text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Student Portal</h2>
                <p className="text-sm text-muted-foreground mb-4">Login or register to book a room</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Get started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link to="/admin/login" className="group">
              <div className="bg-card border rounded-xl p-8 card-hover text-center">
                <div className="h-14 w-14 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                  <Shield className="h-7 w-7 text-secondary-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Admin Portal</h2>
                <p className="text-sm text-muted-foreground mb-4">Manage halls, rooms & bookings</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Admin login <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UniHall — University Hall Room Booking System
      </footer>
    </div>
  );
}
