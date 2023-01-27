import { Sequelize } from 'sequelize';
import { DATABASE_URL } from './config';

// const DATABASE_URL = 'postgres://turtvaiz@localhost:5432/turtvaiz';
// console.log('HELP', asd);
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
  } catch (err) {
    console.log('connecting database failed');
    return process.exit(1);
  }

  return null;
};

export { connectToDatabase, sequelize };
