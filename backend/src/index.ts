import express from 'express';
import cors from 'cors';
import { Timeslot, Reservation, User } from './models';
import timeslotRouter from './routes/timeslots';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

app.use('/api/timeslots', timeslotRouter);

app.get('/api/staff/reservation-status', async (_req: any, res: express.Response) => {
  try {
    const returnedTimeSlots = await Timeslot.findAll({
      include: {
        model: Reservation,
        attributes: ['startTime', 'endTime', 'info'],
      },
    });
    const availableSlots = returnedTimeSlots.map((obj) => (
      {
        ...obj.dataValues,
        freeSlotsAmount: (obj.dataValues.maxAmount - obj.dataValues.reservations.length),
      }));

    const reservedSlots = await Reservation.findAll({
      include: {
        model: User,
        attributes: ['name', 'role'],
      },
    });

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
