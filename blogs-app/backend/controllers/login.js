import jwt from 'jsonwebtoken';
import express from 'express';
import { SECRET } from '../util/config.js';
import models from '../models/index.js';
import bcrypt from 'bcrypt';

const { sign } = jwt;
const { User, Session } = models;

export const router = express.Router();

router.post('/', async (request, response) => {
	const body = request.body;

	const user = await User.findOne({
		where: {
			username: body.username
		}
	});

	const passwordCorrect = user === null
		? false
		: await bcrypt.compare(body.password, user.passwordHash);

	if (!(user && passwordCorrect)) {
		return response.status(401).json({ error: 'invalid username or password' });
	}

	if (user.disabled) {
		return response.status(401).json({ error: 'account disabled, please contact admin' });
	};


	const userForToken = {
		username: user.username,
		id: user.id,
	};

	const token = sign(userForToken, SECRET);

	//const activeSession = await Session.findOne({ where: { user_id: user.id } });
	//if (activeSession) return response.status(401).json({ error: 'user already logged in' });
	await Session.create({ user_id: user.id, token: token });

	return response.status(200).send({ token, username: user.username, name: user.name });
});