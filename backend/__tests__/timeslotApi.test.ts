import request from 'supertest';
import app from '@lentovaraukset/backend/src/index';
import { Timeslot } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';

const api = request(app);

const timeslot_data = [
  {start: new Date('2023-02-02T08:00:00.000Z'), end: new Date('2023-02-02T10:00:00.000Z')},
  {start: new Date('2023-02-02T14:00:00.000Z'), end: new Date('2023-02-02T16:00:00.000Z')},
  {start: new Date('2023-02-02T16:00:00.000Z'), end: new Date('2023-02-02T18:00:00.000Z')},
];

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
  await Timeslot.bulkCreate(timeslot_data);
});

afterAll(async () => {
  // otherwise Jest needs --forceExit
  await sequelize.close();
});
describe('Calls to api', () => {

  test('can create a timeslot', async () => {
    await api.post('/api/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: '2023-03-03T12:00:00.000Z', end: '2023-03-03T14:00:00.000Z' });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-03-03T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslot_data.length + 1)
    expect(createdTimeslot).toBeDefined();
    expect(createdTimeslot?.dataValues.start).toEqual(new Date('2023-03-03T12:00:00.000Z'));
    expect(createdTimeslot?.dataValues.end).toEqual(new Date('2023-03-03T14:00:00.000Z'));
  });

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

  test('can delete a timeslot', async () => {

    const createdSlot: Timeslot | null = await Timeslot.findOne({});
    await api.delete(`/api/timeslots/${createdSlot?.dataValues.id}`)

    const deletedSlot: Timeslot | null = await Timeslot.findByPk(createdSlot?.dataValues.id);
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslot_data.length - 1);
    expect(deletedSlot).toEqual(null)
  });
});
