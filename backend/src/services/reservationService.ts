import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { Reservation } from '../models';

const maxConcurrentReservations: number = 3;

const getReservationFromRange = async (startTime: Date, endTime: Date) => {
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
  return reservations;
};

const getInTimeRange = async (rangeStartTime: Date, rangeEndTime: Date) => {
  const reservations = await Reservation.findAll({
    where: {
      [Op.or]: [{
        start: {
          [Op.between]: [rangeStartTime, rangeEndTime],
          [Op.not]: [rangeEndTime],
        },
      }, {
        end: {
          [Op.between]: [rangeStartTime, rangeEndTime],
          [Op.not]: [rangeStartTime],
        },
      }],
    },
  });

  return reservations.map(({ id, start, end }) => ({
    title: 'Varattu', id, start, end,
  }));
};

const allowReservation = async (
  startTime: Date,
  endTime: Date,
  id: number | undefined,
): Promise<boolean> => {
  const reservations = (await getReservationFromRange(startTime, endTime))
    .filter((e) => e.id !== id);

  const mostConcurrentReservations = countMostConcurrent(reservations);

  return mostConcurrentReservations < maxConcurrentReservations;
};

const deleteById = async (id: number): Promise<boolean> => {
  const reservation = await Reservation.findByPk(id);
  if (reservation) {
    reservation.destroy();
    return true;
  }
  return false;
};

const createReservation = async (newReservation: {
  start: Date,
  end: Date,
  aircraftId: string,
  info?: string,
  phone: string, }): Promise<ReservationEntry> => {
  if (!await allowReservation(newReservation.start, newReservation.end, undefined)) {
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
  if (!await allowReservation(reservation.start, reservation.end, id)) {
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
