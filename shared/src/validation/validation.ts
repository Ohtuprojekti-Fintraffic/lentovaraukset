import { z } from 'zod';

const minutesToMilliseconds = (minutes: number) => minutes * 1000 * 60;
const isMultipleOfMinutes = (minutes: number) => (dateToCheck: Date) => (
  dateToCheck.getTime() % minutesToMilliseconds(minutes) === 0
);

const createTimeSlotValidator = (slotGranularityMinutes: number) => {
  const message = `Times must be multiples of ${slotGranularityMinutes} minutes`;
  const TimeSlot = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message }),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message }),
  });

  return TimeSlot;
};

const createReservationValidator = (slotGranularityMinutes: number) => {
  const message = `Reservation must be multiples of ${slotGranularityMinutes} minutes`;
  const Reservation = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message }),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message }),
    aircraftId: z.string(),
    info: z.string().optional(),
    phone: z.string(),
  });

  return Reservation;
};

const updateReservationValidator = (slotGranularityMinutes: number) => {
  const message = `Reservation must be multiples of ${slotGranularityMinutes} minutes`;
  const Reservation = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message }),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message }),
    aircraftId: z.string(),
    info: z.string().optional(),
    phone: z.string(),
  });

  return Reservation;
};

const getTimeRangeValidator = () => {
  const TimeRange = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  });

  return TimeRange;
};

export {
  createTimeSlotValidator,
  createReservationValidator,
  updateReservationValidator,
  getTimeRangeValidator,
};
