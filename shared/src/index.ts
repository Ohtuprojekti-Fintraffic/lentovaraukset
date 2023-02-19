export interface ReservationEntry {
  id: number;
  start: Date;
  end: Date;
  user: string;
  aircraftId: string;
  phone: string;
  email?: string;
  info: string;
}

export interface TimeslotEntry {
  id: number;
  start: Date;
  end: Date;
}

export interface ReservationStatus {
  availableSlots: (TimeslotEntry & { freeSlotsAmount: number })[];
  reservedSlots: ReservationEntry[];
}

interface CalendarEvent {
  id: number,
  title: string,
  start: Date,
  end: Date,
  user: string,
  info: string
}

export type ReservationCalendarEvent = Partial<CalendarEvent>;

export type TimeSlotsCalendarEvent = Omit<CalendarEvent, 'title' | 'user' | 'info'>;
