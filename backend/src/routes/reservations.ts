import express from 'express';
import { createReservationValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
import reservationService from '../services/reservationService';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { from } = req.query;
    const { until } = req.query;
    const { start, end } = getTimeRangeValidator().parse({
      start: new Date(from as string),
      end: new Date(until as string),
    });
    const reservations = await reservationService.getInTimeRange(start, end);
    res.json(reservations);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  try {
    const deleted = await reservationService.deleteById(id);
    if (deleted) {
      res.send(`Reservation ${id} deleted`);
    } else {
      res.status(404).json(`Reservation ${id} not found`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(error);
    }
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newReservation = createReservationValidator(10).parse(req.body);
    const reservation = await reservationService.createReservation(newReservation);
    res.json(reservation);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.patch('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const modifiedReservation = createReservationValidator(10).parse(req.body);
    await reservationService.updateById(id, modifiedReservation);
    res.status(200).json(modifiedReservation);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
