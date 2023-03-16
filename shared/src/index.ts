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

export type TimeslotType = 'available' | 'blocked';

export interface TimeslotEntry {
  id: number;
  start: Date;
  end: Date;
  type: TimeslotType;
}

export interface AirfieldEntry {
  id?: number;
  name: string;
  maxConcurrentFlights: number;
  eventGranularityMinutes: number;
}
