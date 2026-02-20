import express, { json } from 'express';
import { PORT } from './util/config.js';
import { connectToDatabase } from './util/db.js';
import { router as blogsRuter } from './controllers/blogs.js';
import { unknownEndpoint, errorHandler } from './controllers/blogs.js';
import { router as usersRouter } from './controllers/users.js';
import { router as loginRouter } from './controllers/login.js';

const app = express();
app.use(json());

app.use('/api/blogs', blogsRuter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
}

start();