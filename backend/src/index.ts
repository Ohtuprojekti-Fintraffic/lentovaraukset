import express from 'express';
import { Timeslot } from './models';

const app = express();
app.use(express.json());

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

app.delete('/api/timeslots/:startTime', async (req: express.Request, res: express.Response) => {
  const { startTime } = req.params;
  await Timeslot.findOne({ where: { startTime } })
    .then((timeslot) => {
      if (timeslot) {
        timeslot.destroy();
        res.send(`Timeslot ${startTime} deleted`);
      } else {
        res.status(404).json(`Timeslot ${startTime} not found`);
      }
    })
    .catch((error) => res.status(500).json(error));
});

export default app;
