import express from "express";

const port = process.env.PORT || 8080;

const app = express();

app.get("/", async (_req: any, res: express.Response) => {
  res.send("Hello World");
});

app.listen(port, () =>
  console.log(`Server is running on port: ${port}`)
);
