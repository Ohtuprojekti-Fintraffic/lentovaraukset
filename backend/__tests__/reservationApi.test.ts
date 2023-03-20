import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Reservation, Timeslot } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';
import airfieldService from '../src/services/airfieldService';
import reservationService from '../src/services/reservationService';

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
  await Timeslot.create({
    start: new Date('2023-02-12T08:00:00.000Z'),
    end: new Date('2023-02-15T08:00:00.000Z'),
    type: 'available',
  });
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

  test('cannot create a reservation with empty phone number', async () => {
    const result: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: ' ',
      });
    console.log(result.body);
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.message.includes('Phone number cannot be empty'));
  });

  test('cannot create a reservation with empty aircraft ID', async () => {
    const result: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: ' ', info: 'Training flight', phone: '11104040',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.message.includes('Aircraft ID cannot be empty'));
  });

  test('cannot create a reservation on top of blocked timeslot', async () => {
    await Timeslot.create({
      start: new Date('2023-02-12T08:00:00.000Z'),
      end: new Date('2023-02-12T16:00:00.000Z'),
      type: 'blocked',
    });
    const result: any = await api.post('/api/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-12T12:00:00.000Z'), end: new Date('2023-02-12T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: '11104040',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.message.includes('Reservation cannot be created on top of blocked timeslot'));
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

  test('can\'t delete a reservation from past', async () => {
    const newReservation: any = await Reservation.create({
      start: new Date('2022-02-13T08:00:00.000Z'),
      end: new Date('2022-02-13T09:00:00.000Z'),
      aircraftId: 'OH-QAA',
      phone: '11104040',
    });

    await api.delete(`/api/reservations/${newReservation.id}`);

    expect(await Reservation.count()).toEqual(reservations.length + 1);
  });

  test('can edit a reservation ', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;
    const aircraftId = createdReservation?.dataValues.aircraftId;
    const phone = createdReservation?.dataValues.phone;
    await api.put(`/api/reservations/${id}`)
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

  test('cannot modify a reservation to have an empty phone number', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;

    const updatedReservation: any = await api.put(`/api/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: ' ',
      });

    expect(updatedReservation.statusCode).toEqual(400);
    expect(updatedReservation.body.error.message.includes('Phone number cannot be empty'));

    const reservationAfterUpdate: Reservation | null = await Reservation.findByPk(id);
    expect(reservationAfterUpdate?.dataValues.phone).not.toEqual('');
  });

  test('cannot update a reservation on top of blocked timeslot', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;
    await Timeslot.create({
      start: new Date('2023-02-12T08:00:00.000Z'),
      end: new Date('2023-02-12T16:00:00.000Z'),
      type: 'blocked',
    });
    const result: any = await api.put(`/api/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-12T12:00:00.000Z'), end: new Date('2023-02-12T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: '11104040',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.message.includes('Reservation cannot be created on top of blocked timeslot'));
  });

  test('cannot modify a reservation to have an empty aircraft ID', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;

    const updatedReservation: any = await api.put(`/api/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: ' ', info: 'Training flight', phone: '11104040',
      });

    expect(updatedReservation.statusCode).toEqual(400);
    expect(updatedReservation.body.error.message.includes('Aircraft ID cannot be empty'));

    const reservationAfterUpdate: Reservation | null = await Reservation.findByPk(id);
    expect(reservationAfterUpdate?.dataValues.aircraftId).not.toEqual('');
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

  test('can\'t move reservation from past', async () => {
    const newReservation: any = await Reservation.create({
      start: new Date('2022-02-13T08:00:00.000Z'),
      end: new Date('2022-02-13T09:00:00.000Z'),
      aircraftId: 'OH-QAA',
      phone: '11104040',
    });
    const response = await api.put(`/api/reservations/${newReservation.id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-15T02:00:00.000Z',
        end: '2023-02-15T04:00:00.000Z',
        aircraftId: newReservation.aircraftId,
        phone: newReservation.phone,
      });

    const updatedReservation: Reservation | null = await Reservation.findByPk(newReservation.id);

    expect(response.body.error.message).toContain('Reservation in past cannot be modified');
    expect(updatedReservation).not.toEqual(null);
    expect(updatedReservation?.dataValues.start).toEqual(new Date('2022-02-13T08:00:00.000Z'));
    expect(updatedReservation?.dataValues.end).toEqual(new Date('2022-02-13T09:00:00.000Z'));
  });

  test('Reservation cannot be added further than the max days ahead', async () => {
    const start = new Date('2023-02-24T06:00:00.000Z');
    const end = new Date('2023-02-24T08:00:00.000Z');

    const newReservation: any = await api.post('/api/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newReservation.body.error).toBeDefined();
    expect(newReservation.body.error.message).toContain('Voit tehdä varauksen korkeintaan');

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
    expect(newReservation.body.error.message).toContain('Varauksen alkuaika ei voi olla myöhempi kuin loppuaika');

    const response = await api
      .get(`/api/reservations?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(response.body).toHaveLength(0);
  });

  test('can add concurrent reservations up to the max concurrent reservations', async () => {
    const start = new Date('2023-02-14T12:00:00.000Z');
    const end = new Date('2023-02-14T14:00:00.000Z');

    const res = await Promise.all([...Array(3)].map(async () => api.post('/api/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    })));

    res.forEach((r) => { expect(r.status).toEqual(200); });

    const reservationsInDB = await reservationService.getInTimeRange(start, end);
    expect(reservationsInDB).toHaveLength(3);
  });

  test('cannot add concurrent reservations past the max concurrent reservations', async () => {
    const start = new Date('2023-02-14T12:00:00.000Z');
    const end = new Date('2023-02-14T14:00:00.000Z');

    await Promise.all([...Array(3)].map(async () => api.post('/api/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    })));

    const res = await api.post('/api/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    // expect(res.status).toEqual(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toContain('Too many concurrent reservations');

    const reservationsInDB = await reservationService.getInTimeRange(start, end);
    expect(reservationsInDB).toHaveLength(3);
  });

  test('can add reservation that overlaps more reservations than the maxConcurrentFlights', async () => {
    await Promise.all([
      {
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-ASD', phone: '+358494678748',
      },
      {
        start: new Date('2023-02-14T11:00:00.000Z'), end: new Date('2023-02-14T13:00:00.000Z'), aircraftId: 'OH-SDF', phone: '+358494678748',
      },
      {
        start: new Date('2023-02-14T13:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-DFG', phone: '+358494678748',
      },
    ].map(async (flight) => api.post('/api/reservations/').set('Content-type', 'application/json').send(flight)));

    const res = await api.post('/api/reservations/').set('Content-type', 'application/json').send({
      start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-FGH', phone: '+358494678748',
    });

    expect(res.status).toEqual(200);

    const reservationsInDB = await reservationService.getInTimeRange(new Date('2023-02-14T12:00:00.000Z'), new Date('2023-02-14T14:00:00.000Z'));
    expect(reservationsInDB).toHaveLength(4);
  });
});
