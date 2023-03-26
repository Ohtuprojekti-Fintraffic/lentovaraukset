import { z } from 'zod';
import { ReservationEntry, TimeslotEntry } from '..';

const minutesToMilliseconds = (minutes: number) => minutes * 1000 * 60;

const isMultipleOfMinutes = (minutes: number) => (dateToCheck: Date) => (
  dateToCheck.getTime() % minutesToMilliseconds(minutes) === 0
);

const isTimeInPast = (time: Date): boolean => new Date(time) < new Date();

const isTimeAtMostInFuture = (time: Date, maxDaysInFuture: number): boolean => {
  const max = new Date();
  max.setDate(max.getDate() + maxDaysInFuture);

  return time <= max;
};

const createTimeSlotValidator = (slotGranularityMinutes: number) => {
  // Time must be a multiple of ${slotGranularityMinutes} minutes
  const minuteMultipleMessage = `Ajan tulee olla jokin ${slotGranularityMinutes} minuutin moninkerta`;
  const pastErrorMessage = 'Timeslot cannot be in past';
  const startNotLessThanEndErrorMessage = 'Timeslot start time cannot be later than the end time';

  const TimeSlot = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage }),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage }),
    type: z.enum(['available', 'blocked']),
    info: z.string().nullable(),
  }).refine((res) => res.start < res.end, { message: startNotLessThanEndErrorMessage });

  return TimeSlot;
};

const daysValidation = z.object({
  monday: z.coerce.boolean(),
  tuesday: z.coerce.boolean(),
  wednesday: z.coerce.boolean(),
  thursday: z.coerce.boolean(),
  friday: z.coerce.boolean(),
  saturday: z.coerce.boolean(),
  sunday: z.coerce.boolean(),
});

const createPeriodValidation = () => {
  const period = z.object({
    periodEnd: z.coerce.date(),
    name: z.coerce.string(),
    days: daysValidation,
  });
  return period;
};

const createReservationValidator = (slotGranularityMinutes: number, maxDaysInFuture: number) => {
  // Time must be a multiple of ${slotGranularityMinutes} minutes
  const minuteMultipleMessage = `Ajan tulee olla jokin ${slotGranularityMinutes} minuutin moninkerta`;
  // Reservation cannot be in past
  const pastErrorMessage = 'Varaus ei voi ajoittua menneisyyteen';
  // Reservation start time cannot be further than ${maxDaysInFuture} days away
  const tooFarInFutureErrorMessage = `Voit tehdä varauksen korkeintaan ${maxDaysInFuture} päivän päähän`;
  // Reservation start time cannot be later than the end time
  const startNotLessThanEndErrorMessage = 'Varauksen alkuaika ei voi olla myöhempi kuin loppuaika';
  // Aircraft ID cannot be empty
  const aircraftIdEmptyErrorMessage = 'Vaadittu kenttä';
  // Phone number cannot be empty
  const phoneNumberEmptyErrorMessage = 'Vaadittu kenttä';

  const Reservation = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage })
      .refine(
        (value) => isTimeAtMostInFuture(value, maxDaysInFuture),
        { message: tooFarInFutureErrorMessage },
      ),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage }),
    aircraftId: z.string().trim().min(1, { message: aircraftIdEmptyErrorMessage }),
    info: z.string().optional(),
    phone: z.string().trim().min(1, { message: phoneNumberEmptyErrorMessage }),
  })
    .refine((res) => res.start < res.end, { message: startNotLessThanEndErrorMessage });

  return Reservation;
};

const reservationIsWithinTimeslot = (res: Pick<ReservationEntry, 'start' | 'end'>, ts: Pick<TimeslotEntry, 'start' | 'end'>) => {
  const startOk = res.start >= ts.start && res.start <= ts.end;
  const endOk = res.end >= ts.start && res.end <= ts.end;
  return startOk && endOk;
};

const getTimeRangeValidator = () => {
  const TimeRange = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  });

  return TimeRange;
};

const airfieldValidator = () => {
  const nameEmptyErrorMessage = 'Airfield name cannot be empty';
  const concurrentFlightsMessage = 'Concurrent flights must be minimum 1';
  const multipleErrorMessage = 'Time must be multiple of 10';
  const idErrorMessage = 'Id must be ICAO airport code';
  const regex = /[A-Z]{4}$/;

  const Airfield = z.object({
    id: z.string()
      .refine((value) => regex.test(value), { message: idErrorMessage })
      .optional(),
    name: z.string().min(1, { message: nameEmptyErrorMessage }),
    eventGranularityMinutes: z.coerce
      .number()
      .multipleOf(10, { message: multipleErrorMessage }),
    maxConcurrentFlights: z.coerce.number().min(1, { message: concurrentFlightsMessage }),
  });

  return Airfield;
};

export {
  createTimeSlotValidator,
  createReservationValidator,
  reservationIsWithinTimeslot,
  getTimeRangeValidator,
  isTimeInPast,
  isTimeAtMostInFuture,
  airfieldValidator,
  createPeriodValidation,
};
