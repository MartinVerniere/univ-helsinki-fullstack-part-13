import express, { json } from 'express';
import { PORT } from './util/config.js';
import { connectToDatabase } from './util/db.js';
import { router as notesRouter } from './controllers/notes.js';
import { router as usersRouter } from './controllers/users.js';
import { router as loginRouter } from './controllers/login.js';

const app = express();
app.use(json());

app.use('/api/notes', notesRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

const start = async () => {
	await connectToDatabase();
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

start();