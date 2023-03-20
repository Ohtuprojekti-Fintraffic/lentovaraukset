import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log(process.env);

if (process.env.NODE_ENV !== 'test' && (process.env.DATABASE_URL === undefined || typeof process.env.DATABASE_URL !== 'string')) {
  throw new Error('Missing key DATABASE_URL in .env');
}

const { DATABASE_URL } = process.env;
const { SECRET } = process.env;
const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 8080;

export { DATABASE_URL, SECRET, PORT };
