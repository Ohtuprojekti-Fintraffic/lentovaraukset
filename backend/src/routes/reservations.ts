import express from 'express';
import { createReservationValidator, updateReservationValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import reservationService from '../services/reservationService';
import airfieldService from '../services/airfieldService';

const allowReservation = async (
  startTime: Date,
  endTime: Date,
  id: number | undefined,
  maxConcurrentReservations: number,
): Promise<boolean> => {
  const reservations = (await reservationService.getReservationFromRange(startTime, endTime))
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

router.delete('/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  try {
    await reservationService.deleteById(id);
    res.send(`Reservation ${id} deleted`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const airfield = await airfieldService.getAirfield(1); // TODO: get airfieldId from request
    const newReservation = createReservationValidator(airfield.eventGranularityMinutes)
      .parse(req.body);

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
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
  }
});

router.patch('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const airfield = await airfieldService.getAirfield(1); // TODO: get airfieldId from request
    const validReservationUpdate = updateReservationValidator(airfield.eventGranularityMinutes)
      .parse(req.body);

    if (!await allowReservation(
      validReservationUpdate.start,
      validReservationUpdate.end,
      undefined,
      airfield.maxConcurrentFlights,
    )) {
      throw new Error('Too many concurrent reservations');
    }

    const modifiedReservation = await reservationService.updateById(id, validReservationUpdate);
    res.status(200).json(modifiedReservation);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
  }
});

export default router;
