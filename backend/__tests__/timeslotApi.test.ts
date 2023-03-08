import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Reservation, Timeslot } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';
import airfieldService from '../src/services/airfieldService';

const api = request(app);

const timeslotData = [
  { start: new Date('2023-02-14T08:00:00.000Z'), end: new Date('2023-02-14T10:00:00.000Z') },
  { start: new Date('2023-02-14T14:00:00.000Z'), end: new Date('2023-02-14T16:00:00.000Z') },
  { start: new Date('2023-02-14T16:00:00.000Z'), end: new Date('2023-02-14T18:00:00.000Z') },
];
const timeslotDataBegin = timeslotData.reduce(
  (prev, cur) => (cur.start < prev.start ? cur : prev),
).start;

const timeslotDataEnd = timeslotData.reduce(
  (prev, cur) => (cur.end > prev.end ? cur : prev),
).end;

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
  await Timeslot.bulkCreate(timeslotData);
});

afterAll(async () => {
  // return to the present
  jest.useRealTimers();

  // otherwise Jest needs --forceExit
  await sequelize.close();
});
describe('Calls to api', () => {
  test('can create a timeslot', async () => {
    await api.post('/api/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: new Date('2023-02-18T12:00:00.000Z'), end: new Date('2023-02-18T14:00:00.000Z') });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length + 1);
    expect(createdTimeslot).not.toEqual(null);
    expect(createdTimeslot?.dataValues.start).toEqual(new Date('2023-02-18T12:00:00.000Z'));
    expect(createdTimeslot?.dataValues.end).toEqual(new Date('2023-02-18T14:00:00.000Z'));
  });

  test('dont create a timeslot if all fields not provided', async () => {
    await api.post('/api/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: '2023-02-18T12:00:00.000Z' });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
    expect(createdTimeslot).toEqual(null);
  });

  test('dont create a timeslot if granularity is wrong', async () => {
    await api.post('/api/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: new Date('2023-02-18T12:00:00.000Z'), end: new Date('2023-02-18T12:15:00.000Z') });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
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
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-02-16T12:00:00.000Z'), end: new Date('2023-02-16T13:00:00.000Z') });

    await api.put(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-02-17T12:00:00.000Z', end: '2023-02-17T14:00:00.000Z' });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).toBeDefined();
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-17T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-17T14:00:00.000Z'));
  });

  test('can edit a timeslot with reservation', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-02-16T12:00:00.000Z'), end: new Date('2023-02-16T13:00:00.000Z') });
    const newReservation: Reservation = await Reservation.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      aircraftId: 'ESA-111',
      phone: '0501102323',
    });
    createdSlot.addReservations([newReservation]);

    await api.put(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-02-16T12:00:00.000Z', end: '2023-02-16T14:00:00.000Z' });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T14:00:00.000Z'));
  });

  test('dont edit a timeslot if all fields not provided', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-02-16T12:00:00.000Z'), end: new Date('2023-02-16T13:00:00.000Z') });

    await api.patch(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-02-17T12:00:00.000Z' });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T13:00:00.000Z'));
  });

  test('dont edit a timeslot if granularity is wrong', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-02-16T12:00:00.000Z'), end: new Date('2023-02-16T13:00:00.000Z') });

    await api.put(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: new Date('2023-02-17T12:00:00.000Z'), end: new Date('2023-02-17T13:15:00.000Z') });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T13:00:00.000Z'));
  });

  test('dont edit a timeslot with reservation  if it goes outside reservation range', async () => {
    const createdSlot: Timeslot = await Timeslot.create({ start: new Date('2023-02-16T12:00:00.000Z'), end: new Date('2023-02-16T14:00:00.000Z') });
    const newReservation: Reservation = await Reservation.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T14:00:00.000Z'),
      aircraftId: 'ESA-111',
      phone: '0501102323',
    });
    createdSlot.addReservations([newReservation]);

    await api.put(`/api/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-02-16T12:00:00.000Z', end: '2023-02-16T13:00:00.000Z' });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T14:00:00.000Z'));
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

  test('dont delete a timeslot from past', async () => {
    const newTimeslot: any = await Timeslot.create({
      start: new Date('2022-02-13T08:00:00.000Z'),
      end: new Date('2022-02-13T09:00:00.000Z'),
    });

    await api.delete(`/api/timeslots/${newTimeslot.id}`);

    expect(await Timeslot.count()).toEqual(timeslotData.length + 1);
  });

  test('dont delete a timeslot if it has reservations', async () => {
    const createdSlot: Timeslot | null = await Timeslot.findOne({});
    const newReservation: Reservation = await Reservation.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      aircraftId: 'ESA-111',
      phone: '0501102323',
    });
    await createdSlot?.addReservations([newReservation]);

    await api.delete(`/api/timeslots/${createdSlot?.id}`);

    const deletedSlot = await Timeslot.findByPk(createdSlot?.id);
    const numberOfTimeslots: Number = await Timeslot.count();
    expect(deletedSlot).not.toEqual(null);
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

  test('Timeslot cannot be added if start is later than end', async () => {
    const start = new Date('2023-02-24T08:00:00.000Z');
    const end = new Date('2023-02-24T06:00:00.000Z');

    const newTimeslot: any = await api.post('/api/timeslots/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newTimeslot.body.error).toBeDefined();
    expect(newTimeslot.body.error.message).toContain('start time cannot be later than the end time');

    const response = await api
      .get(`/api/timeslots?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(response.body).toHaveLength(0);
  });
});
