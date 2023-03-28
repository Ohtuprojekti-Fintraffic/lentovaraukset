import { configurationValidator } from '@lentovaraukset/shared/src/validation/validation';
import express from 'express';
import configurationService from '../services/configurationService';

const router = express.Router();

router.get('/latest', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const configuration = await configurationService.getLatestConfiguration();
    res.json(configuration);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validatedConfiguration = configurationValidator().parse(req.body);
    const configuration = await configurationService.createConfiguration(validatedConfiguration);
    res.json(configuration);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
