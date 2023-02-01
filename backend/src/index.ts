import express from 'express';
import { Timeslot } from './models';

const app = express();
app.use(express.json());

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

app.get('/api/get/timeslot/:start/:end', async (req: express.Request, res: express.Response) => {
  const { start: startTime, end: endTime } = req.params;
  // console.log(`${new Date(Number(startTime))} ${new Date(Number(endTime))}`);
  Timeslot.findAll({
    where: {
      startTime: { $between: [startTime, endTime] },
    },
  });
  res.send(`${new Date(Number(startTime))} ${new Date(Number(endTime))}`);
});

app.post('/api/post/newtimeslot', async (req: express.Request, res: express.Response) => {
  try {
    const { start: startTime } = req.body;
    const timeslot = await Timeslot.create({ startTime, maxAmount: 1 });
    res.json(timeslot);
  } catch (error) {
    console.log('creating new timeslot failed');
    res.status(400).json(error);
  }
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
