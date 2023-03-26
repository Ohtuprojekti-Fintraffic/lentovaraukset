import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { airfieldValidator } from '@lentovaraukset/shared/src/validation/validation';
import express from 'express';
import airfieldService from '../services/airfieldService';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const airfields = await airfieldService.getAirfields();
    res.json(airfields);
  } catch (error: unknown) {
    console.log(error);
    next(error);
  }
});

router.get('/:code', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { code } = req.params;
  try {
    const airfield = await airfieldService.getAirfield(code);
    res.json(airfield);
  } catch (error: unknown) {
    next(error);
  }
});

router.put('/:code', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { code } = req.params;
  try {
    const airfieldEntry: AirfieldEntry = airfieldValidator.parse(req.body);
    const airfield = await airfieldService.updateByCode(code, airfieldEntry);
    res.json(airfield);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
