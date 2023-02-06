import express from 'express';
import timeslotService from '../services/timeslotService';

const router = express.Router();

router.delete('/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  try {
    const deleted = await timeslotService.deleteById(id);
    if (deleted) {
      res.send(`Timeslot ${id} deleted`);
    } else {
      res.status(404).json(`Timeslot ${id} not found`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(error);
    }
  }
});

router.get('/:start/:end', async (req: express.Request, res: express.Response) => {
  const { start: startTime, end: endTime } = req.params;
  const timeslots = await timeslotService.getTimeslotsByTimerange(startTime, endTime);
  res.json(timeslots);
});

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { startTime } = req.body;
    const timeslot = await timeslotService.createTimeslot(startTime);
    res.json(timeslot);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.patch('/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const newTimeslot = req.body;
  await timeslotService.updateById(id, newTimeslot);
  res.status(200).json(newTimeslot);
});

export default router;
