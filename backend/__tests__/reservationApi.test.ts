import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Reservation, Timeslot } from '@lentovaraukset/backend/src/models';
import { ServiceErrorCode } from '@lentovaraukset/shared/src';
import { connectToDatabase, sequelize } from '../src/util/db';
import airfieldService from '../src/services/airfieldService';
import reservationService from '../src/services/reservationService';
import configurationService from '../src/services/configurationService';

jest.mock('@lentovaraukset/backend/src/auth/passport.ts');
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
  jest.setSystemTime(new Date('2023-02-13T07:00:00.000Z'));
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });

  await airfieldService.createTestAirfield();
  await configurationService
    .updateById(1, { maxDaysInFuture: 7, daysToStart: 0 });
  const timeslot = await Timeslot.create({
    start: new Date('2023-02-12T08:00:00.000Z'),
    end: new Date('2023-02-15T08:00:00.000Z'),
    type: 'available',
    airfieldCode: 'EFHK',
  });
  const createdReservations = await Reservation.bulkCreate(reservations);
  // reservations must be linked to timeslots
  await createdReservations[0].setTimeslot(timeslot);
  await createdReservations[1].setTimeslot(timeslot);
  await createdReservations[2].setTimeslot(timeslot);
});

afterAll(async () => {
  // return to the present
  jest.useRealTimers();

  // otherwise Jest needs --forceExit
  await sequelize.close();
});

