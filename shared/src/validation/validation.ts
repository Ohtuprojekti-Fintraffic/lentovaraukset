import { z } from 'zod';

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
  const periodErrorMessage = 'Period start time cannot be later than the end time';
  const period = z.object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
  })
    .refine((res) => {
      if (!res.periodStart && !res.periodEnd) return true;
      if (res.periodStart && res.periodEnd) {
        return res.periodStart < res.periodEnd;
      }
      return false;
    }, { message: periodErrorMessage });
  return period;
};

const createReservationValidator = (slotGranularityMinutes: number, maxDaysInFuture: number) => {
  const message = `Reservation must be multiples of ${slotGranularityMinutes} minutes`;
  const pastErrorMessage = 'Reservation cannot be in past';
  const tooFarInFutureErrorMessage = `Reservation start time cannot be further than ${maxDaysInFuture} days away`;
  const startNotLessThanEndErrorMessage = 'Reservation start time cannot be later than the end time';

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
    aircraftId: z.string(),
    info: z.string().optional(),
    phone: z.string(),
  })
    .refine((res) => res.start < res.end, { message: startNotLessThanEndErrorMessage });

  return Reservation;
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
  getTimeRangeValidator,
  isTimeInPast,
  airfieldValidator,
  createPeriodValidation,
};
