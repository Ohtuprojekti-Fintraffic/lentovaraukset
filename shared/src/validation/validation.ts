import { z, type ZodTypeAny } from 'zod';
import { DateTime } from 'luxon';
import { ReservationEntry, TimeslotEntry } from '..';

type TranslationFunc = Function | undefined;

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
  t: TranslationFunc = undefined,
) => {
  // Time must be a multiple of ${slotGranularityMinutes} minutes
  const minuteMultipleMessage = t
    ? t('validation.minuteMultiple', { slotGranularityMinutes })
    : `Ajan tulee olla jokin ${slotGranularityMinutes} minuutin moninkerta`;
  const pastErrorMessage = t
    ? t('validation.notInPast')
    : 'Timeslot cannot be in past';

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

function refineTimeslotObject<T extends ZodTypeAny>(
  tsValidationObject: T,
  t: TranslationFunc = undefined,
) {
  const startNotLessThanEndErrorMessage = t
    ? t('validation.timeslotStartLaterThanEnd')
    : 'Timeslot start time cannot be later than the end time';
  return tsValidationObject.refine((res) => res.start < res.end, {
    message: startNotLessThanEndErrorMessage,
    path: ['general'],
  });
}

const createTimeSlotValidator = (
  slotGranularityMinutes: number,
  ignoreStartInPast: boolean = false,
  t: TranslationFunc = undefined,
) => refineTimeslotObject(
  createTimeSlotValidatorObject(slotGranularityMinutes, ignoreStartInPast, t),
  t,
);

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
  t: TranslationFunc = undefined,
) => {
  // Time must be a multiple of ${slotGranularityMinutes} minutes
  const messages = t
    ? {
      minuteMultiple: t('validation.minuteMultiple', { slotGranularityMinutes }),
      // Reservation cannot be in past
      pastError: t('validation.pastError'),
      farEnoughError: t('validation.farEnoughError', { daysToStart }),
      // Reservation start time cannot be further than ${maxDaysInFuture} days away
      tooFarInFutureError: t('validation.tooFarInFutureError', { maxDaysInFuture }),
      // Reservation start time cannot be later than the end time
      startNotLessThanEndError: t('validation.reservationStartLaterThanEnd'),
      // Aircraft ID cannot be empty
      aircraftIdEmptyError: t('validation.aircraftIdEmptyError'),
      // Phone number cannot be empty
      phoneNumberEmptyError: t('validation.phoneNumberEmptyError'),
    } : {
      minuteMultiple: `Ajan tulee olla jokin ${slotGranularityMinutes} minuutin moninkerta`,
      pastError: 'Varaus ei voi ajoittua menneisyyteen',
      farEnoughError: `Varaus tulee tehdä vähintään ${daysToStart} päivää etukäteen`,
      tooFarInFutureError: `Voit tehdä varauksen korkeintaan ${maxDaysInFuture} päivän päähän`,
      startNotLessThanEndError: 'Varauksen alkuaika ei voi olla myöhempi kuin loppuaika',
      aircraftIdEmptyError: 'Lentokentän tunnus vaaditaan',
      phoneNumberEmptyError: 'Puhelinnumero vaaditaan',
    };

  const Reservation = z.object({
    start: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: messages.minuteMultiple })
      .refine((value) => !isTimeInPast(value), { message: messages.pastError })
      .refine(
        (value) => isTimeFarEnoughInFuture(value, daysToStart),
        { message: messages.farEnoughError },
      )
      .refine(
        (value) => isTimeAtMostInFuture(value, maxDaysInFuture),
        { message: messages.tooFarInFutureError },
      ),
    end: z.coerce
      .date()
      .refine(isMultipleOfMinutes(slotGranularityMinutes), { message: messages.minuteMultiple })
      .refine((value) => !isTimeInPast(value), { message: messages.pastError })
      .refine(
        (value) => isTimeFarEnoughInFuture(value, daysToStart),
        { message: messages.farEnoughError },
      ),
    aircraftId: z.string().trim().min(1, { message: messages.aircraftIdEmptyError }),
    info: z.string().optional(),
    phone: z.string().trim().min(1, { message: messages.phoneNumberEmptyError }),
  })
    .refine((res) => res.start < res.end, {
      message: messages.startNotLessThanEndError,
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

const createAirfieldWithoutCodeObject = (
  t: TranslationFunc = undefined,
) => {
  const nameEmptyErrorMessage = t
    ? t('validation.airfieldNameEmpty')
    : 'Airfield name cannot be empty';
  const concurrentFlightsMessage = t
    ? t('validation.concurrentFlightsMinimum')
    : 'Concurrent flights must be at least 1';
  const multipleErrorMessage = t
    ? t('validation.timeMultipleOfTen')
    : 'Time must be multiple of 10';

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
  t: TranslationFunc = undefined,
) {
  const idErrorMessage = t
    ? t('validation.airfieldICAOInvalid')
    : 'Id must be an ICAO airport code';
  const regex = /^[A-Z]{4}$/;

  return airfieldObject.extend({
    code: z.string()
      .refine((value) => regex.test(value), { message: idErrorMessage }),
  });
}

// Typescript can't automatically infer if code is there or not
function airfieldValidator(validateId: false): ReturnType<typeof createAirfieldWithoutCodeObject>;
function airfieldValidator(validateId: true): ReturnType<typeof extendAirfieldWithCode>;
function airfieldValidator(
  validateId: boolean = true,
  t: TranslationFunc = undefined,
) {
  const base = createAirfieldWithoutCodeObject(t);

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
