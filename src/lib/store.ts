// Static configuration - halls, blocks, rooms are fixed
export const HALLS = ["Opoku Ware Hall", "Autonomy Hall", "Atwima Hall"];
export const BLOCKS = ["A", "B", "C", "D"];
export const ROOMS_PER_BLOCK = 10;
export const MAX_OCCUPANCY = 3;
export const ADMIN_SECRET = "ADMIN2025";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  index_number: string | null;
  contact: string | null;
  program: string | null;
  level: number | null;
  avatar_url?: string | null;
}

export interface Booking {
  id: string;
  student_id: string;
  hall_name: string;
  block: string;
  room_number: number;
  academic_year: string;
  booked_at: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  is_open: boolean;
  is_current: boolean;
}
