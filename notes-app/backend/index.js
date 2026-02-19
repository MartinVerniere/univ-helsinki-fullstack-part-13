import express, { json } from 'express';
import { PORT } from './util/config.js';
import { connectToDatabase } from './util/db.js';
import { router as notesRouter } from './controllers/notes.js';

const app = express();
app.use(json());
app.use('/api/notes', notesRouter);

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
}

start();