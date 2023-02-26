import { ReservationEntry } from '@lentovaraukset/shared/src';

const getReservations = async (from: Date, until: Date): Promise<ReservationEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);
  return res.json();
};

const addReservation = async (newReservation: any): Promise<ReservationEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/reservations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...newReservation, aircraftId: 'OH-EXMPL', phone: '051 123 4567' }),
  });
  return res.json();
};

const deleteReservation = async (id: Number): Promise<string> => {
  const response = await fetch(`${process.env.BASE_PATH}/api/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.text();
};

const modifyReservation = async (reservation: ReservationEntry): Promise<ReservationEntry> => {
  const modifiedReservation = {
    start: reservation.start,
    end: reservation.end,
  };
  const res = await fetch(`${process.env.BASE_PATH}/api/reservations/${reservation.id}`, {
    method: 'PATCH',
    body: JSON.stringify(modifiedReservation),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.json();
};

export {
  getReservations,
  addReservation,
  modifyReservation,
  deleteReservation,
};
