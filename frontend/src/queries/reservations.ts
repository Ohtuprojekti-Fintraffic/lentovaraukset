import { ReservationCalendarEvent } from '../types';
import {} from '@lentovaraukset/shared/src';

const getReservations = async (from: Date, until: Date): Promise<ReservationCalendarEvent[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);
  return res.json();
};

const addReservation = async (newReservation: any): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/reservations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...newReservation, aircraftId: '1', phone: '1' }),
  });
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

const modifyReservation = async (reservation: Partial<ReservationCalendarEvent>): Promise<void> => {
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
