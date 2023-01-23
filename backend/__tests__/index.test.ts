import request from 'supertest';
import app from '@lentovaraukset/backend/src/index';

const api = request(app);

describe('basic function tests', () => {
  test('Hello world works', async () => {
    await api.get('/api').expect(200).expect('Content-Type', 'text/html; charset=utf-8');
  });
});
