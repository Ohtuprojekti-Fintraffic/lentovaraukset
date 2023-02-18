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
    },
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
  info?: string,
  phone: string, }): Promise<ReservationEntry> => {
  const timeslots = await getTimeslotsInReservationRange(newReservation.start, newReservation.end);
  const reservation: Reservation = await Reservation.create(newReservation);
  await reservation.addTimeslots(timeslots);
  const user = 'NYI';
  return { ...reservation.dataValues, user };
};

const updateById = async (
  id: number,
  reservation: { start: Date, end: Date },
): Promise<void> => {
  const newTimeslots = await getTimeslotsInReservationRange(reservation.start, reservation.end);
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
};
