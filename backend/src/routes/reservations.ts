import express from 'express';
import { createReservationValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
import reservationService from '../services/reservationService';

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
    const newReservation = createReservationValidator(10).parse(req.body);
    const reservation = await reservationService.createReservation(newReservation);
    res.json(reservation);
  } catch (error: unknown) {
    next(error);
  }
});

router.patch('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const id = Number(req.params.id);
    const validReservationUpdate = createReservationValidator(10).partial().parse(req.body);
    const modifiedReservation = await reservationService.updateById(id, validReservationUpdate);
    res.status(200).json(modifiedReservation);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
