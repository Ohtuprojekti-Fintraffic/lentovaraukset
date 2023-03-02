import express from 'express';
import airfieldService from '../services/airfieldService';

const router = express.Router();

router.get('/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const airfield = airfieldService.getAirfield(id);
  res.json(airfield);
});

export default router;
