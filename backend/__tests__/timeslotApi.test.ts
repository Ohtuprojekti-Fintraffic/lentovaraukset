import request from 'supertest';
import app from '@lentovaraukset/backend/src/index';
import { Timeslot } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';

const api = request(app);

const timeslotData = [
  { start: new Date('2023-02-02T08:00:00.000Z'), end: new Date('2023-02-02T10:00:00.000Z') },
  { start: new Date('2023-02-02T14:00:00.000Z'), end: new Date('2023-02-02T16:00:00.000Z') },
  { start: new Date('2023-02-02T16:00:00.000Z'), end: new Date('2023-02-02T18:00:00.000Z') },
];
const timeslotDataBegin = timeslotData.reduce(
  (prev, cur) => (cur.start < prev.start ? cur : prev),
).start;

const timeslotDataEnd = timeslotData.reduce(
  (prev, cur) => (cur.end > prev.end ? cur : prev),
).end;

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
  await Timeslot.bulkCreate(timeslotData);
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

    expect(numberOfTimeslots).toEqual(timeslotData.length + 1);
    expect(createdTimeslot).not.toEqual(null);
    expect(createdTimeslot?.dataValues.start).toEqual(new Date('2023-03-03T12:00:00.000Z'));
    expect(createdTimeslot?.dataValues.end).toEqual(new Date('2023-03-03T14:00:00.000Z'));
  });

  test('dont create a timeslot if all fields not provided', async () => {
    await api.post('/api/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: '2023-03-03T12:00:00.000Z' });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-03-03T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
    expect(createdTimeslot).toEqual(null);
  });

  test('dont create a timeslot if granularity is wrong', async () => {
    await api.post('/api/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: new Date('2023-03-03T12:00:00.000Z'), end: new Date('2023-03-03T12:15:00.000Z') });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-03-03T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
    expect(createdTimeslot).toEqual(null);
  });

  test('dont create a timeslot if provided times are empty', async () => {
    await api.post('/api/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: '', end: '' });

    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
  });

  test('can edit a timeslot', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-01-01T12:00:00.000Z'), end: new Date('2023-01-01T13:00:00.000Z') });

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

  test('dont edit a timeslot if all fields not provided', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-01-01T12:00:00.000Z'), end: new Date('2023-01-01T13:00:00.000Z') });

    await api.patch(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-01-02T12:00:00.000Z' });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-01-01T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-01-01T13:00:00.000Z'));
  });

  test('dont edit a timeslot if granularity is wrong', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-01-01T12:00:00.000Z'), end: new Date('2023-01-01T13:00:00.000Z') });

    await api.patch(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: new Date('2023-01-02T12:00:00.000Z'), end: new Date('2023-01-02T13:15:00.000Z') });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-01-01T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-01-01T13:00:00.000Z'));
  });

  test('can delete a timeslot', async () => {
    const createdSlot: Timeslot | null = await Timeslot.findOne({});
    await api.delete(`/api/timeslots/${createdSlot?.dataValues.id}`);

    const deletedSlot: Timeslot | null = await Timeslot.findByPk(createdSlot?.dataValues.id);
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length - 1);
    expect(deletedSlot).toEqual(null);
  });

  test('dont delete a timeslot if it doesnt exist', async () => {
    await api.delete('/api/timeslots/-1');

    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
  });

  test('can get timeslots in a range', async () => {
    const from = new Date(timeslotDataBegin);
    const until = new Date(timeslotDataEnd);
    const response = await api.get(`/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
    const timeslots = response.body;
    const startTimes = timeslots.map((o: { start: String; }) => o.start);

    expect(timeslots.length).toEqual(timeslotData.length);
    expect(startTimes.includes(timeslotData[0].start));
    expect(startTimes.includes(timeslotData[1].start));
    expect(startTimes.includes(timeslotData[2].start));
  });

  test('return empty list if no timeslots in range', async () => {
    const from = new Date(timeslotDataEnd);
    const until = new Date(timeslotDataEnd);
    from.setDate(until.getDate() + 1);
    until.setDate(until.getDate() + 2);
    const response = await api.get(`/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);

    expect(response.body).toEqual([]);
  });
});
