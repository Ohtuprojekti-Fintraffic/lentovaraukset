import express from 'express';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import { createReservationValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
import reservationService from '../services/reservationService';
import airfieldService from '../services/airfieldService';
import configurationService from '../services/configurationService';

const allowReservation = async (
  startTime: Date,
  endTime: Date,
  id: number | undefined,
  maxConcurrentReservations: number,
): Promise<boolean> => {
  const reservations = (await reservationService.getInTimeRange(startTime, endTime))
    .filter((e) => e.id !== id);

  const mostConcurrentReservations = countMostConcurrent(reservations);

  return mostConcurrentReservations < maxConcurrentReservations;
};

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  const { from } = req.query;
  const { until } = req.query;
  const { start, end } = getTimeRangeValidator().parse({
    start: new Date(from as string),
    end: new Date(until as string),
  });
  const reservations = await reservationService.getInTimeRange(start, end);
  res.json(reservations);
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
    const airfield = await airfieldService.getAirfield('EGLL'); // TODO: get airfieldId from request
    const configuration = await configurationService.getById(1);
    const newReservation = createReservationValidator(
      airfield.eventGranularityMinutes,
      configuration.maxDaysInFuture,
    ).parse(req.body);

    if (!await allowReservation(
      newReservation.start,
      newReservation.end,
      undefined,
      airfield.maxConcurrentFlights,
    )) {
      throw new Error('Too many concurrent reservations');
    }

    const reservation = await reservationService.createReservation(newReservation);
    res.json(reservation);
  } catch (error: unknown) {
    next(error);
  }
});

router.put('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const id = Number(req.params.id);
    const airfield = await airfieldService.getAirfield('EGLL');
    const configuration = await configurationService.getById(1);
    const validReservationUpdate = createReservationValidator(
      airfield.eventGranularityMinutes,
      configuration.maxDaysInFuture,
    ).parse(req.body);

    if (!await allowReservation(
      validReservationUpdate.start,
      validReservationUpdate.end,
      id,
      airfield.maxConcurrentFlights,
    )) {
      throw new Error('Too many concurrent reservations');
    }

    const modifiedReservation = await reservationService.updateById(id, validReservationUpdate);
    res.status(200).json(modifiedReservation);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
