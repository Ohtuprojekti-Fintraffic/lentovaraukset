import app from './index';
import { connectToDatabase } from './util/db';
import { PORT } from './util/config';

connectToDatabase();
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
