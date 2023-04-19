import { ReservationEntry } from '@lentovaraukset/shared/src';
import { errorIfNotOk } from './util';

// TODO: ICAO code should be passed on from the context in the calling component
// const airfieldCode = 'EFHK';

const getReservations = async (from: Date, until: Date, airportCode?: string)
: Promise<ReservationEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);
  errorIfNotOk(res);
  return res.json();
};

const addReservation = async (newReservation: any, airportCode?: string)
: Promise<ReservationEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/reservations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aircraftId: 'OH-EXMPL', phone: '051 123 4567', info: 'placeholder', ...newReservation,
    }),
  });
  errorIfNotOk(res);
  return res.json();
};

const deleteReservation = async (id: Number, airportCode?: string): Promise<string> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.text();
};

const modifyReservation = async (modifiedReservation: ReservationEntry, airportCode?: string)
: Promise<ReservationEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/reservations/${modifiedReservation.id}`, {
    method: 'PUT',
    body: JSON.stringify(modifiedReservation),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.json();
};

export {
  getReservations,
  addReservation,
  modifyReservation,
  deleteReservation,
};
