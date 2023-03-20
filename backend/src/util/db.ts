import { Sequelize } from 'sequelize';
import { DATABASE_URL } from './config';

if (process.env.NODE_ENV === 'test') {
  console.log('creating an in-memory test database');
}

const sequelize = process.env.NODE_ENV === 'test'
  // this requires a conditional export so:
  // eslint-disable-next-line global-require
  ? new Sequelize({ dialect: 'postgres', dialectModule: (require('pg-mem')).newDb().adapters.createPg(), logging: false })
  : new Sequelize(DATABASE_URL as string, { dialect: 'postgres', logging: false });

const connectToDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    await sequelize.authenticate();
    console.log('database connected');
  } catch (err) {
    console.log('connecting database failed. error:', err);
    return process.exit(1);
  }

  return null;
};

export { connectToDatabase, sequelize };
