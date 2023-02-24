import express from 'express';
import { createReservationValidator, updateReservationValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
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
    const newReservation = createReservationValidator(10).parse(req.body);
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
    const validReservationUpdate = updateReservationValidator(10).parse(req.body);
    const modifiedReservation = await reservationService.updateById(id, validReservationUpdate);
    res.status(200).json(modifiedReservation);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
  }
});

export default router;
