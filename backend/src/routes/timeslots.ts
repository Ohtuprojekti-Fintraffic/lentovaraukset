import express from 'express';
import { createTimeSlotValidator, getTimeRangeValidator } from '@lentovaraukset/shared/src/validation/validation';
import timeslotService from '../services/timeslotService';
import airfieldService from '../services/airfieldService';

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
    const airfield = await airfieldService.getAirfield(1); // TODO: get airfieldId from request
    const newTimeSlot = createTimeSlotValidator(airfield.eventGranularityMinutes).parse(req.body);
    // TODO: check if timeslot overlaps with existing timeslots

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
    const airfield = await airfieldService.getAirfield(1); // TODO: get airfieldId from request
    const modifiedTimeslot = createTimeSlotValidator(airfield.eventGranularityMinutes)
      .parse(req.body);
    // TODO: check if timeslot overlaps with existing timeslots

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
