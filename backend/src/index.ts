import express from 'express';
import cors from 'cors';
import timeslotRouter from './routes/timeslots';
import reservationRouter from './routes/reservations';
import flightControl from './routes/flightcontrol';
import errorHandler from './util/middleware';

const app = express();

app.use(express.json());
app.use(cors());
app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});
app.use('/api/timeslots', timeslotRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/flight-control', flightControl);
app.use(errorHandler);

export default app;
