import request from 'supertest';
import app from '@lentovaraukset/backend/src/app';
import { Timeslot } from '@lentovaraukset/backend/src/models';
import { connectToDatabase, sequelize } from '../src/util/db';

const api = request(app);

// https://github.com/sequelize/sequelize/issues/14807
// Workaround for a bug that makes Sequalize errors not
// print in Jest:
// try {
//   await somethingSequalizeThatErrors();
// } catch (e) {
//   if (e instanceof Error) {
//     console.log(e.message);
//     throw e;
//   }
// }

beforeAll(async () => {
  try {
    await connectToDatabase();
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      throw e;
    }
  }
});

beforeEach(async () => {
  // wipe db before each test
  await sequelize.truncate({ cascade: true });
});

afterAll(async () => {
  // otherwise Jest needs --forceExit
  await sequelize.close();
});
describe('basic function tests', () => {
  // some very simple example tests:

  test('Hello world works', async () => {
    await api.get('/api').expect(200).expect('Content-Type', 'text/html; charset=utf-8');
  });

  test('Adding timeslot just to db works', async () => {
    const date = new Date();
    await Timeslot.create({ start: date, end: date });

    // temporarily any. Models don't have types defined yet
    const slot: any = await Timeslot.findOne();
    expect(slot).toBeDefined();
    // TODO: TS tyypit modeleille
    expect(slot.start).toStrictEqual(date);
  });

  test('No timeslot exists without adding one', async () => {
    const user = await Timeslot.findOne();
    expect(user).toBeNull();
  });
});
