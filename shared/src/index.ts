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

export interface TimeFrame {
  id: number;
  start: Date;
  end: Date;
}

export interface ReservationStatus {
  availableSlots: (TimeFrame & { freeSlotsAmount: number })[];
  reservedSlots: ReservationEntry[];
}
