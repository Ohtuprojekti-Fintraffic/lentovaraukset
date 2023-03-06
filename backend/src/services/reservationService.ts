import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import timeslotService from '@lentovaraukset/backend/src/services/timeslotService';
import { Reservation } from '../models';

const getReservationFromRange = async (startTime: Date, endTime: Date) => {
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
      .getInTimeRange(newReservation.start, newReservation.end);
    if (timeslots.length !== 1) {
      throw new Error('Reservation should be created for one timeslot');
    }
    const timeslot = timeslots[0];
    const reservation: Reservation = await Reservation.create(newReservation);
    if (timeslot) {
      await reservation.setTimeslot(timeslot);
    }
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
      .getInTimeRange(reservation.start, reservation.end);
    if (newTimeslots.length !== 1) {
      throw new Error('Reservation should be created for one timeslot');
    }
    const newTimeslot = newTimeslots[0];
    const oldReservation: Reservation | null = await Reservation.findByPk(id);
    const oldTimeslot = await oldReservation?.getTimeslot();
    if (newTimeslot && oldTimeslot) {
      await oldReservation?.setTimeslot(newTimeslot);
    }
    const [updatedReservation] = await Reservation.upsert(
      { ...reservation, id },
    );
    const user = 'NYI';
    return { ...updatedReservation.dataValues, user };
  }
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
  getReservationFromRange,
};
