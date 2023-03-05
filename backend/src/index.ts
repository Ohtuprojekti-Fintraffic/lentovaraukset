import app from './app';
import { connectToDatabase } from './util/db';
import { PORT } from './util/config';
import airfieldService from './services/airfieldService';

connectToDatabase().then(airfieldService.createTestAirfield);
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
