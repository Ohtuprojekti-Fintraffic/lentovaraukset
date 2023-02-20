import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { Reservation } from '../models';

const numConcurrentReservations: number = 2;

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

const getReservationFromRangeWithoutId = async (startTime: Date, endTime: Date, id: number) => {
  const reservations: any = await Reservation.findAll({
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
  return reservations;
};

const getReservationFromRange = async (startTime: Date, endTime: Date) => {
  const reservations: any = await Reservation.findAll({
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
  const timeslots = await timeslotService
    .getTimeslotFromRange(newReservation.start, newReservation.end);
  const reservation: Reservation = await Reservation.create(newReservation);
  await reservation.addTimeslots(timeslots);
  const user = 'NYI';
  return { ...reservation.dataValues, user };
};

const updateById = async (
  id: number,
  reservation: { start: Date, end: Date },
): Promise<void> => {
  const newTimeslots = await timeslotService
    .getTimeslotFromRange(reservation.start, reservation.end);
  const oldReservation: Reservation | null = await Reservation.findByPk(id);
  const oldTimeslots = await oldReservation?.getTimeslots();
  await oldReservation?.removeTimeslots(oldTimeslots);
  await oldReservation?.addTimeslots(newTimeslots);
  await Reservation.update(reservation, { where: { id } });
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
  getReservationFromRange,
};
