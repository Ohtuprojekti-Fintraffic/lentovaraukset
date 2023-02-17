import { Op } from 'sequelize';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import { Reservation } from '../models';

const numConcurrentReservations: number = 2;

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

const getReservationFromRangeWithoutId = async (startTime: Date, endTime: Date, id: number) => {
  const reservations: any = await Reservation.findAll({
    where: {
      id: {
        [Op.ne]: id,
      },
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

const getReservationFromRange = async (startTime: Date, endTime: Date) => {
  const reservations: any = await Reservation.findAll({
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
  info?: string | undefined, }): Promise<ReservationEntry> => {
  if ((await getReservationFromRange(newReservation.start, newReservation.end))
    .length >= numConcurrentReservations) {
    throw new Error('Too many concurrent reservations');
  } else {
    const {
      id, start, end, aircraftId, info,
    } = await Reservation.create(newReservation);

    // we don't have users yet
    const user = 'NYI';
    const phone = 'NYI';

    return {
      id, start, end, aircraftId, info, user, phone,
    };
  }
};

const updateById = async (
  id: number,
  reservation: { start: Date, end: Date },
): Promise<void> => {
  if ((await getReservationFromRangeWithoutId(reservation.start, reservation.end, id))
    .length >= numConcurrentReservations) {
    throw new Error('Too many concurrent reservations');
  } else {
    await Reservation.update(reservation, { where: { id } });
  }
};

export default {
  createReservation,
  getInTimeRange,
  deleteById,
  updateById,
};
