import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Configuration } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';

jest.mock('@lentovaraukset/backend/src/auth/passport.ts');

const api = request(app);

const configurations = [
  {
    id: 1, daysToStart: 1, maxDaysInFuture: 7, createdAt: new Date('2023-02-12T08:00:00.000Z'), updatedAt: new Date('2023-02-12T08:00:00.000Z'),
  },
];

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
  await Configuration.bulkCreate(configurations);
});

afterAll(async () => {
  // otherwise Jest needs --forceExit
  await sequelize.close();
});

describe('Calls to api', () => {
  test('can update a configuration', async () => {
    const res = await api.put('/api/configurations/1')
      .set('Content-type', 'application/json')
      .send({
        daysToStart: 2, maxDaysInFuture: 5,
      });

    const createdConfiguration: Configuration | null = await Configuration.findOne(
      { where: { id: 1 } },
    );
    const numberOfConfigurations: Number = await Configuration.count();

    expect(res.status).toEqual(200);
    expect(numberOfConfigurations).toEqual(configurations.length);
    expect(createdConfiguration).not.toEqual(null);
    expect(createdConfiguration?.dataValues.maxDaysInFuture).toEqual(5);
  });

  test('do not update configuration if fields empty', async () => {
    const res = await api.put('/api/configurations/1')
      .set('Content-type', 'application/json')
      .send();

    const numberOfConfigurations: Number = await Configuration.count();

    expect(res.status).toEqual(400);
    expect(res.body.error.message).toContain('Expected number');
    expect(numberOfConfigurations).toEqual(configurations.length);
  });

  test('can get configuration', async () => {
    const res = await api.get('/api/configurations/1');

    expect(res.status).toEqual(200);
    expect(res.body.daysToStart).toEqual(1);
    expect(res.body.maxDaysInFuture).toEqual(7);
    expect(res.body.createdAt).toEqual('2023-02-12T08:00:00.000Z');
  });
});
