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
  group?: string | null;
  info: string | null;
  airfieldCode: string;
}

export interface AirfieldEntry {
  code: string;
  name: string;
  maxConcurrentFlights: number;
  eventGranularityMinutes: number;
}

export interface ConfigurationEntry {
  id: number;
  daysToStart: number;
  maxDaysInFuture: number;
}

export enum ServiceErrorCode {
  ReservationExceedsTimeslot = 400,
  InvalidAirfield = 400,
  RouteNotFound = 400,
  ConcurrentReservations = 400,
  BlockedTimeslot = 400,
  ReservationInMultipleTimeslots = 400,
  ConsecutiveTimeslots = 400,
  OverlappingTimeslots = 400,
  TimeslotNotFound = 400,
  TimeslotNotEditable = 400,
}

export interface WeekInDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}
