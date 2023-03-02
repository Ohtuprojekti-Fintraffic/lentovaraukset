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

router.delete('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id = Number(req.params.id);
  try {
    await timeslotService.deleteById(id);
    res.send(`Timeslot ${id} deleted`);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // TODO: get slotGranularityMinutes from airfield
    const newTimeSlot = createTimeSlotValidator(20).parse(req.body);

    const timeslot = await timeslotService.createTimeslot(newTimeSlot);
    res.json(timeslot);
  } catch (error: unknown) {
    next(error);
  }
});

router.patch('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // TODO: get slotGranularityMinutes from airfield
    const modifiedTimeslot = createTimeSlotValidator(20).parse(req.body);

    const id = Number(req.params.id);
    await timeslotService.updateById(id, modifiedTimeslot);
    res.status(200).json(modifiedTimeslot);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
