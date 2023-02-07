import request from 'supertest';
import app from '@lentovaraukset/backend/src/index';
import { Timeslot } from '@lentovaraukset/backend/src/models';
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
  test('can edit a timeslot', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: '2023-01-01T12:00:00.000Z', end: '2023-01-01T13:00:00.000Z' });

    await api.patch(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-01-02T12:00:00.000Z', end: '2023-01-02T14:00:00.000Z' });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).toBeDefined();
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-01-02T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-01-02T14:00:00.000Z'));
  });
});
