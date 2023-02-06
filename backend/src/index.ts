import express from 'express';
import cors from 'cors';
import timeslotRouter from './routes/timeslots';
import flightControl from './routes/flightcontrol';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/timeslots', timeslotRouter);
app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});
app.use('/api/timeslots', timeslotRouter);
app.use('/api/flight-control', flightControl);

export default app;
