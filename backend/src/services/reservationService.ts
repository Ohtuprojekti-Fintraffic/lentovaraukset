import { Reservation } from '../models';

const createReservation = async (startTime: Date, endTime: Date, info: String) => {
  const reservation: any = await Reservation.create(({ startTime, endTime, info }));
  return reservation;
};

export default {
  createReservation,
};
