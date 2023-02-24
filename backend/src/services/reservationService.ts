import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { Reservation } from '../models';

const numConcurrentReservations: number = 1;

const getReservationFromRange = async (startTime: Date, endTime: Date) => {
  const reservations: Reservation[] = await Reservation.findAll({
    where: {
      [Op.and]: [
        {
          start: {
            [Op.gte]: startTime,
          },
          end: {
            [Op.lte]: endTime,
          },
        },
      ],
    },
  });
  return reservations;
};

const getInTimeRange = async (rangeStartTime: Date, rangeEndTime: Date) => {
  const reservations = await getReservationFromRange(rangeStartTime, rangeEndTime);

  return reservations.map(({ id, start, end }) => ({
    title: 'Varattu', id, start, end,
  }));
};

const allowReservationChange = async (
  startTime: Date,
  endTime: Date,
  id: number,
): Promise<boolean> => {
  const reservations: Reservation[] = await Reservation.findAll({
    where: {
      id: {
        [Op.ne]: id,
      },
      start: {
        [Op.lt]: endTime,
      },
      end: {
        [Op.gt]: startTime,
      },
    },
  });
  return reservations.length >= numConcurrentReservations;
};

const allowNewReservation = async (
  startTime: Date,
  endTime: Date,
): Promise<Boolean> => {
  const reservations: Reservation[] = await Reservation.findAll({
    where: {
      start: {
        [Op.lt]: endTime,
      },
      end: {
        [Op.gt]: startTime,
      },
    },
  });
  return reservations.length >= numConcurrentReservations;
};

const deleteById = async (id: number) => {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) {
    throw new Error('Reservation does not exist');
  }
  reservation.destroy();
};

const createReservation = async (newReservation: {
  start: Date,
  end: Date,
  aircraftId: string,
  info?: string,
  phone: string, }): Promise<ReservationEntry> => {
  if (await allowNewReservation(newReservation.start, newReservation.end)) {
    throw new Error('Too many concurrent reservations');
  } else {
    const timeslots = await timeslotService
      .getTimeslotFromRange(newReservation.start, newReservation.end);
    const reservation: Reservation = await Reservation.create(newReservation);
    await reservation.addTimeslots(timeslots);
    const user = 'NYI';
    return { ...reservation.dataValues, user };
  }
};

const updateById = async (
  id: number,
  reservation: { start: Date, end: Date },
): Promise<void> => {
  if (await allowReservationChange(reservation.start, reservation.end, id)) {
    throw new Error('Too many concurrent reservations');
  } else {
    const newTimeslots = await timeslotService
      .getTimeslotFromRange(reservation.start, reservation.end);
    const oldReservation: Reservation | null = await Reservation.findByPk(id);
    const oldTimeslots = await oldReservation?.getTimeslots();
    await oldReservation?.removeTimeslots(oldTimeslots);
    await oldReservation?.addTimeslots(newTimeslots);
    await Reservation.update(reservation, { where: { id } });
  }
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
  getReservationFromRange,
};
