import express from 'express';
import cors from 'cors';
import timeslotRouter from './routes/timeslots';
import reservationRouter from './routes/reservations';
import airfieldRouter from './routes/airfields';
import { errorHandler, airfieldExtractor } from './util/middleware';
import { Airfield } from './models';

const app = express();

// Not sure if this is the right place for t  s.
// But this extends the express request to allow for custom keys
// like req.airfield
declare global {
  namespace Express {
    interface Request {
      airfield: Airfield | null
    }
  }
}

app.use(express.json());
app.use(cors());

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

// mergeParams required because otherwise the params won't be there as they're defined up here
const aeRouter = express.Router({ mergeParams: true }).use(airfieldExtractor);
app.use('/api/:airfieldCode/', aeRouter);
aeRouter.use('/reservations', reservationRouter);
aeRouter.use('/timeslots', timeslotRouter);

app.use('/api/airfields', airfieldRouter);

app.use(errorHandler);

export default app;
