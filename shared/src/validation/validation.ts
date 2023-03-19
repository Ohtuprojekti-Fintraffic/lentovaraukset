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
  const message = `Times must be multiples of ${slotGranularityMinutes} minutes`;
  const pastErrorMessage = 'Timeslot cannot be in past';
  const startNotLessThanEndErrorMessage = 'Timeslot start time cannot be later than the end time';

  const TimeSlot = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage }),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage }),
  })
    .refine((res) => res.start < res.end, { message: startNotLessThanEndErrorMessage });

  return TimeSlot;
};

const createPeriodValidation = () => {
  const period = z.object({
    periodEnd: z.coerce.date(),
    name: z.coerce.string(),
  });
  return period;
};

const createReservationValidator = (slotGranularityMinutes: number, maxDaysInFuture: number) => {
  const message = `Reservation must be multiples of ${slotGranularityMinutes} minutes`;
  const pastErrorMessage = 'Reservation cannot be in past';
  const tooFarInFutureErrorMessage = `Reservation start time cannot be further than ${maxDaysInFuture} days away`;
  const startNotLessThanEndErrorMessage = 'Reservation start time cannot be later than the end time';
  const aircraftIdEmptyErrorMessage = 'Aircraft ID cannot be empty';
  const phoneNumberEmptyErrorMessage = 'Phone number cannot be empty';

  const Reservation = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage })
      .refine(
        (value) => isTimeAtMostInFuture(value, maxDaysInFuture),
        { message: tooFarInFutureErrorMessage },
      ),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message })
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

const airfieldValidator = z.object({
  name: z.string(),
  eventGranularityMinutes: z.coerce.number(),
  maxConcurrentFlights: z.coerce.number(),
});

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
