export interface ReservationEntry {
  id: number;
  start: Date;
  end: Date;
  user: string;
  aircraftId: string;
  phone: string;
  email?: string;
  info?: string;
}

export interface TimeslotEntry {
  id: number;
  start: Date;
  end: Date;
}
