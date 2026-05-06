import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Booking, AcademicYear } from "@/lib/store";

export function useCurrentAcademicYear() {
  const [ay, setAy] = useState<AcademicYear | null>(null);

  useEffect(() => {
    const fetchAy = async () => {
      const { data } = await supabase
        .from("academic_years")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();
      setAy(data as AcademicYear | null);
    };
    fetchAy();

    const channel = supabase
      .channel(`academic_years_changes_${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "academic_years" }, () => fetchAy())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return ay;
}

export function useBookings(academicYear?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!academicYear) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("academic_year", academicYear);
      setBookings((data as Booking[]) || []);
      setLoading(false);
    };
    fetchBookings();

    const channel = supabase
      .channel(`bookings_changes_${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchBookings())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [academicYear]);

  return { bookings, loading };
}

export function getRoomOccupancy(bookings: Booking[], hall: string, block: string, room: number) {
  return bookings.filter(b => b.hall_name === hall && b.block === block && b.room_number === room).length;
}
