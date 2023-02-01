import { Sequelize } from 'sequelize';
import { newDb } from 'pg-mem';
import { DATABASE_URL } from './config';

if (process.env.NODE_ENV === 'test') {
  console.log('creating an in-memory test database');
}

const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize({ dialect: 'postgres', dialectModule: newDb().adapters.createPg(), logging: false })
  : new Sequelize(DATABASE_URL as string, { dialect: 'postgres' });

const connectToDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    await sequelize.authenticate();
    console.log('database connected');
  } catch (err) {
    console.log('connecting database failed');
    return process.exit(1);
  }

  return null;
};

export { connectToDatabase, sequelize };
