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

const deleteById = async (id: number): Promise<boolean> => {
  const reservation = await Reservation.findByPk(id);
  if (reservation) {
    reservation.destroy();
    return true;
  }
  return false;
};

export default {
  createReservation,
  deleteById,
};
