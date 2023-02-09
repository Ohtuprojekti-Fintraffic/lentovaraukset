import express from 'express';
import reservationService from '../services/reservationService';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  const { from } = req.query;
  const { until } = req.query;
  const reservations = await reservationService.getInTimeRange(
    new Date(from as string),
    new Date(until as string),
  );

  res.json(reservations);
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
    const {
      start,
      end,
      aircraftId,
      info,
    } = req.body;
    const reservation = await reservationService.createReservation(start, end, aircraftId, info);
    res.json(reservation);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
