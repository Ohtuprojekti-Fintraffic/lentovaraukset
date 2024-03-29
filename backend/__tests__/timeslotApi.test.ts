import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Reservation, Timeslot } from '@lentovaraukset/backend/src/models';
import { TimeslotEntry } from '@lentovaraukset/shared/src';
import { connectToDatabase, sequelize } from '../src/util/db';
import airfieldService from '../src/services/airfieldService';

jest.mock('@lentovaraukset/backend/src/auth/passport.ts');
const api = request(app);

const timeslotData: Omit<TimeslotEntry, 'id'>[] = [
  {
    start: new Date('2023-02-14T08:00:00.000Z'), end: new Date('2023-02-14T10:00:00.000Z'), type: 'available', info: null, airfieldCode: 'EFHK',
  },
  {
    start: new Date('2023-02-14T14:00:00.000Z'), end: new Date('2023-02-14T16:00:00.000Z'), type: 'available', info: null, airfieldCode: 'EFHK',
  },
  {
    start: new Date('2023-02-14T16:00:00.000Z'), end: new Date('2023-02-14T18:00:00.000Z'), type: 'available', info: null, airfieldCode: 'EFHK',
  },
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
  test('can create an available timeslot', async () => {
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-18T12:00:00.000Z'), end: new Date('2023-02-18T14:00:00.000Z'), type: 'available', info: null,
      });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length + 1);
    expect(createdTimeslot).not.toEqual(null);
    expect(createdTimeslot?.dataValues.start).toEqual(new Date('2023-02-18T12:00:00.000Z'));
    expect(createdTimeslot?.dataValues.end).toEqual(new Date('2023-02-18T14:00:00.000Z'));
    expect(createdTimeslot?.dataValues.type).toEqual('available');
  });

  test('can create a blocked timeslot', async () => {
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-18T12:00:00.000Z'), end: new Date('2023-02-18T14:00:00.000Z'), type: 'blocked', info: 'Under maintenance',
      });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length + 1);
    expect(createdTimeslot).not.toEqual(null);
    expect(createdTimeslot?.dataValues.start).toEqual(new Date('2023-02-18T12:00:00.000Z'));
    expect(createdTimeslot?.dataValues.end).toEqual(new Date('2023-02-18T14:00:00.000Z'));
    expect(createdTimeslot?.dataValues.type).toEqual('blocked');
    expect(createdTimeslot?.dataValues.info).toEqual('Under maintenance');
  });

  test('creating blocked timeslot removes reservations on same time range', async () => {
    const timeslot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T14:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });
    const reservation: Reservation = await Reservation.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      aircraftId: 'ESA-111',
      phone: '0501102323',
    });
    await reservation.setTimeslot(timeslot);
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-16T12:00:00.000Z'), end: new Date('2023-02-16T14:00:00.000Z'), type: 'blocked', info: 'Under maintenance',
      });
    const numberOfTimeslots: Number = await Timeslot.count();
    const createdReservation: Reservation | null = await Reservation.findByPk(
      reservation.dataValues.id,
    );
    expect(numberOfTimeslots).toEqual(timeslotData.length + 2);
    expect(createdReservation).toEqual(null);
  });

  test('modifying blocked timeslot removes reservations on same time range', async () => {
    const timeslot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T14:00:00.000Z'),
      type: 'blocked',
      info: 'Under maintenance',
      airfieldCode: 'EFHK',
    });
    const reservation: Reservation = await Reservation.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      aircraftId: 'ESA-111',
      phone: '0501102323',
    });
    await reservation.setTimeslot(timeslot);
    await api.put(`/api/EFHK/timeslots/${timeslot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-16T10:00:00.000Z'), end: new Date('2023-02-16T16:00:00.000Z'), type: 'blocked', info: 'Under maintenance',
      });
    const numberOfTimeslots: Number = await Timeslot.count();
    const createdReservation: Reservation | null = await Reservation.findByPk(
      reservation.dataValues.id,
    );
    expect(numberOfTimeslots).toEqual(timeslotData.length + 1);
    expect(createdReservation).toEqual(null);
  });

  test('dont create a timeslot if all fields not provided', async () => {
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({ start: '2023-02-18T12:00:00.000Z', type: 'available', info: null });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
    expect(createdTimeslot).toEqual(null);
  });

  test('dont create a timeslot if type is not available or blocked', async () => {
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-18T12:00:00.000Z', end: new Date('2023-02-18T14:00:00.000Z'), type: 'error', info: null,
      });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
    expect(createdTimeslot).toEqual(null);
  });

  test('dont create a timeslot if granularity is wrong', async () => {
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-18T12:00:00.000Z'), end: new Date('2023-02-18T12:15:00.000Z'), type: 'available', info: null,
      });

    const createdTimeslot: Timeslot | null = await Timeslot.findOne(
      { where: { start: new Date('2023-02-18T12:00:00.000Z') } },
    );
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
    expect(createdTimeslot).toEqual(null);
  });

  test('dont create a timeslot if provided times are empty', async () => {
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: '', end: '', type: 'available', info: null,
      });

    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
  });

  test('can edit an available timeslot', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-17T12:00:00.000Z', end: '2023-02-17T14:00:00.000Z', type: 'available', info: null,
      });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).toBeDefined();
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-17T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-17T14:00:00.000Z'));
  });

  test('can edit an available timeslot even if start time is in past', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-13T07:00:00.000Z'),
      end: new Date('2023-02-13T16:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    const res = await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        ...createdSlot.dataValues, end: '2023-02-13T20:00:00.000Z',
      });

    expect(res.body).toMatchObject({
      end: '2023-02-13T20:00:00.000Z', info: null, start: '2023-02-13T07:00:00.000Z', type: 'available',
    });
    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).toBeDefined();
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-13T07:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-13T20:00:00.000Z'));
  });

  test("cannot edit an available timeslot's start time if original is in past", async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-13T07:00:00.000Z'),
      end: new Date('2023-02-13T16:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    const res = await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        ...createdSlot.dataValues, start: '2023-02-13T09:00:00.000Z',
      });

    expect(res.body.error.message).toContain('Timeslot in past cannot be modified');

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).toBeDefined();
    expect(updatedSlot?.dataValues.start).toEqual(createdSlot.start);
    expect(updatedSlot?.dataValues.end).toEqual(createdSlot.end);
  });

  test('can edit a blocked timeslot', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      type: 'blocked',
      airfieldCode: 'EFHK',
    });

    await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-17T12:00:00.000Z', end: '2023-02-17T14:00:00.000Z', type: 'blocked', info: null,
      });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).toBeDefined();
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-17T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-17T14:00:00.000Z'));
  });

  test('can edit an available timeslot with reservation', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });
    const newReservation: Reservation = await Reservation.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      aircraftId: 'ESA-111',
      phone: '0501102323',
    });
    createdSlot.addReservations([newReservation]);

    await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-16T12:00:00.000Z', end: '2023-02-16T14:00:00.000Z', type: 'available', info: null,
      });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T14:00:00.000Z'));
  });

  test('dont edit a timeslot if all fields not provided', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
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
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-17T12:00:00.000Z'), end: new Date('2023-02-17T13:15:00.000Z'), type: 'available', info: null,
      });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T13:00:00.000Z'));
  });

  test('dont edit a timeslot if type is not available or blocked', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T13:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-17T12:00:00.000Z', end: new Date('2023-02-17T13:15:00.000Z'), type: 'error', info: null,
      });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T13:00:00.000Z'));
  });

  test('dont edit a timeslot with reservation  if it goes outside reservation range', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T14:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });
    const newReservation: Reservation = await Reservation.create({
      start: new Date('2023-02-16T12:00:00.000Z'),
      end: new Date('2023-02-16T14:00:00.000Z'),
      aircraftId: 'ESA-111',
      phone: '0501102323',
    });
    createdSlot.addReservations([newReservation]);

    await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({ start: '2023-02-16T12:00:00.000Z', end: '2023-02-16T13:00:00.000Z', type: 'available' });

    const updatedSlot: Timeslot | null = await Timeslot.findOne(
      { where: { id: createdSlot.dataValues.id } },
    );

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-16T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-16T14:00:00.000Z'));
  });

  test('dont edit a timeslot if it is in past', async () => {
    const createdSlot: Timeslot = await Timeslot.create({
      start: new Date('2023-02-12T12:00:00.000Z'),
      end: new Date('2023-02-12T14:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    const response = await api.put(`/api/EFHK/timeslots/${createdSlot.dataValues.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-16T12:00:00.000Z', end: '2023-02-16T13:00:00.000Z', type: 'available', info: null,
      });

    const updatedSlot: Timeslot | null = await Timeslot.findByPk(createdSlot.id);

    expect(updatedSlot).not.toEqual(null);
    expect(updatedSlot?.dataValues.start).toEqual(new Date('2023-02-12T12:00:00.000Z'));
    expect(updatedSlot?.dataValues.end).toEqual(new Date('2023-02-12T14:00:00.000Z'));
    expect(response.body.error.message).toContain('Timeslot in past cannot be modified');
  });

  test('can delete a timeslot', async () => {
    const createdSlot: Timeslot | null = await Timeslot.findOne({});
    await api.delete(`/api/EFHK/timeslots/${createdSlot?.dataValues.id}`);

    const deletedSlot: Timeslot | null = await Timeslot.findByPk(createdSlot?.dataValues.id);
    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length - 1);
    expect(deletedSlot).toEqual(null);
  });

  test('dont delete a timeslot if it doesnt exist', async () => {
    await api.delete('/api/EFHK/timeslots/-1');

    const numberOfTimeslots: Number = await Timeslot.count();

    expect(numberOfTimeslots).toEqual(timeslotData.length);
  });

  test('dont delete a timeslot from past', async () => {
    const newTimeslot: any = await Timeslot.create({
      start: new Date('2022-02-13T08:00:00.000Z'),
      end: new Date('2022-02-13T09:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    await api.delete(`/api/EFHK/timeslots/${newTimeslot.id}`);

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

    await api.delete(`/api/EFHK/timeslots/${createdSlot?.id}`);

    const deletedSlot = await Timeslot.findByPk(createdSlot?.id);
    const numberOfTimeslots: Number = await Timeslot.count();
    expect(deletedSlot).not.toEqual(null);
    expect(numberOfTimeslots).toEqual(timeslotData.length);
  });

  test('can get timeslots in a range', async () => {
    const from = new Date(timeslotDataBegin);
    const until = new Date(timeslotDataEnd);
    const response = await api.get(`/api/EFHK/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
    const timeslots = response.body;
    const startTimes = timeslots.map((o: { start: String; }) => o.start);

    expect(timeslots.length).toEqual(timeslotData.length);
    expect(startTimes).toEqual(timeslotData.map((ts) => ts.start.toISOString()));
  });

  test('return empty list if no timeslots in range', async () => {
    const from = new Date(timeslotDataEnd);
    const until = new Date(timeslotDataEnd);
    from.setDate(until.getDate() + 1);
    until.setDate(until.getDate() + 2);
    const response = await api.get(`/api/EFHK/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);

    expect(response.body).toEqual([]);
  });

  test('Timeslot cannot be added if start is later than end', async () => {
    const start = new Date('2023-02-24T08:00:00.000Z');
    const end = new Date('2023-02-24T06:00:00.000Z');

    const newTimeslot: any = await api.post('/api/EFHK/timeslots/').set('Content-type', 'application/json').send({
      start, end, type: 'available', info: null,
    });

    expect(newTimeslot.body.error).toBeDefined();
    expect(newTimeslot.body.error.message).toContain('start time cannot be later than the end time');

    const response = await api
      .get(`/api/EFHK/timeslots?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(response.body).toHaveLength(0);
  });

  test('cannot update timeslot to make it consecutive', async () => {
    // First, create two non-consecutive timeslots
    const timeslot1 = await Timeslot.create({
      start: new Date('2023-02-19T08:00:00.000Z'),
      end: new Date('2023-02-19T10:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    await Timeslot.create({
      start: new Date('2023-02-19T12:00:00.000Z'),
      end: new Date('2023-02-19T14:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    const updatedStart = new Date('2023-02-19T10:00:00.000Z');
    const updatedEnd = new Date('2023-02-19T12:00:00.000Z');
    const response = await api.put(`/api/EFHK/timeslots/${timeslot1.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: updatedStart,
        end: updatedEnd,
        type: 'available',
        info: null,
      });

    expect(response.status).toEqual(400);
    expect(response.body.error.message).toEqual('Operation would result in consecutive timeslots');

    const updatedTimeslot1 = await Timeslot.findByPk(timeslot1.id);
    expect(updatedTimeslot1?.start).toEqual(timeslot1.start);
    expect(updatedTimeslot1?.end).toEqual(timeslot1.end);
  });

  test('cannot update non-existent timeslot', async () => {
    const nonExistentTimeslotId = 9999;

    const updatedStart = new Date('2023-02-19T08:00:00.000Z');
    const updatedEnd = new Date('2023-02-19T10:00:00.000Z');
    const response = await api.put(`/api/EFHK/timeslots/${nonExistentTimeslotId}`)
      .set('Content-type', 'application/json')
      .send({
        start: updatedStart,
        end: updatedEnd,
        type: 'available',
        info: null,
      });

    expect(response.status).toEqual(400);
    expect(response.body.error.message).toEqual('No timeslot with id exists');
  });

  test('cannot move timeslot start time to the past', async () => {
    const timeslot = await Timeslot.create({
      start: new Date('2023-02-20T12:00:00.000Z'),
      end: new Date('2023-02-20T14:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    const updatedStart = new Date('2023-01-20T12:00:00.000Z');
    const updatedEnd = new Date('2023-01-20T14:00:00.000Z');
    const response = await api.put(`/api/EFHK/timeslots/${timeslot.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: updatedStart,
        end: updatedEnd,
        type: 'available',
        info: null,
      });

    expect(response.status).toEqual(400);
    expect(response.body.error.message).toContain('Timeslot cannot be in past');

    const updatedTimeslot = await Timeslot.findByPk(timeslot.id);
    expect(updatedTimeslot?.start).toEqual(timeslot.start);
    expect(updatedTimeslot?.end).toEqual(timeslot.end);
  });

  test('cannot update an available timeslot with existing reservations', async () => {
    const timeslot = await Timeslot.create({
      start: new Date('2023-02-21T12:00:00.000Z'),
      end: new Date('2023-02-21T14:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    const reservation = await Reservation.create({
      start: new Date('2023-02-21T12:30:00.000Z'),
      end: new Date('2023-02-21T13:30:00.000Z'),
      aircraftId: 'OH-QAA',
      info: 'Initial reservation',
      phone: '11104040',
    });

    await timeslot.addReservations([reservation]);

    const updatedStart = new Date('2023-02-21T12:40:00.000Z');
    const response = await api.put(`/api/EFHK/timeslots/${timeslot.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: updatedStart,
        end: timeslot.end,
        type: 'available',
        info: null,
      });

    expect(response.status).toEqual(400);
    expect(response.body.error.message).toEqual('Timeslot has reservations');

    const updatedTimeslot = await Timeslot.findByPk(timeslot.id);
    expect(updatedTimeslot?.start).toEqual(timeslot.start);
    expect(updatedTimeslot?.end).toEqual(timeslot.end);
  });

  test('update timeslot with periodEnd creates a period', async () => {
    const timeslot = await Timeslot.create({
      start: new Date('2023-02-21T12:00:00.000Z'),
      end: new Date('2023-02-21T14:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    const periodEnd = new Date('2023-03-21T16:00:00.000Z');
    const response = await api.put(`/api/EFHK/timeslots/${timeslot.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: timeslot.start,
        end: timeslot.end,
        type: 'available',
        info: null,
        periodEnd,
        days: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        },
      });

    expect(response.status).toEqual(200);
    expect(response.body.length).toBeGreaterThan(10);

    const allTimeslots = await Timeslot.findAll();
    expect(allTimeslots.length).toBeGreaterThan(10);
  });

  test('cannot create a consecutive timeslot', async () => {
    const consecutiveTimeslot = {
      start: new Date('2023-02-14T10:00:00.000Z'),
      end: new Date('2023-02-14T12:00:00.000Z'),
      type: 'available',
      info: null,
    };

    const response = await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send(consecutiveTimeslot);

    expect(response.status).toEqual(400);
    expect(response.body.error.message).toEqual('Operation would result in consecutive timeslots');

    const createdTimeslot = await Timeslot.findOne({ where: { start: consecutiveTimeslot.start } });
    expect(createdTimeslot).toBeNull();
  });

  test('cannot create a period with overlapping timeslots', async () => {
    const createdTimeslot = await Timeslot.create({
      start: new Date('2023-02-16T08:00:00.000Z'),
      end: new Date('2023-02-16T10:00:00.000Z'),
      type: 'available',
      info: null,
      airfieldCode: 'EFHK',
    });

    const response = await api.put(`/api/EFHK/timeslots/${createdTimeslot.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-15T08:00:00.000Z'),
        end: new Date('2023-02-15T10:00:00.000Z'),
        type: 'available',
        info: null,
        periodEnd: new Date('2023-02-18T00:00:00.000Z'),
        name: 'Overlapping period',
        days: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        },
      });

    expect(response.status).toEqual(400);
    expect(response.body.error.message).toEqual('Operation would result in overlapping timeslots');

    const createdPeriodTimeslots = await Timeslot
      .findAll({ where: { group: 'Overlapping period' } });
    expect(createdPeriodTimeslots.length).toEqual(0);
  });

  test('delete times from the period', async () => {
    const timeslotDataGroup: Omit<TimeslotEntry, 'id'>[] = [
      {
        start: new Date('2023-02-15T08:00:00.000Z'), end: new Date('2023-02-15T10:00:00.000Z'), type: 'available', info: null, airfieldCode: 'EFHK', group: 'group-1',
      },
      {
        start: new Date('2023-02-16T08:00:00.000Z'), end: new Date('2023-02-16T10:00:00.000Z'), type: 'available', info: null, airfieldCode: 'EFHK', group: 'group-1',
      },
      {
        start: new Date('2023-02-17T08:00:00.000Z'), end: new Date('2023-02-17T10:00:00.000Z'), type: 'available', info: null, airfieldCode: 'EFHK', group: 'group-1',
      },
    ];

    await Timeslot.bulkCreate(timeslotDataGroup);

    const response = await api.delete('/api/EFHK/timeslots/group/group-1')
      .set('Content-type', 'application/json')
      .send({
        startingFrom: new Date('2023-02-16T08:00:00.000Z'),
      });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual('2 timeslots from period group-1 deleted');

    const allTimeslots = await Timeslot.findAll();
    expect(allTimeslots.length).toEqual(timeslotData.length + 1);
  });
});
