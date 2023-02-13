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

export default createTimeSlotValidator;
