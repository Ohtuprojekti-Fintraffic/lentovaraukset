import { ReservationEntry, ReservationStatus } from '@lentovaraukset/shared/src';
import { Timeslot, Reservation, User } from '../models';

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
  getReservationStatus,
};
