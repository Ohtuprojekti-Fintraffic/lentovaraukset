import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { isTimeInPast, reservationIsWithinTimeslot } from '@lentovaraukset/shared/src/validation/validation';
import { Reservation } from '../models';

const getInTimeRange = async (startTime: Date, endTime: Date) => {
  const reservations: Reservation[] = await Reservation.findAll({
    where: {
      [Op.and]: [
        {
          start: {
            [Op.lt]: endTime,
          },
          end: {
            [Op.gt]: startTime,
          },
        },
      ],
    },
  });
  return reservations;
};

const deleteById = async (id: number) => {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new Error('Reservation does not exist');
  if (isTimeInPast(reservation.start)) throw new Error('Reservation in past cannot be deleted');
  await reservation.destroy();
};

const createReservation = async (newReservation: Omit<ReservationEntry, 'id' | 'user'>): Promise<ReservationEntry> => {
  const timeslots = await timeslotService
    .getInTimeRange(newReservation.start, newReservation.end);
  if (timeslots.length !== 1) {
    throw new Error('Reservation should be created for one timeslot');
  }

  const timeslot = timeslots[0];

  if (!reservationIsWithinTimeslot(newReservation, timeslot)) {
    throw new Error('Reservation is not within timeslot date range');
  }

  const reservation: Reservation = await Reservation.create(newReservation);

  if (timeslot) {
    await reservation.setTimeslot(timeslot);
  }
  const user = 'NYI';
  return { ...reservation.dataValues, user };
};

const updateById = async (
  id: number,
  reservation: Omit<ReservationEntry, 'id' | 'user'>,
): Promise<ReservationEntry> => {
  const newTimeslots = await timeslotService
    .getInTimeRange(reservation.start, reservation.end);
  if (newTimeslots.length !== 1) {
    throw new Error('Reservation should be created for one timeslot');
  }

  const newTimeslot = newTimeslots[0];

  if (!reservationIsWithinTimeslot(reservation, newTimeslot)) {
    throw new Error('Reservation is not within timeslot date range');
  }

  const oldReservation: Reservation | null = await Reservation.findByPk(id);

  if (oldReservation && isTimeInPast(oldReservation.start)) {
    throw new Error('Reservation in past cannot be modified');
  }
  const oldTimeslot = await oldReservation?.getTimeslot();
  if (newTimeslot && oldTimeslot) {
    await oldReservation?.setTimeslot(newTimeslot);
  }
  const [updatedReservation] = await Reservation.upsert(
    { ...reservation, id },
  );
  const user = 'NYI';
  return { ...updatedReservation.dataValues, user };
};

export default {
  createReservation,
  deleteById,
  updateById,
  getInTimeRange,
};
