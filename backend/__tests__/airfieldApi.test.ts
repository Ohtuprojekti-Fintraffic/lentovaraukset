import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Airfield } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';

const api = request(app);

const airfields = [
  {
    code: 'EFHK', name: 'Helsinki-Vantaa', maxConcurrentFlights: 2, eventGranularityMinutes: 20,
  },
  {
    code: 'EFTU', name: 'Tampere', maxConcurrentFlights: 1, eventGranularityMinutes: 20,
  },
  {
    code: 'EFOU', name: 'Oulu', maxConcurrentFlights: 1, eventGranularityMinutes: 20,
  },
];

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
  await Airfield.bulkCreate(airfields);
});

afterAll(async () => {
  // otherwise Jest needs --forceExit
  await sequelize.close();
});

describe('Calls to api', () => {
  test('can create an airfield', async () => {
    const res = await api.post('/api/airfields/')
      .set('Content-type', 'application/json')
      .send({
        code: 'EFKK', name: 'Malmi', maxConcurrentFlights: 1, eventGranularityMinutes: 10,
      });

    const createdAirfield: Airfield | null = await Airfield.findOne(
      { where: { code: 'EFKK' } },
    );
    const numberOfAirfields: Number = await Airfield.count();

    expect(res.status).toEqual(200);
    expect(numberOfAirfields).toEqual(airfields.length + 1);
    expect(createdAirfield).not.toEqual(null);
    expect(createdAirfield?.dataValues.maxConcurrentFlights).toEqual(1);
    expect(createdAirfield?.dataValues.eventGranularityMinutes).toEqual(10);
  });

  test('dont create an airfield if all fields not provided', async () => {
    const res = await api.post('/api/airfields/')
      .set('Content-type', 'application/json')
      .send({ code: 'EFKK' });

    const createdAirfield: Airfield | null = await Airfield.findOne(
      { where: { code: 'EFKK' } },
    );
    const numberOfAirfields: Number = await Airfield.count();

    expect(res.body.error.message).toContain('Expected number');
    expect(numberOfAirfields).toEqual(airfields.length);
    expect(createdAirfield).toEqual(null);
  });

  test('dont create an airfield if name already exists', async () => {
    const res = await api.post('/api/airfields/')
      .set('Content-type', 'application/json')
      .send({
        code: 'EFHK', name: 'Malmi', maxConcurrentFlights: 2, eventGranularityMinutes: 20,
      });

    const numberOfAirfields: Number = await Airfield.count();

    expect(res.body.error.message).toContain('already exists');
    expect(numberOfAirfields).toEqual(airfields.length);
  });

  test('can get all airfields', async () => {
    const res = await api.get('/api/airfields/');

    expect(res.status).toEqual(200);
    expect(res.body.length).toEqual(airfields.length);
    expect(res.body).toEqual(expect.arrayContaining(airfields));
  });

  test('can get an airfield by code', async () => {
    const res = await api.get('/api/airfields/EFHK');

    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject(airfields[0]);
  });

  test('fails to get an airfield with wrong code', async () => {
    const res = await api.get('/api/airfields/WRONG_CODE');

    expect(res.status).toEqual(400);
    expect(res.body.error.message).toContain('Supplied airfield code could not be found');
  });

  test('can update an airfield by code', async () => {
    const updatedData = {
      name: 'Helsinki Airport',
      maxConcurrentFlights: 3,
      eventGranularityMinutes: 30,
    };
    const res = await api.put('/api/airfields/EFHK')
      .set('Content-type', 'application/json')
      .send(updatedData);

    const updatedAirfield = await Airfield.findOne({ where: { code: 'EFHK' } });

    expect(res.status).toEqual(200);
    expect(updatedAirfield).toMatchObject({ ...airfields[0], ...updatedData });
  });

  test('fails to update an airfield with invalid data', async () => {
    const invalidUpdatedData = {
      name: 'Helsinki Airport',
      maxConcurrentFlights: 0,
      eventGranularityMinutes: 25,
    };
    const res = await api.put('/api/airfields/EFHK')
      .set('Content-type', 'application/json')
      .send(invalidUpdatedData);

    const originalAirfield = await Airfield.findOne({ where: { code: 'EFHK' } });

    expect(res.status).toEqual(400);
    expect(res.body.error.message).toContain('Concurrent flights must be minimum 1');
    expect(res.body.error.message).toContain('Time must be multiple of 10');
    expect(originalAirfield).toMatchObject(airfields[0]);
  });

  test('dont create an airfield if code too short', async () => {
    const res = await api.post('/api/airfields/')
      .set('Content-type', 'application/json')
      .send({
        code: 'EFH', name: 'Malmi', maxConcurrentFlights: 2, eventGranularityMinutes: 20,
      });

    const numberOfAirfields: Number = await Airfield.count();

    expect(res.body.error.message).toContain('must be ICAO airport code');
    expect(numberOfAirfields).toEqual(airfields.length);
  });

  test('dont create an airfield if code too long', async () => {
    const res = await api.post('/api/airfields/')
      .set('Content-type', 'application/json')
      .send({
        code: 'EFHKK', name: 'Malmi', maxConcurrentFlights: 2, eventGranularityMinutes: 20,
      });

    const numberOfAirfields: Number = await Airfield.count();

    expect(res.body.error.message).toContain('must be ICAO airport code');
    expect(numberOfAirfields).toEqual(airfields.length);
  });
});
