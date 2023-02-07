import express from 'express';
import reservationService from '../services/reservationService';

const router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { start, end, info } = req.body;
    const reservation = await reservationService.createReservation(start, end, info);
    res.json(reservation);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
