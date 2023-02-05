import express from 'express';
import flightstaffService from '../services/flightstaffService';

const router = express.Router();

router.get('/reservation-status', async (_req: any, res: express.Response) => {
  try {
    const reservationStatus = await flightstaffService.getReservationStatus();
    res.send(JSON.stringify(reservationStatus));
  } catch (error) {
    res.status(501).send();
  }
});

export default router;
