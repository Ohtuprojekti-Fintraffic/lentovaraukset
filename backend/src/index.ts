import express from 'express';
import { Timeslot } from './models';

const app = express();
app.use(express.json());

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

app.delete('/api/timeslots/:id', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  await Timeslot.findByPk(id)
    .then((timeslot) => {
      if (timeslot) {
        timeslot.destroy();
        res.send(`Timeslot ${id} deleted`);
      } else {
        res.status(404).json(`Timeslot ${id} not found`);
      }
    })
    .catch((error) => res.status(500).json(error));
});

export default app;
