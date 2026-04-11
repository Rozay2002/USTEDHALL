export interface Student {
  id: string;
  fullName: string;
  indexNumber: string;
  contact: string;
  program: string;
  level: number;
  email: string;
  password: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

export interface Booking {
  id: string;
  studentId: string;
  hallName: string;
  block: string;
  roomNumber: number;
  academicYear: string;
  bookedAt: string;
}

export interface AcademicYear {
  year: string;
  isOpen: boolean;
}

const HALLS = ["Opoku Ware Hall", "Autonomy Hall", "Atwima Hall"];
const BLOCKS = ["A", "B", "C", "D"];
const ROOMS_PER_BLOCK = 10;
const MAX_OCCUPANCY = 3;

function getStore<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function setStore<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Init default academic year
export function getAcademicYear(): AcademicYear {
  return getStore<AcademicYear>("academicYear", { year: "2025/2026", isOpen: true });
}

export function setAcademicYear(ay: AcademicYear) {
  setStore("academicYear", ay);
}

// Students
export function getStudents(): Student[] {
  return getStore<Student[]>("students", []);
}

export function registerStudent(s: Omit<Student, "id">): Student {
  const students = getStudents();
  if (students.find(x => x.email === s.email)) throw new Error("Email already registered");
  if (students.find(x => x.indexNumber === s.indexNumber)) throw new Error("Index number already registered");
  const newStudent: Student = { ...s, id: crypto.randomUUID() };
  students.push(newStudent);
  setStore("students", students);
  return newStudent;
}

export function loginStudent(email: string, password: string): Student {
  const s = getStudents().find(x => x.email === email && x.password === password);
  if (!s) throw new Error("Invalid email or password");
  return s;
}

// Admins
export function getAdmins(): Admin[] {
  return getStore<Admin[]>("admins", []);
}

const ADMIN_SECRET = "ADMIN2025";

export function registerAdmin(a: Omit<Admin, "id">, secretCode: string): Admin {
  if (secretCode !== ADMIN_SECRET) throw new Error("Invalid secret code");
  const admins = getAdmins();
  if (admins.find(x => x.email === a.email)) throw new Error("Email already registered");
  const newAdmin: Admin = { ...a, id: crypto.randomUUID() };
  admins.push(newAdmin);
  setStore("admins", admins);
  return newAdmin;
}

export function loginAdmin(email: string, password: string): Admin {
  const a = getAdmins().find(x => x.email === email && x.password === password);
  if (!a) throw new Error("Invalid email or password");
  return a;
}

// Bookings
export function getBookings(): Booking[] {
  return getStore<Booking[]>("bookings", []);
}

export function getRoomOccupancy(hall: string, block: string, room: number, year: string): number {
  return getBookings().filter(b => b.hallName === hall && b.block === block && b.roomNumber === room && b.academicYear === year).length;
}

export function getRoomOccupants(hall: string, block: string, room: number, year: string): Student[] {
  const bookings = getBookings().filter(b => b.hallName === hall && b.block === block && b.roomNumber === room && b.academicYear === year);
  const students = getStudents();
  return bookings.map(b => students.find(s => s.id === b.studentId)!).filter(Boolean);
}

export function getStudentBooking(studentId: string, year: string): Booking | undefined {
  return getBookings().find(b => b.studentId === studentId && b.academicYear === year);
}

export function bookRoom(studentId: string, hall: string, block: string, room: number): Booking {
  const ay = getAcademicYear();
  if (!ay.isOpen) throw new Error("Booking is currently closed for this academic year");
  
  const existing = getStudentBooking(studentId, ay.year);
  if (existing) throw new Error("You already have an active booking for this academic year");
  
  const occupancy = getRoomOccupancy(hall, block, room, ay.year);
  if (occupancy >= MAX_OCCUPANCY) throw new Error("This room is full");

  const booking: Booking = {
    id: crypto.randomUUID(),
    studentId,
    hallName: hall,
    block,
    roomNumber: room,
    academicYear: ay.year,
    bookedAt: new Date().toISOString(),
  };
  const bookings = getBookings();
  bookings.push(booking);
  setStore("bookings", bookings);
  return booking;
}

export function cancelBooking(bookingId: string) {
  const bookings = getBookings().filter(b => b.id !== bookingId);
  setStore("bookings", bookings);
}

export function deleteStudent(studentId: string) {
  setStore("students", getStudents().filter(s => s.id !== studentId));
  setStore("bookings", getBookings().filter(b => b.studentId !== studentId));
}

export function getSuggestedRooms(hall: string, year: string): { block: string; room: number; occupancy: number }[] {
  const suggestions: { block: string; room: number; occupancy: number }[] = [];
  for (const block of BLOCKS) {
    for (let room = 1; room <= ROOMS_PER_BLOCK; room++) {
      const occ = getRoomOccupancy(hall, block, room, year);
      if (occ < MAX_OCCUPANCY) {
        suggestions.push({ block, room, occupancy: occ });
      }
    }
  }
  return suggestions.sort((a, b) => a.occupancy - b.occupancy).slice(0, 5);
}

export { HALLS, BLOCKS, ROOMS_PER_BLOCK, MAX_OCCUPANCY };
