import express, { json } from 'express';
import { PORT } from './util/config.js';
import { connectToDatabase } from './util/db.js';
import { router as blogsRuter } from './controllers/blogs.js';
import { unknownEndpoint, errorHandler } from './util/controllers.js';
import { router as usersRouter } from './controllers/users.js';
import { router as loginRouter } from './controllers/login.js';
import { router as authorsRouter } from './controllers/authors.js';
import { router as resetRouter } from './controllers/reset.js';

const app = express();
app.use(json());

app.get('/', (req, res) => { res.status(200).send('ok'); });

app.use('/api/blogs', blogsRuter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/reset', resetRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

const start = async () => {
	await connectToDatabase();
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	})
}

start();