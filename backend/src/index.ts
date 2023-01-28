import express from 'express';
import { Timeslot } from './models';

const app = express();

app.use(express.json())

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

app.post('/api/timeslots', async (req: express.Request, res: express.Response) => {
  const { timeslotId: timeslotId } = req.body;
  console.log(timeslotId)
  const timeslot = await Timeslot.findByPk(timeslotId)
  console.log(timeslot)
  if (timeslot) {
    timeslot.destroy()
    console.log('success')
    res.send('success')
  } else {
    console.log('fail')
    res.send('fail')
  }
});

export default app;
