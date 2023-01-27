import express from 'express';

const port = process.env.PORT || 8080;

const app = express();

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

app.get('/api/get/timeslot/:start/:end', async (req: express.Request, res: express.Response) => {
  const { start: startTime, end: endTime } = req.params;

  res.send(`${startTime} ${endTime}`);
  console.log(`${startTime} ${endTime}`);
});

// This is why Jest needs forceExit. Should be in a wrapper and not here
app.listen(port, () => console.log(`Server is running on port: ${port}`));

export default app;
