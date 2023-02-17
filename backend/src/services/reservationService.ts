import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import { Reservation } from '../models';

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
  info: string,
  phoneNumber: string, }): Promise<ReservationEntry> => {
  const {
    id, start, end, aircraftId, info, phoneNumber,
  } = await Reservation.create(newReservation);

  // we don't have users yet
  const user = 'NYI';

  return {
    id, start, end, aircraftId, info, user, phoneNumber,
  };
};

const updateById = async (
  id: number,
  reservation: { start: Date, end: Date },
): Promise<void> => {
  await Reservation.update(reservation, { where: { id } });
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
};