describe('Calls to api', () => {
  test('can add a reservation with info', async () => {
    const newReservation: any = await api.post('/api/EFHK/reservations/')
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
    const newReservation: any = await api.post('/api/EFHK/reservations/')
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
    const result: any = await api.post('/api/EFHK/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: ' ',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.validationIssues.fieldErrors.phone[0].code).toBe('too_small');
    expect(result.body.error.message).toContain('vaaditaan');
  });

  test('cannot create a reservation with empty aircraft ID', async () => {
    const result: any = await api.post('/api/EFHK/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: ' ', info: 'Training flight', phone: '11104040',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.validationIssues.fieldErrors.aircraftId[0].message).toBe('Lentokentän tunnus vaaditaan');
    expect(result.body.error.message).toContain('vaaditaan');
  });

  test('cannot create a reservation to past', async () => {
    await Timeslot.create({
      start: new Date('2023-02-12T08:00:00.000Z'),
      end: new Date('2023-02-12T16:00:00.000Z'),
      type: 'blocked',
      airfieldCode: 'EFHK',
    });
    const result: any = await api.post('/api/EFHK/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-12T12:00:00.000Z'), end: new Date('2023-02-12T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: '11104040',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.message).toContain('Varaus tulee tehdä vähintään');
  });

  test('can delete a reservation', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;
    await api.delete(`/api/EFHK/reservations/${id}`);

    const deletedReservation: Reservation | null = await Reservation.findByPk(id);
    expect(deletedReservation).toBe(null);

    const numberOfReservations: Number = await Reservation.count();
    expect(numberOfReservations).toEqual(reservations.length - 1);
  });

  test('can\'t delete a reservation when it doesn\'t exists', async () => {
    await api.delete('/api/EFHK/reservations/-1');
    expect(await Reservation.count()).toEqual(reservations.length);
  });

  test('can\'t delete a reservation from past', async () => {
    const newReservation: any = await Reservation.create({
      start: new Date('2022-02-13T08:00:00.000Z'),
      end: new Date('2022-02-13T09:00:00.000Z'),
      aircraftId: 'OH-QAA',
      phone: '11104040',
    });

    await api.delete(`/api/EFHK/reservations/${newReservation.id}`);

    expect(await Reservation.count()).toEqual(reservations.length + 1);
  });

  test('can edit a reservation ', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;
    const aircraftId = createdReservation?.dataValues.aircraftId;
    const phone = createdReservation?.dataValues.phone;
    await api.put(`/api/EFHK/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: '2023-02-14T20:00:00.000Z', end: '2023-02-14T22:00:00.000Z', aircraftId, phone,
      });

    const updatedReservation: Reservation | null = await Reservation.findByPk(id);

    expect(updatedReservation).not.toEqual(null);
    expect(updatedReservation?.dataValues.start).toEqual(new Date('2023-02-14T20:00:00.000Z'));
    expect(updatedReservation?.dataValues.end).toEqual(new Date('2023-02-14T22:00:00.000Z'));
    expect(updatedReservation?.dataValues.aircraftId).toEqual(aircraftId);
    expect(updatedReservation?.dataValues.phone).toEqual(phone);
  });

  test('cannot modify a reservation to have an empty phone number', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;

    const updatedReservation: any = await api.put(`/api/EFHK/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: ' ',
      });

    expect(updatedReservation.statusCode).toEqual(400);
    expect(updatedReservation.body.error.message).toContain('Puhelinnumero vaaditaan');

    const reservationAfterUpdate: Reservation | null = await Reservation.findByPk(id);
    expect(reservationAfterUpdate?.dataValues.phone).not.toEqual('');
  });

  test('cannot update a reservation in past', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;
    await Timeslot.create({
      start: new Date('2023-02-12T08:00:00.000Z'),
      end: new Date('2023-02-12T16:00:00.000Z'),
      type: 'blocked',
      airfieldCode: 'EFHK',
    });
    const result: any = await api.put(`/api/EFHK/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-12T12:00:00.000Z'), end: new Date('2023-02-12T14:00:00.000Z'), aircraftId: 'OH-QAA', info: 'Training flight', phone: '11104040',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.body.error.message).toContain('Varaus tulee tehdä vähintään');
  });

  test('cannot modify a reservation to have an empty aircraft ID', async () => {
    const createdReservation: Reservation | null = await Reservation.findOne();
    const id = createdReservation?.dataValues.id;

    const updatedReservation: any = await api.put(`/api/EFHK/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: ' ', info: 'Training flight', phone: '11104040',
      });

    expect(updatedReservation.statusCode).toEqual(400);
    expect(updatedReservation.body.error.message).toContain('Lentokentän tunnus vaaditaan');

    const reservationAfterUpdate: Reservation | null = await Reservation.findByPk(id);
    expect(reservationAfterUpdate?.dataValues.aircraftId).not.toEqual('');
  });

  test('can get reservations in a range', async () => {
    const from = new Date(earliestReservation.end);
    const until = new Date(latestReservation.end);

    from.setHours(from.getHours() + 1);
    const response = await api
      .get(`/api/EFHK/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);

    expect(response.body.length).toEqual(2);
    expect(response.body).toMatchObject([reservations[1], reservations[2]].map(
    // API response has dates as strings not date objects
      ({ start, end, ...rest }) => ({
        start: start.toISOString(),
        end: end.toISOString(),
        ...rest,
      }),
    ));
  });

  test('return an empty list if no reservation in range', async () => {
    const from = new Date(earliestReservation.start);
    const until = new Date(latestReservation.end);

    from.setDate(until.getDate() + 1);
    until.setDate(until.getDate() + 2);

    const response = await api
      .get(`/api/EFHK/reservations?from=${from.toISOString()}&until=${until.toISOString()}`);
    expect(response.body).toEqual([]);
  });

  test('Reservation cannot be add in past', async () => {
    const start = new Date('2023-02-13T06:00:00.000Z');
    const end = new Date('2023-02-13T08:00:00.000Z');

    const newReservation: any = await api.post('/api/EFHK/reservations/')
      .set('Content-type', 'application/json')
      .send({
        start, end, aircraftId: 'OH-QAA', phone: '11104040',
      });

    const response = await api
      .get(`/api/EFHK/reservations?from=${start.toISOString()}&until=${end.toISOString()}`);

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
    const response = await api.put(`/api/EFHK/reservations/${newReservation.id}`)
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

    const newReservation: any = await api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newReservation.body.error).toBeDefined();
    expect(newReservation.body.error.message).toContain('Voit tehdä varauksen korkeintaan');

    const response = await api
      .get(`/api/EFHK/reservations?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(response.body).toHaveLength(0);
  });

  test('Reservation cannot be added if start is later than end', async () => {
    const start = new Date('2023-02-24T08:00:00.000Z');
    const end = new Date('2023-02-24T06:00:00.000Z');

    const newReservation: any = await api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newReservation.body.error).toBeDefined();
    expect(newReservation.body.error.message).toContain('Varauksen alkuaika ei voi olla myöhempi kuin loppuaika');

    const response = await api
      .get(`/api/EFHK/reservations?from=${start.toISOString()}&until=${end.toISOString()}`);

    expect(response.body).toHaveLength(0);
  });

  test('Reservation has to be within a timeslot upon creation', async () => {
    await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-16T08:00:00.000Z'), end: new Date('2023-02-16T18:00:00.000Z'), type: 'available', info: null,
      });

    const start = new Date('2023-02-16T07:00:00.000Z');
    const end = new Date('2023-02-16T09:00:00.000Z');

    const newReservation: any = await api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newReservation.body.error).toBeDefined();
    expect(newReservation.body.error.message).toContain('Reservation is not within timeslot');
    expect(newReservation.body.error.code).toEqual(
      ServiceErrorCode.ReservationExceedsTimeslot,
    );
  });

  test('Reservation has to be within a timeslot when modified', async () => {
    const tsRes = await api.post('/api/EFHK/timeslots/')
      .set('Content-type', 'application/json')
      .send({
        start: new Date('2023-02-16T08:00:00.000Z'), end: new Date('2023-02-16T18:00:00.000Z'), type: 'available', info: null,
      });

    expect(tsRes.body.error).not.toBeDefined();

    const start = new Date('2023-02-16T08:00:00.000Z');
    const newStart = new Date('2023-02-16T07:00:00.000Z');
    const end = new Date('2023-02-16T09:00:00.000Z');

    const newReservation: any = await api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(newReservation.body.error).not.toBeDefined();

    const modifiedReservation: any = await api.put(`/api/EFHK/reservations/${newReservation.id}`).set('Content-type', 'application/json').send({
      ...newReservation.body, start: newStart, info: undefined,
      // TODO: fix weirdness with interacting with API where null isnt undefined
    });
    expect(modifiedReservation.body.error).toBeDefined();
    expect(modifiedReservation.body.error.message).toContain('Reservation is not within timeslot');
    expect(modifiedReservation.body.error.code).toEqual(
      ServiceErrorCode.ReservationExceedsTimeslot,
    );
  });

  test('can add concurrent reservations up to the max concurrent reservations', async () => {
    const start = new Date('2023-02-14T12:00:00.000Z');
    const end = new Date('2023-02-14T14:00:00.000Z');

    const res = await Promise.all([...Array(3)].map(async () => api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    })));

    res.forEach((r) => { expect(r.status).toEqual(200); });

    const reservationsInDB = await reservationService.getInTimeRange(start, end, 'EFHK');
    expect(reservationsInDB).toHaveLength(3);
  });

  test('cannot add concurrent reservations past the max concurrent reservations', async () => {
    const start = new Date('2023-02-14T12:00:00.000Z');
    const end = new Date('2023-02-14T14:00:00.000Z');

    await Promise.all([...Array(3)].map(async () => api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    })));

    const res = await api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start, end, aircraftId: 'OH-ASD', phone: '+358494678748',
    });

    expect(res.status).toEqual(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toContain('Too many concurrent reservations');

    const reservationsInDB = await reservationService.getInTimeRange(start, end, 'EFHK');
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
    ].map(async (flight) => api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send(flight)));

    const res = await api.post('/api/EFHK/reservations/').set('Content-type', 'application/json').send({
      start: new Date('2023-02-14T12:00:00.000Z'), end: new Date('2023-02-14T14:00:00.000Z'), aircraftId: 'OH-FGH', phone: '+358494678748',
    });

    expect(res.status).toEqual(200);

    const reservationsInDB = await reservationService.getInTimeRange(new Date('2023-02-14T12:00:00.000Z'), new Date('2023-02-14T14:00:00.000Z'), 'EFHK');
    expect(reservationsInDB).toHaveLength(4);
  });

  test('throws error when updating reservation with too many concurrent reservations', async () => {
    const concurrentReservations = [
      {
        start: new Date('2023-02-14T14:00:00.000Z'),
        end: new Date('2023-02-14T16:00:00.000Z'),
        aircraftId: 'XZ-ABC',
        info: 'Concurrent reservation 1',
        phone: '0403333333',
      },
      {
        start: new Date('2023-02-14T14:00:00.000Z'),
        end: new Date('2023-02-14T16:00:00.000Z'),
        aircraftId: 'DK-ASD',
        info: 'Concurrent reservation 2',
        phone: '0404444444',
      },
    ];
    const createdResevations = await Reservation.bulkCreate(concurrentReservations);
    const timeslot = await Timeslot.findOne();
    await createdResevations[0].setTimeslot(timeslot!);
    await createdResevations[1].setTimeslot(timeslot!);

    const oldReservation = reservations[0];
    const oldReservationInDB = await Reservation.findOne(
      { where: { start: oldReservation.start } },
    );
    expect(oldReservationInDB).toBeDefined();

    const id = oldReservationInDB?.dataValues.id;
    const updatedReservationData = {
      start: new Date('2023-02-14T14:00:00.000Z'),
      end: new Date('2023-02-14T16:00:00.000Z'),
      aircraftId: 'XZ-ABC',
      info: 'Updated reservation info',
      phone: '0402222222',
    };

    const response = await api.put(`/api/EFHK/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send(updatedReservationData)
      .expect(400);

    expect(response.body.error.message).toEqual('Too many concurrent reservations');
  });

  test('throws error when creating reservation on top of blocked timeslot', async () => {
    await Timeslot.create({
      start: new Date('2023-02-14T12:00:00.000Z'),
      end: new Date('2023-02-14T14:00:00.000Z'),
      type: 'blocked',
      airfieldCode: 'EFHK',
    });

    const newReservationData = {
      start: new Date('2023-02-14T12:20:00.000Z'),
      end: new Date('2023-02-14T13:20:00.000Z'),
      aircraftId: 'OH-QAA',
      info: 'Attempted reservation',
      phone: '11104040',
    };

    const response = await api.post('/api/EFHK/reservations/')
      .set('Content-type', 'application/json')
      .send(newReservationData)
      .expect(400);

    expect(response.body.error.message).toEqual('Reservation cannot be created on top of blocked timeslot');
  });

  test('throws an error if reservation overlaps multiple timeslots', async () => {
    const newReservation = {
      start: new Date('2023-02-14T10:00:00.000Z'),
      end: new Date('2023-02-14T14:00:00.000Z'),
      aircraftId: 'OH-QAA',
      phone: '11104040',
    };

    await Timeslot.bulkCreate([
      {
        start: new Date('2023-02-14T10:00:00.000Z'),
        end: new Date('2023-02-14T11:00:00.000Z'),
        type: 'available',
        airfieldCode: 'EFHK',
      },
      {
        start: new Date('2023-02-14T12:00:00.000Z'),
        end: new Date('2023-02-14T14:00:00.000Z'),
        type: 'available',
        airfieldCode: 'EFHK',
      },
    ]);

    const response = await api.post('/api/EFHK/reservations/')
      .set('Content-type', 'application/json')
      .send(newReservation);

    expect(response.status).toBe(400);
    expect(response.body.error.message).toEqual('Reservation should be created for one timeslot');
  });

  test('throws error when updating reservation on top of blocked timeslot', async () => {
    await Timeslot.create({
      start: new Date('2023-02-14T12:00:00.000Z'),
      end: new Date('2023-02-14T14:00:00.000Z'),
      type: 'blocked',
      airfieldCode: 'EFHK',
    });

    const newReservationData = {
      start: new Date('2023-02-14T12:20:00.000Z'),
      end: new Date('2023-02-14T13:20:00.000Z'),
      aircraftId: 'OH-QAA',
      info: 'Attempted reservation',
      phone: '11104040',
    };

    const oldReservation = reservations[0];
    const oldReservationInDB = await Reservation.findOne(
      { where: { start: oldReservation.start } },
    );
    expect(oldReservationInDB).toBeDefined();

    const id = oldReservationInDB?.dataValues.id;
    const response = await api.put(`/api/EFHK/reservations/${id}`)
      .set('Content-type', 'application/json')
      .send(newReservationData)
      .expect(400);

    expect(response.body.error.message).toEqual('Reservation cannot be created on top of blocked timeslot');
  });

  test('throws error when updating reservation spanning more than one timeslot', async () => {
    const timeslots = await Timeslot.bulkCreate([
      {
        start: new Date('2023-02-14T10:00:00.000Z'),
        end: new Date('2023-02-14T12:00:00.000Z'),
        type: 'available',
        airfieldCode: 'EFHK',
      },
      {
        start: new Date('2023-02-14T12:00:00.000Z'),
        end: new Date('2023-02-14T14:00:00.000Z'),
        type: 'available',
        airfieldCode: 'EFHK',
      },
    ]);

    const newReservationData = {
      start: new Date('2023-02-14T10:20:00.000Z'),
      end: new Date('2023-02-14T11:20:00.000Z'),
      aircraftId: 'OH-QAA',
      info: 'Initial reservation',
      phone: '11104040',
    };
    const createdReservation = await Reservation.create(newReservationData);
    await createdReservation.setTimeslot(timeslots[0]);
    const updatedReservationData = {
      start: new Date('2023-02-14T10:20:00.000Z'),
      end: new Date('2023-02-14T13:20:00.000Z'),
      aircraftId: 'OH-QAA',
      info: 'Initial reservation',
      phone: '11104040',
    };

    const response = await api.put(`/api/EFHK/reservations/${createdReservation.id}`)
      .set('Content-type', 'application/json')
      .send(updatedReservationData)
      .expect(400);

    expect(response.body.error.message).toEqual('Reservation should be created for one timeslot');
  });

  test('successfully updates reservation and moves it to the new timeslot', async () => {
    const availableTimeslot1 = await Timeslot.create({
      start: new Date('2023-02-15T10:00:00.000Z'),
      end: new Date('2023-02-15T12:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    const availableTimeslot2 = await Timeslot.create({
      start: new Date('2023-02-15T12:00:00.000Z'),
      end: new Date('2023-02-15T14:00:00.000Z'),
      type: 'available',
      airfieldCode: 'EFHK',
    });

    const newReservationData = {
      start: new Date('2023-02-15T10:20:00.000Z'),
      end: new Date('2023-02-15T11:20:00.000Z'),
      aircraftId: 'OH-QAA',
      info: 'Initial reservation',
      phone: '11104040',
    };

    const createdReservation = await Reservation.create(newReservationData);
    await createdReservation.setTimeslot(availableTimeslot1);

    const updatedReservationData = {
      start: new Date('2023-02-15T12:20:00.000Z'),
      end: new Date('2023-02-15T13:20:00.000Z'),
      aircraftId: 'OH-QAA',
      info: 'Initial reservation',
      phone: '11104040',
    };

    await api.put(`/api/EFHK/reservations/${createdReservation.id}`)
      .set('Content-type', 'application/json')
      .send(updatedReservationData)
      .expect(200);

    const updatedReservation = await Reservation.findByPk(
      createdReservation.id,
      { include: [Timeslot] },
    );
    expect(updatedReservation?.start).toEqual(updatedReservationData.start);
    expect(updatedReservation?.end).toEqual(updatedReservationData.end);
    const result = await updatedReservation?.getTimeslot();
    expect(result?.id).toEqual(availableTimeslot2.id);
  });
});
