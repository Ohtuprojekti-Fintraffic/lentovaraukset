import express from 'express';
import cors from 'cors';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './auth/passport';
import timeslotRouter from './routes/timeslots';
import reservationRouter from './routes/reservations';
import airfieldRouter from './routes/airfields';
import configurationRouter from './routes/configurations';
import { errorHandler, airfieldExtractor, notFoundHandler } from './util/middleware';
import { Airfield } from './models';
import authRouter from './routes/auth';

const app = express();

// Not sure if this is the right place for t  s.
// But this extends the express request to allow for custom keys
// like req.airfield
declare global {
  namespace Express {
    interface Request {
      airfield: Airfield | null
    }
  }

}
app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use(expressSession({
  secret: process.env.EXPRESS_SESSION_SECRET!,
  resave: true,
  saveUninitialized: false,
}));
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api', async (_req: any, res: express.Response) => {
  res.send('Hello World');
});

app.use('/api/auth', authRouter);

app.use('/api/:airfieldCode/*', airfieldExtractor);
app.use('/api/:airfieldCode/reservations', reservationRouter);
app.use('/api/:airfieldCode/timeslots', timeslotRouter);
app.use('/api/airfields', airfieldRouter);
app.use('/api/configurations', configurationRouter);

app.use(errorHandler);
app.use('*', notFoundHandler);

app.use('/', express.static('front_dist'));

export default app;
