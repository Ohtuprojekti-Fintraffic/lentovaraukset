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
  ReservationExceedsTimeslot = 'ReservationExceedsTimeslot',
  InvalidAirfield = 'InvalidAirfield',
  RouteNotFound = 'RouteNotFound',
  ConcurrentReservations = 'ConcurrentReservations',
  BlockedTimeslot = 'BlockedTimeslot', 
  ReservationInMultipleTimeslots = 'ReservationInMultipleTimeslots',
  ConsecutiveTimeslots = 'ConsecutiveTimeslots',
  OverlappingTimeslots = 'OverlappingTimeslots',
  TimeslotNotFound = 'TimeslotNotFound',
  TimeslotNotEditable = 'TimeslotNotEditable',
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
