import { configurationValidator } from '@lentovaraukset/shared/src/validation/validation';
import express from 'express';
import configurationService from '../services/configurationService';

const router = express.Router();

router.get('/1', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const configuration = await configurationService.getById(1);
    res.json(configuration);
  } catch (error: unknown) {
    next(error);
  }
});

router.put('/1', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validatedConfiguration = configurationValidator().parse(req.body);
    const configuration = await configurationService.updateById(1, validatedConfiguration);
    res.json(configuration);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
