import express from 'express';

const app = express();

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

export default app;
