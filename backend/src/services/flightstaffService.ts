import { Timeslot, Reservation, User } from '../models';

const getReservationStatus = async (): Promise<any> => {
  const returnedTimeSlots = await Timeslot.findAll({
    include: {
      model: Reservation,
      attributes: ['startTime', 'endTime', 'info'],
    },
  });
  const availableSlots = returnedTimeSlots.map((obj) => (
    {
      ...obj.dataValues,
      freeSlotsAmount: (obj.dataValues.maxAmount - obj.dataValues.reservations.length),
    }));

  const reservedSlots = await Reservation.findAll({
    include: {
      model: User,
      attributes: ['name', 'role'],
    },
  });

  return {
    availableSlots,
    reservedSlots,
  };
};

export default {
  getReservationStatus,
};
