import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Reservation } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';
import airfieldService from '../src/services/airfieldService';

const api = request(app);

const reservations = [
  {
    start: new Date('2023-02-14T08:00:00.000Z'),
    end: new Date('2023-02-14T10:00:00.000Z'),
    aircraftId: 'XZ-ABC',
    info: 'example info',
    phone: '0401111111',
  },
  {
    start: new Date('2023-02-14T14:00:00.000Z'),
    end: new Date('2023-02-14T16:00:00.000Z'),
    aircraftId: 'DK-ASD',
    phone: '0401111111',
  },
  {
    start: new Date('2023-02-14T16:00:00.000Z'),
    end: new Date('2023-02-14T18:00:00.000Z'),
    aircraftId: 'RF-SDR',
    info: 'First time landing!',
    phone: '0401111111',
  },
];

const earliestReservation = reservations.reduce(
  (earliest, current) => (current.start < earliest.start ? current : earliest),
);

const latestReservation = reservations.reduce(
  (earliest, current) => (current.end > earliest.end ? current : earliest),
);

beforeAll(async () => {
  await connectToDatabase();

  // backend uses system time for some stuff
  // so let's fake it as a specific date,
  // while keeping timers running
  jest.useFakeTimers({ advanceTimers: true });
  jest.setSystemTime(new Date('2023-02-13T08:00:00.000Z'));
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
  await airfieldService.createTestAirfield();
  await Reservation.bulkCreate(reservations);
});

afterAll(async () => {
  // return to the present
  jest.useRealTimers();

  // otherwise Jest needs --forceExit
  await sequelize.close();
});

describe('Calls to api', () => {
  test('can add a reservation with info', async () => {
    const newReservation: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: '11104040',
      });

    const createdReservation: Reservation | null = await Reservation.findOne(
      { where: { id: newReservation.body.id } },
    );

    expect(createdReservation).toBeDefined();
    expect(createdReservation?.dataValues.start).toEqual(new Date('2023-02-14T12:00:00.000Z'));
    expect(createdReservation?.dataValues.end).toEqual(new Date('2023-02-14T14:00:00.000Z'));
    expect(createdReservation?.dataValues.aircraftId).toEqual('OH-QAA');
    expect(createdReservation?.dataValues.info).toEqual('Training flight');
    expect(createdReservation?.dataValues.phone).toEqual('11104040');
  });

  test('can add a reservation without info', async () => {
    const newReservation: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-QAA', phone: '11104040',
      });

    const createdReservation: Reservation | null = await Reservation.findOne(
      { where: { id: newReservation.body.id } },
    );

    expect(createdReservation).toBeDefined();
    expect(createdReservation?.dataValues.start).toEqual(new Date('2023-02-14T12:00:00.000Z'));
    expect(createdReservation?.dataValues.end).toEqual(new Date('2023-02-14T14:00:00.000Z'));
    expect(createdReservation?.dataValues.aircraftId).toEqual('OH-QAA');
    expect(createdReservation?.dataValues.info).toEqual(null);
    expect(createdReservation?.dataValues.phone).toEqual('11104040');
  });

  test('can delete a reservation', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;
    await api.delete(`/api/reservations/${id}`);

    const deletedReservation: Reservation | null = await Reservation.findByPk(id);
    expect(deletedReservation).toBe(null);

    const numberOfReservations: Number = await Reservation.count();
    expect(numberOfReservations).toEqual(reservations.length - 1);
  });

  test('can\'t delete a reservation when it doesn\'t exists', async () => {
    await api.delete('/api/reservations/-1');
    expect(await Reservation.count()).toEqual(reservations.length);
  });

  test('can edit a reservation ', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;
    const aircraftId = createdReservation?.dataValues.aircraftId;
    const phone = createdReservation?.dataValues.phone;
    await api.patch(`/api/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-14T02:00:00.000Z', end: '2023-02-14T16:00:00.000Z', aircraftId, phone,
      });

    const updatedReservation: Reservation | null = await Reservation.findByPk(id);

    expect(updatedReservation).not.toEqual(null);
    expect(updatedReservation?.dataValues.start).toEqual(new Date('2023-02-14T02:00:00.000Z'));
    expect(updatedReservation?.dataValues.end).toEqual(new Date('2023-02-14T16:00:00.000Z'));
    expect(updatedReservation?.dataValues.aircraftId).toEqual(aircraftId);
    expect(updatedReservation?.dataValues.phone).toEqual(phone);
  });

  test('can get reservations in a range', async () => {
    const from = new Date(earliestReservation.end);
    const until = new Date(latestReservation.end);

    from.setHours(from.getHours() + 1);
    const response = await api
      .get(`/api/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);

    expect(response.body.length).toEqual(2);
    expect(response.body.includes(reservations[1]));
    expect(response.body.includes(reservations[2]));
  });

  test('return an empty list if no reservation in range', async () => {
    const from = new Date(earliestReservation.start);
    const until = new Date(latestReservation.end);

    from.setDate(until.getDate() + 1);
    until.setDate(until.getDate() + 2);

    const response = await api
      .get(`/api/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);
    expect(response.body).toEqual([]);
  });

  test('Reservation cannot be add in past', async () => {
    const start = new Date('2023-02-13T06:00:00.000Z');
    const end = new Date('2023-02-13T08:00:00.000Z');

    const newReservation: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start, end, aircraftId: 'OH-QAA', phone: '11104040',
      });

    const response = await api
      .get(`/api/reservations?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(newReservation.status).toEqual(400);
    expect(response.body).toHaveLength(0);
  });

  test('Reservation cannot be added further than the max days ahead', async () => {
    const start = new Date('2023-02-24T06:00:00.000Z');
    const end = new Date('2023-02-24T08:00:00.000Z');

    const newReservation: any = await api.post('/api/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newReservation.body.error).toBeDefined();
    expect(newReservation.body.error.message).toContain('Reservation start time cannot be further');

    const response = await api
      .get(`/api/reservations?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(response.body).toHaveLength(0);
  });

  test('Reservation cannot be added if start is later than end', async () => {
    const start = new Date('2023-02-24T08:00:00.000Z');
    const end = new Date('2023-02-24T06:00:00.000Z');

    const newReservation: any = await api.post('/api/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newReservation.body.error).toBeDefined();
    expect(newReservation.body.error.message).toContain('start time cannot be later than the end time');

    const response = await api
      .get(`/api/reservations?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(response.body).toHaveLength(0);
  });
});
