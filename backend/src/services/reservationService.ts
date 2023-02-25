import { Op } from 'sequelize';
import { ReservationEntry, ReservationStatus } from '@lentovaraukset/shared/src';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { Reservation, Timeslot, User } from '../models';

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

const getInTimeRange = async (rangeStartTime: Date, rangeEndTime: Date) => {
  const reservations = await getReservationFromRange(rangeStartTime, rangeEndTime);

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

const getReservationStatus = async (): Promise<ReservationStatus> => {
  const returnedTimeSlots = await Timeslot.findAll({
    include: {
      model: Reservation,
      attributes: ['start', 'end', 'info'],
    },
  });
  const availableSlots = returnedTimeSlots.map(({
    id, start, end, ...rest
  }) => ({
    id,
    start,
    end,
    // any because sequelize typing only does basic values, not relations
    freeSlotsAmount: (rest as any).maxAmount - (rest as any).reservations.length,
  }));
  const reservedSlots = await Reservation.findAll({
    include: {
      model: User,
      attributes: ['name', 'role'],
    },
  });

  // we don't have users yet
  const reservationEntries: ReservationEntry[] = reservedSlots.map(({
    id, start, end, aircraftId, info,
  }) => ({
    id, start, end, aircraftId, info, user: 'NYI', phone: 'NYI',
  }));

  return { availableSlots, reservedSlots: reservationEntries };
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
  getReservationFromRange,
  getReservationStatus,
};
