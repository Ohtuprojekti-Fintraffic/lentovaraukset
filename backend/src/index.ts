import express from 'express';
import { Timeslot, Reservation, ReservedTimeslot } from './models';

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
/**
 * handle requests for flight staff
 * handle reques for resrvation status
*/
app.get('/api/staff/reservation-status', async (_req: any, res: express.Response) => {
  try {
    const availableSlots = await Timeslot.findAll({
      include: {
        model: Reservation,
        attributes: ['startTime', 'endTime', 'info'],
      },
    });

    const reservedSlots = await ReservedTimeslot.findAll();

    const reservationStatus = {
      availableSlots,
      reservedSlots,
    };
    res.send(JSON.stringify(reservationStatus));
  } catch (error) {
    res.status(501).send();
  }
});

export default app;
