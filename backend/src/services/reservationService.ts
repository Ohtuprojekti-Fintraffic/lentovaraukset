import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { Reservation } from '../models';

const maxConcurrentReservations: number = 3;

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

const getInTimeRange = async (
  rangeStartTime: Date,
  rangeEndTime: Date,
): Promise<ReservationEntry[]> => {
  const reservations = await getReservationFromRange(rangeStartTime, rangeEndTime);

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
        info: reservationInfo,
        phone,
        email: undefined,
        user: 'user',
      }
    );
  });
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

const deleteById = async (id: number) => {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) {
    throw new Error('Reservation does not exist');
  }
  await reservation.destroy();
};

const createReservation = async (newReservation: Omit<ReservationEntry, 'id' | 'user'>): Promise<ReservationEntry> => {
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
  reservation: Omit<ReservationEntry, 'id' | 'user'>,
): Promise<ReservationEntry> => {
  if (!await allowReservation(reservation.start, reservation.end, id)) {
    throw new Error('Too many concurrent reservations');
  } else {
    const newTimeslots = await timeslotService
      .getTimeslotFromRange(reservation.start, reservation.end);
    const oldReservation: Reservation | null = await Reservation.findByPk(id);
    const oldTimeslots = await oldReservation?.getTimeslots();
    await oldReservation?.removeTimeslots(oldTimeslots);
    await oldReservation?.addTimeslots(newTimeslots);
    const [, reservations]: [number, Reservation[]] = await Reservation.update(
      reservation,
      {
        where: { id },
        returning: true,
      },
    );
    const user = 'NYI';
    return { ...reservations[0].dataValues, user };
  }
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
  getReservationFromRange,
};
