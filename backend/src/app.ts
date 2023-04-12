import express from 'express';
import cors from 'cors';
import timeslotRouter from './routes/timeslots';
import reservationRouter from './routes/reservations';
import airfieldRouter from './routes/airfields';
import configurationRouter from './routes/configurations';
import { errorHandler, airfieldExtractor, notFoundHandler } from './util/middleware';
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
app.use('/api/:airfieldCode/reservations', aeRouter);
app.use('/api/:airfieldCode/reservations', reservationRouter);

app.use('/api/:airfieldCode/timeslots', aeRouter);
app.use('/api/:airfieldCode/timeslots', timeslotRouter);

app.use('/api/airfields', airfieldRouter);
app.use('/api/configurations', configurationRouter);

app.use(errorHandler);
app.use('*', notFoundHandler);

export default app;
