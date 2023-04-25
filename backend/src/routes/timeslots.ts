import express from 'express';
import {
  createTimeSlotValidator,
  getTimeRangeValidator,
  createPeriodValidation,
  createGroupUpdateValidator,
  deletePeriodValidation,
} from '@lentovaraukset/shared/src/validation/validation';
import timeslotService from '../services/timeslotService';
import { errorIfNoAirfield } from '../util/middleware';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    errorIfNoAirfield(req);
    const { from } = req.query;
    const { until } = req.query;
    const { start, end } = getTimeRangeValidator().parse({
      start: new Date(from as string),
      end: new Date(until as string),
    });
    const timeslots = await timeslotService.getInTimeRange(req.airfield?.code, start, end);
    res.json(timeslots);
  } catch (error: unknown) {
    next(error);
  }
});

router.delete('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const id = Number(req.params.id);
    await timeslotService.deleteById(id);
    res.send(`Timeslot ${id} deleted`);
  } catch (error: unknown) {
    next(error);
  }
});

router.delete('/group/:group', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    errorIfNoAirfield(req);
    const { params: { group } } = req;
    const period = deletePeriodValidation()
      .parse(req.body);

    const deleted = await timeslotService.deleteByGroup(group, period.startingFrom);
    res.status(200).json(`${deleted} timeslots from period ${group} deleted`);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    errorIfNoAirfield(req);
    const { airfield } = req;

    const newTimeSlot = createTimeSlotValidator(airfield.eventGranularityMinutes).parse(req.body);
    // TODO: check if timeslot overlaps with existing timeslots
    const timeslot = await timeslotService.createTimeslot({
      ...newTimeSlot,
      airfieldCode: airfield.code,
    });
    res.json(timeslot);
  } catch (error: unknown) {
    next(error);
  }
});

router.put('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    errorIfNoAirfield(req);
    const { airfield } = req;
    const modifiedTimeslot = {
      ...createTimeSlotValidator(airfield.eventGranularityMinutes, true)
        .parse(req.body),
      airfieldCode: airfield.code,
    };

    const id = Number(req.params.id);
    if (req.body.periodEnd) {
      const period = createPeriodValidation().parse(req.body);
      const createdPeriod = await timeslotService.createPeriod(
        airfield.code,
        id,
        period,
        modifiedTimeslot,
      );
      res.json(createdPeriod);
    } else {
      await timeslotService.updateById(id, modifiedTimeslot);
      res.status(200).json(modifiedTimeslot);
    }
  } catch (error: unknown) {
    next(error);
  }
});

router.put('/group/:group', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    errorIfNoAirfield(req);
    const { airfield, params: { group } } = req;

    const updatedTimes = createGroupUpdateValidator(airfield.eventGranularityMinutes)
      .parse(req.body);
    const updatedTimeslots = await timeslotService.updateByGroup(
      airfield.code,
      group,
      updatedTimes,
    );
    res.json(updatedTimeslots);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
