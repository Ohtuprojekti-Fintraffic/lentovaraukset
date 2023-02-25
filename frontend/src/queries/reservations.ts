import { ReservationEntry } from '@lentovaraukset/shared/src';
import { ReservationCalendarEvent } from '../types';

const getReservations = async (from: Date, until: Date): Promise<ReservationEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);
  return res.json();
};

const addReservation = async ({ start, end }: Pick<ReservationCalendarEvent, 'start' | 'end'>): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/reservations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start, end, aircraftId: '1', phone: '1',
    }),
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

const modifyReservation = async ({ start, end, id }: Pick<ReservationCalendarEvent, 'start' | 'end' | 'id'>): Promise<void> => {
  const modifiedReservation = {
    start, end,
  };
  await fetch(`${process.env.BASE_PATH}/api/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(modifiedReservation),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export {
  getReservations,
  addReservation,
  modifyReservation,
  deleteReservation,
};
