import express from 'express';
import { createTimeSlotValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
import timeslotService from '../services/timeslotService';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  const { from } = req.query;
  const { until } = req.query;
  const { start, end } = getTimeRangeValidator().parse({
    start: new Date(from as string),
    end: new Date(until as string),
  });
  const timeslots = await timeslotService.getInTimeRange(start, end);

  res.json(timeslots);
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  try {
    await timeslotService.deleteById(id);
    res.send(`Timeslot ${id} deleted`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    // TODO: get slotGranularityMinutes from airfield
    const newTimeSlot = createTimeSlotValidator(20).parse(req.body);

    const timeslot = await timeslotService.createTimeslot(newTimeSlot);
    res.json(timeslot);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
  }
});

router.patch('/:id', async (req: express.Request, res: express.Response) => {
  try {
    // TODO: get slotGranularityMinutes from airfield
    const modifiedTimeslot = createTimeSlotValidator(20).parse(req.body);

    const id = Number(req.params.id);
    await timeslotService.updateById(id, modifiedTimeslot);
    res.status(200).json(modifiedTimeslot);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
  }
});

export default router;
