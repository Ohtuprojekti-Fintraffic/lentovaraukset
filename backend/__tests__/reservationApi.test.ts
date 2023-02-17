import request from 'supertest';
import app from '@lentovaraukset/backend/src/index';
import { Reservation } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';

const api = request(app);

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
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
        start: new Date('2023-01-02T12:00:00.000Z'), end: new Date('2023-01-02T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight',
      });

    const createdReservation: Reservation | null = await Reservation.findOne(
      { where: { id: newReservation.body.id } },
    );

    expect(createdReservation).toBeDefined();
    expect(createdReservation?.dataValues.start).toEqual(new Date('2023-01-02T12:00:00.000Z'));
    expect(createdReservation?.dataValues.end).toEqual(new Date('2023-01-02T14:00:00.000Z'));
    expect(createdReservation?.dataValues.aircraftId).toEqual('OH-QAA');
    expect(createdReservation?.dataValues.info).toEqual('Training flight');
  });

  test('can add a reservation without info', async () => {
    const newReservation: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({ start: new Date('2023-01-02T12:00:00.000Z'), end: new Date('2023-01-02T14:00:00.000Z'), aircraftId: 'OH-QAA' });

    const createdReservation: Reservation | null = await Reservation.findOne(
      { where: { id: newReservation.body.id } },
    );

    expect(createdReservation).toBeDefined();
    expect(createdReservation?.dataValues.start).toEqual(new Date('2023-01-02T12:00:00.000Z'));
    expect(createdReservation?.dataValues.end).toEqual(new Date('2023-01-02T14:00:00.000Z'));
    expect(createdReservation?.dataValues.aircraftId).toEqual('OH-QAA');
    expect(createdReservation?.dataValues.info).toEqual(null);
  });
});
