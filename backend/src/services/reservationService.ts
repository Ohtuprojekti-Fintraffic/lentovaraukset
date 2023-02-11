import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import { Reservation } from '../models';

const getInTimeRange = async (rangeStartTime: Date, rangeEndTime: Date) => {
  const reservations = await Reservation.findAll({
    where: {
      [Op.or]: [{
        start: {
          [Op.between]: [rangeStartTime, rangeEndTime],
        },
      }, {
        end: {
          [Op.between]: [rangeStartTime, rangeEndTime],
        },
      }],
    },
  });

  return reservations.map(({ id, start, end }) => ({ id, start, end }));
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
  const reservation = await Reservation.create(newReservation);

  const {
    id, start, end, aircraftId, info,
  } = reservation;

  // we don't have users yet
  const user = 'NYI';
  const phone = 'NYI';

  return {
    id, start, end, aircraftId, info, user, phone,
  };
};

const updateById = async (
  id: number,
  reservation: { start: Date, end: Date },
) => {
  await Reservation.update(reservation, { where: { id } });
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
};
