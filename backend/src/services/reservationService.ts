import { Op } from 'sequelize';
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

  return reservations.map((reservation) => ({
    title: 'Varattu',
    id: reservation.dataValues.id,
    start: reservation.dataValues.start,
    end: reservation.dataValues.end,
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
  aircraftId: String,
  info?: String,
}) => {
  const reservation: any = await Reservation.create((newReservation));
  return reservation;
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
