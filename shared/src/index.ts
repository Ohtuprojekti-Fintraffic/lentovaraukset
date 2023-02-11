export interface ReservationEntry {
  id: number;
  startTime: Date;
  endTime: Date;
  user: string;
  plateNumber: string;
  phone: string;
  email?: string;
  info: string;
}

export interface TimeFrame {
  id: number;
  startTime: Date;
  endTime: Date;
}
