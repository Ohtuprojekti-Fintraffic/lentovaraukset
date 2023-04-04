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
    next(error);
  }
});

router.get('/:code', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const airfield = await airfieldService.getAirfield(req.params.code);
    res.json(airfield);
  } catch (error: unknown) {
    next(error);
  }
});

router.put('/:code', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const airfieldEntry: Omit<AirfieldEntry, 'code'> = airfieldValidator(false).parse(req.body);
    const airfield = await airfieldService.updateByCode(req.params.code, airfieldEntry);
    res.json(airfield);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validatedAirfield: any = airfieldValidator(true).parse(req.body);
    const airfield = await airfieldService.createAirfield(validatedAirfield);
    res.json(airfield);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
