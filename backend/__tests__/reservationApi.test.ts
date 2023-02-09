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
  test('can delete a reservation', async () => {
    const createdReservation: Reservation = await Reservation.create({
      start: '2023-01-02T12:00:00.000Z', end: '2023-01-02T14:00:00.000Z', aircraftId: 'OH-QAA', info: 'Training flight',
    });

    await api.delete(`/api/reservations/${createdReservation.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send();

    const allReservations: Reservation [] = await Reservation.findAll({});

    expect(allReservations).toEqual([]);
  });
});
