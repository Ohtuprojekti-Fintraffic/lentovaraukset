import express from 'express';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import { createReservationValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
import { ServiceErrorCode } from '@lentovaraukset/shared/src';
import reservationService from '../services/reservationService';
import configurationService from '../services/configurationService';
import { errorIfNoAirfield } from '../util/middleware';
import ServiceError from '../util/errors';

const allowReservation = async (
  startTime: Date,
  endTime: Date,
  id: number | undefined,
  maxConcurrentReservations: number,
  airportCode: string,
): Promise<boolean> => {
  const reservations = (await reservationService.getInTimeRange(startTime, endTime, airportCode))
    .filter((e) => e.id !== id);

  const mostConcurrentReservations = countMostConcurrent(reservations);

  return mostConcurrentReservations < maxConcurrentReservations;
};

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    errorIfNoAirfield(req);
    const { airfield } = req;
    const { from } = req.query;
    const { until } = req.query;
    const { start, end } = getTimeRangeValidator().parse({
      start: new Date(from as string),
      end: new Date(until as string),
    });
    const reservations = await reservationService.getInTimeRange(start, end, airfield.code);
    res.json(reservations);
  } catch (error: unknown) {
    next(error);
  }
});

router.delete('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id = Number(req.params.id);
  try {
    await reservationService.deleteById(id);
    res.send(`Reservation ${id} deleted`);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    errorIfNoAirfield(req);
    const { airfield } = req;
    const configuration = await configurationService.getById(1);
    const newReservation = createReservationValidator(
      airfield.eventGranularityMinutes,
      configuration.maxDaysInFuture,
      configuration.daysToStart,
    ).parse(req.body);

    if (!await allowReservation(
      newReservation.start,
      newReservation.end,
      undefined,
      airfield.maxConcurrentFlights,
      airfield.code,
    )) {
      throw new ServiceError(ServiceErrorCode.ConcurrentReservations, 'Too many concurrent reservations');
    }

    const reservation = await reservationService.createReservation(airfield.code, newReservation);
    res.json(reservation);
  } catch (error: unknown) {
    next(error);
  }
});

router.put('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const id = Number(req.params.id);
    errorIfNoAirfield(req);
    const { airfield } = req;
    const configuration = await configurationService.getById(1);
    const validReservationUpdate = createReservationValidator(
      airfield.eventGranularityMinutes,
      configuration.maxDaysInFuture,
      configuration.daysToStart,
    ).parse(req.body);

    if (!await allowReservation(
      validReservationUpdate.start,
      validReservationUpdate.end,
      id,
      airfield.maxConcurrentFlights,
      airfield.code,
    )) {
      throw new ServiceError(ServiceErrorCode.ConcurrentReservations, 'Too many concurrent reservations');
    }

    const modifiedReservation = await reservationService.updateById(
      airfield.code,
      id,
      validReservationUpdate,
    );

    res.status(200).json(modifiedReservation);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
