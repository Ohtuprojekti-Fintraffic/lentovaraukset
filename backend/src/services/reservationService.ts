import { Reservation } from '../models';

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
};
