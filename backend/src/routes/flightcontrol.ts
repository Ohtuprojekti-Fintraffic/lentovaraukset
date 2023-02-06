import express from 'express';
import flightControlService from '../services/flightControlService';

const router = express.Router();

router.get('/reservation-status', async (_req: any, res: express.Response) => {
  try {
    const reservationStatus = await flightControlService.getReservationStatus();
    res.json(reservationStatus);
  } catch (error) {
    res.status(501).send();
  }
});

export default router;
