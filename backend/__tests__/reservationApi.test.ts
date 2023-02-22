import request from 'supertest';
import app from '@lentovaraukset/backend/src/index';
import { Reservation } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';

const api = request(app);

const reservations = [
  {
    start: new Date('2023-02-02T08:00:00.000Z'),
    end: new Date('2023-02-02T10:00:00.000Z'),
    aircraftId: 'XZ-ABC',
    info: 'example info',
    phone: '0401111111',
  },
  {
    start: new Date('2023-02-02T14:00:00.000Z'),
    end: new Date('2023-02-02T16:00:00.000Z'),
    aircraftId: 'DK-ASD',
    phone: '0401111111',
  },
  {
    start: new Date('2023-02-02T16:00:00.000Z'),
    end: new Date('2023-02-02T18:00:00.000Z'),
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
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
  await Reservation.bulkCreate(reservations);
});

afterAll(async () => {
  // otherwise Jest needs --forceExit
  await sequelize.close();
});

describe('Calls to api', () => {
  test('can add a reservation with info', async () => {
    const newReservation: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-01-02T12:00:00.000Z'), end: new Date('2023-01-02T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: '11104040',
      });

    const createdReservation: Reservation | null = await Reservation.findOne(
      { where: { id: newReservation.body.id } },
    );

    expect(createdReservation).toBeDefined();
    expect(createdReservation?.dataValues.start).toEqual(new Date('2023-01-02T12:00:00.000Z'));
    expect(createdReservation?.dataValues.end).toEqual(new Date('2023-01-02T14:00:00.000Z'));
    expect(createdReservation?.dataValues.aircraftId).toEqual('OH-QAA');
    expect(createdReservation?.dataValues.info).toEqual('Training flight');
    expect(createdReservation?.dataValues.phone).toEqual('11104040');
  });

  test('can add a reservation without info', async () => {
    const newReservation: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-01-02T12:00:00.000Z'), end: new Date('2023-01-02T14:00:00.000Z'), aircraftId: 'OH-QAA', phone: '11104040',
      });

    const createdReservation: Reservation | null = await Reservation.findOne(
      { where: { id: newReservation.body.id } },
    );

    expect(createdReservation).toBeDefined();
    expect(createdReservation?.dataValues.start).toEqual(new Date('2023-01-02T12:00:00.000Z'));
    expect(createdReservation?.dataValues.end).toEqual(new Date('2023-01-02T14:00:00.000Z'));
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
    await api.patch(`/api/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-01-02T02:00:00.000Z', end: '2023-01-02T16:00:00.000Z' });

    const updatedReservation: Reservation | null = await Reservation.findByPk(id);

    expect(updatedReservation).not.toEqual(null);
    expect(updatedReservation?.dataValues.start).toEqual(new Date('2023-01-02T02:00:00.000Z'));
    expect(updatedReservation?.dataValues.end).toEqual(new Date('2023-01-02T16:00:00.000Z'));
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
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(start.getHours() - 2);
    const end = new Date();
    end.setDate(end.getDate() - 1);
    const newReservation: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start, end, aircraftId: 'OH-QAA', phone: '11104040',
      });

    expect(newReservation).toEqual(null);
  });
});
