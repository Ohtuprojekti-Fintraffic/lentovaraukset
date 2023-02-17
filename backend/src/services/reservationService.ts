import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import { Reservation, Timeslot } from '../models';

const getTimeslotsInReservationRange = async (start: Date, end: Date) => {
  const timeslots = await Timeslot.findAll({
    where: {
    [Op.and]: [
      {
        start: {
          [Op.lte]: start,
        },
      },
      {
        end: {
          [Op.gte]: end,
        },
      },
    ],
  }
  });
  return timeslots;
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
  info: string, }): Promise<ReservationEntry> => {
  const timeslots = await getTimeslotsInReservationRange(newReservation.start, newReservation.end);
  const reservation: Reservation = await Reservation.create(newReservation);
  if (timeslots) {
    reservation.addTimeslots(timeslots);
  };
  // we don't have users yet
  const {
    id, start, end, aircraftId, info,
  } = reservation;
  const user = 'NYI';
  const phone = 'NYI';

  return {
    id, start, end, aircraftId, info, user, phone,
  }
};

const updateById = async (
  id: number,
  reservation: { start: Date, end: Date },
): Promise<void> => {
  const timeslots = await getTimeslotsInReservationRange(reservation.start, reservation.end);
  const oldReservation: Reservation | null = await Reservation.findByPk(id);
  if (oldReservation) {
    const oldTimeslots = await oldReservation.getTimeslots();
    if (oldTimeslots) {
      await oldReservation.removeTimeslots(oldTimeslots);
    }
  if (timeslots) {
    console.log(timeslots);
    await oldReservation.addTimeslots(timeslots);
  };
  await Reservation.update(reservation, { where: { id } });
};
}

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
};