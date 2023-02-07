import express from 'express';
import timeslotService from '../services/timeslotService';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  const { from } = req.query;
  const { until } = req.query;
  const timeslots = await timeslotService.getInTimeRange(
    new Date(from as string),
    new Date(until as string),
  );

  res.json(timeslots);
});

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

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newTimeSlot = req.body;
    const timeslot = await timeslotService.createTimeslot(newTimeSlot);
    res.json(timeslot);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.patch('/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const modifiedTimeslot = req.body;
  await timeslotService.updateById(id, modifiedTimeslot);
  res.status(200).json(modifiedTimeslot);
});

export default router;
