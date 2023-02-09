import { Op } from 'sequelize';
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

  return reservations.map((reservation) => ({
    id: reservation.dataValues.id,
    start: reservation.dataValues.start,
    end: reservation.dataValues.end,
  }));
};

const createReservation = async (
  start: Date,
  end: Date,
  aircraftId: String,
  info: String,
) => {
  const reservation: any = await Reservation.create(({
    start,
    end,
    aircraftId,
    info,
  }));
  return reservation;
};

export default {
  createReservation,
  getInTimeRange,
};
