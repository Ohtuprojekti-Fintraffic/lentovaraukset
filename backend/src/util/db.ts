import { Sequelize } from 'sequelize';
import { newDb } from 'pg-mem';
import { DATABASE_URL } from './config';
// eslint-disable-next-line import/no-cycle
import { Airfield } from '../models';

if (process.env.NODE_ENV === 'test') {
  console.log('creating an in-memory test database');
}

const createTestAirfield = () => {
  // TODO: Remove this when we have a proper admin interface for creating airfields
  Airfield.upsert({
    id: 1,
    name: 'Test Airfield',
    maxConcurrentFlights: 3,
    eventGranularityMinutes: 20,
  });
};

const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize({ dialect: 'postgres', dialectModule: newDb().adapters.createPg(), logging: false })
  : new Sequelize(DATABASE_URL as string, { dialect: 'postgres', logging: false });

const connectToDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    await sequelize.authenticate();
    console.log('database connected');
    createTestAirfield();
  } catch (err) {
    console.log('connecting database failed. error:', err);
    return process.exit(1);
  }

  return null;
};

export { connectToDatabase, sequelize };
