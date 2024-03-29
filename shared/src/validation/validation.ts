import { z, type ZodTypeAny } from 'zod';
import { DateTime } from 'luxon';
import { ReservationEntry, TimeslotEntry } from '..';

const minutesToMilliseconds = (minutes: number) => minutes * 1000 * 60;

const isMultipleOfMinutes = (minutes: number) => (dateToCheck: Date) => (
  dateToCheck.getTime() % minutesToMilliseconds(minutes) === 0
);

const isTimeInPast = (time: Date): boolean => new Date(time) < new Date();

const isTimeFarEnoughInFuture = (time: Date, offsetDays: number): boolean => (
  DateTime.now().plus({ days: offsetDays }) < DateTime.fromJSDate(time)
);

const isTimeAtMostInFuture = (time: Date, maxDaysInFuture: number): boolean => (
  DateTime.fromJSDate(time) <= DateTime.now().plus({ days: maxDaysInFuture })
);

const createTimeSlotValidatorObject = (
  slotGranularityMinutes: number,
  ignoreStartInPast: boolean = false,
) => {
  // Time must be a multiple of ${slotGranularityMinutes} minutes
  const minuteMultipleMessage = `Ajan tulee olla jokin ${slotGranularityMinutes} minuutin moninkerta`;
  const pastErrorMessage = 'Timeslot cannot be in past';

  return z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => ignoreStartInPast || !isTimeInPast(value), { message: pastErrorMessage }),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage }),
    type: z.enum(['available', 'blocked']),
    info: z.string().nullable(),
  });
};

function refineTimeslotObject<T extends ZodTypeAny>(tsValidationObject: T) {
  const startNotLessThanEndErrorMessage = 'Timeslot start time cannot be later than the end time';
  return tsValidationObject.refine((res) => res.start < res.end, {
    message: startNotLessThanEndErrorMessage,
    path: ['general'],
  });
}

const createTimeSlotValidator = (
  slotGranularityMinutes: number,
  ignoreStartInPast: boolean = false,
) => refineTimeslotObject(createTimeSlotValidatorObject(slotGranularityMinutes, ignoreStartInPast));

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
    days: daysValidation,
  });
  return period;
};

const deletePeriodValidation = () => {
  const period = z.object({
    startingFrom: z.coerce.date(),
  });
  return period;
};

const createReservationValidator = (
  slotGranularityMinutes: number,
  maxDaysInFuture: number,
  daysToStart: number,
) => {
  // Time must be a multiple of ${slotGranularityMinutes} minutes
  const minuteMultipleMessage = `Ajan tulee olla jokin ${slotGranularityMinutes} minuutin moninkerta`;
  // Reservation cannot be in past
  const pastErrorMessage = 'Varaus ei voi ajoittua menneisyyteen';
  const farEnoughErrorMessage = 'Varaus tulee tehdä vähintään 1 päivää etukäteen';
  // Reservation start time cannot be further than ${maxDaysInFuture} days away
  const tooFarInFutureErrorMessage = `Voit tehdä varauksen korkeintaan ${maxDaysInFuture} päivän päähän`;
  // Reservation start time cannot be later than the end time
  const startNotLessThanEndErrorMessage = 'Varauksen alkuaika ei voi olla myöhempi kuin loppuaika';
  // Aircraft ID cannot be empty
  const aircraftIdEmptyErrorMessage = 'Lentokentän tunnus vaaditaan';
  // Phone number cannot be empty
  const phoneNumberEmptyErrorMessage = 'Puhelinnumero vaaditaan';

  const Reservation = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage })
      .refine(
        (value) => isTimeFarEnoughInFuture(value, daysToStart),
        { message: farEnoughErrorMessage },
      )
      .refine(
        (value) => isTimeAtMostInFuture(value, maxDaysInFuture),
        { message: tooFarInFutureErrorMessage },
      ),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: minuteMultipleMessage })
      .refine((value) => !isTimeInPast(value), { message: pastErrorMessage })
      .refine(
        (value) => isTimeFarEnoughInFuture(value, daysToStart),
        { message: farEnoughErrorMessage },
      ),
    aircraftId: z.string().trim().min(1, { message: aircraftIdEmptyErrorMessage }),
    info: z.string().optional(),
    phone: z.string().trim().min(1, { message: phoneNumberEmptyErrorMessage }),
  })
    .refine((res) => res.start < res.end, {
      message: startNotLessThanEndErrorMessage,
      path: ['general'],
    });

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

const createAirfieldWithoutCodeObject = () => {
  const nameEmptyErrorMessage = 'Airfield name cannot be empty';
  const concurrentFlightsMessage = 'Concurrent flights must be minimum 1';
  const multipleErrorMessage = 'Time must be multiple of 10';

  return z.object({
    name: z.string().min(1, { message: nameEmptyErrorMessage }),
    eventGranularityMinutes: z.coerce
      .number()
      .multipleOf(10, { message: multipleErrorMessage }),
    maxConcurrentFlights: z.coerce.number().min(1, { message: concurrentFlightsMessage }),
  });
};

function extendAirfieldWithCode(
  airfieldObject: ReturnType<typeof createAirfieldWithoutCodeObject>,
) {
  const idErrorMessage = 'Id must be ICAO airport code';
  const regex = /^[A-Z]{4}$/;

  return airfieldObject.extend({
    code: z.string()
      .refine((value) => regex.test(value), { message: idErrorMessage }),
  });
}

// Typescript can't automatically infer if code is there or not
function airfieldValidator(validateId: false): ReturnType<typeof createAirfieldWithoutCodeObject>;
function airfieldValidator(validateId: true): ReturnType<typeof extendAirfieldWithCode>;
function airfieldValidator(validateId: boolean = true) {
  const base = createAirfieldWithoutCodeObject();

  const validateWithId = extendAirfieldWithCode(base);

  return validateId ? validateWithId : base;
}

const configurationValidator = () => {
  const base = z.object({
    daysToStart: z.coerce.number(),
    maxDaysInFuture: z.coerce.number(),
  });

  return base;
};

const createTimeOfDayValidator = (slotGranularityMinutes: number) => z.object({
  hours: z.coerce.number().min(0).max(23),
  minutes: z.coerce.number().min(0).max(59)
    .refine((value) => value % slotGranularityMinutes === 0),
});

const createTimeslotFormGroupShape = () => {
  const days = z.object({
    maanantai: z.coerce.boolean(),
    tiistai: z.coerce.boolean(),
    keskiviikko: z.coerce.boolean(),
    torstai: z.coerce.boolean(),
    perjantai: z.coerce.boolean(),
    lauantai: z.coerce.boolean(),
    sunnuntai: z.coerce.boolean(),
  });
  return {
    isRecurring: z.coerce.boolean().optional(),
    periodEnds: z.coerce.string().optional(),
    days: days.optional(),
  };
};

const createGroupUpdateValidator = (slotGranularityMinutes: number) => {
  const times = z.object({
    startingFrom: z.coerce.date(),
    startTimeOfDay: createTimeOfDayValidator(slotGranularityMinutes),
    endTimeOfDay: createTimeOfDayValidator(slotGranularityMinutes),
  });

  return times;
};

export {
  createGroupUpdateValidator,
  createTimeSlotValidatorObject,
  createTimeslotFormGroupShape,
  refineTimeslotObject,
  createTimeSlotValidator,
  createReservationValidator,
  reservationIsWithinTimeslot,
  getTimeRangeValidator,
  isTimeInPast,
  isTimeAtMostInFuture,
  isTimeFarEnoughInFuture,
  airfieldValidator,
  configurationValidator,
  createPeriodValidation,
  deletePeriodValidation,
};
