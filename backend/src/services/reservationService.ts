import { Reservation } from '../models';

const createReservation = async (
  startTime: Date,
  endTime: Date,
  aircraftId: String,
  info: String,
) => {
  const reservation: any = await Reservation.create(({
    startTime,
    endTime,
    aircraftId,
    info,
  }));
  return reservation;
};

export default {
  createReservation,
};
