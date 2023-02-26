import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { Reservation } from '../models';

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

const getInTimeRange = async (
  rangeStartTime: Date,
  rangeEndTime: Date,
): Promise<ReservationEntry[]> => {
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

  return reservations.map(({
    id,
    start,
    end,
    aircraftId,
    phone,
    info,
  }) => {
    const reservationInfo = info ?? undefined;
    return (
      {
        id,
        start,
        end,
        aircraftId,
        reservationInfo,
        phone,
        email: undefined,
        user: 'user',
      }
    );
  });
};

const deleteById = async (id: number): Promise<boolean> => {
  const reservation = await Reservation.findByPk(id);
  if (reservation) {
    reservation.destroy();
    return true;
  }
  return false;
};

const createReservation = async (newReservation: Omit<ReservationEntry, 'id' | 'user'>): Promise<ReservationEntry> => {
  const timeslots = await timeslotService
    .getTimeslotFromRange(newReservation.start, newReservation.end);
  const reservation: Reservation = await Reservation.create(newReservation);
  await reservation.addTimeslots(timeslots);
  const user = 'NYI';
  return { ...reservation.dataValues, user };
};

const updateById = async (
  id: number,
  newReservation: Omit<ReservationEntry, 'id' | 'user'>,
): Promise<ReservationEntry> => {
  const newTimeslots = await timeslotService
    .getTimeslotFromRange(newReservation.start, newReservation.end);
  const oldReservation: Reservation | null = await Reservation.findByPk(id);
  const oldTimeslots = await oldReservation?.getTimeslots();
  await oldReservation?.removeTimeslots(oldTimeslots);
  await oldReservation?.addTimeslots(newTimeslots);
  const [, reservations]: [number, Reservation[]] = await Reservation.update(
    newReservation,
    {
      where: { id },
      returning: true,
    },
  );
  const user = 'NYI';
  return { ...reservations[0].dataValues, user };
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
  getReservationFromRange,
};
