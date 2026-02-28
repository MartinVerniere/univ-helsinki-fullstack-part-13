import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';
import { SECRET } from './config.js';
import models from '../models/index.js';
const { User, Blog, Session } = models;

export const errorHandler = (error, req, res, next) => {
	console.error(error.message);

	if (error instanceof Sequelize.ValidationError) {
		return res.status(400).json({ error: error.message });
	}

	if (error instanceof Sequelize.DatabaseError) {
		return res.status(400).json({ error: 'malformatted data' });
	}

	next(error);
}

export const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' });
}

export const authenticate = async (req, res, next) => {
	const authorization = req.get('authorization');

	if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
		return res.status(401).json({ error: 'token missing' });
	}

	const token = authorization.substring(7);
	let decodedToken;

	try {
		decodedToken = jwt.verify(token, SECRET);
	} catch {
		return res.status(401).json({ error: 'token invalid' });
	}

	const session = await Session.findOne({ where: { token }, include: User });

	if (!session) return res.status(401).json({ error: 'error, user is not logged in' });

	if (session.user.disabled) {
		await session.destroy();
		return res.status(401).json({ error: 'error, account disabled' });
	}

	req.session = session;
	req.decodedToken = decodedToken;

	next();
}

export const isAdmin = async (req, res, next) => {
	const user = await User.findByPk(req.decodedToken.id);
	if (!user.admin) {
		return res.status(401).json({ error: 'operation not allowed' });
	}
	next();
};

export const blogFinder = async (req, res, next) => {
	try {
		const blog = await Blog.findByPk(req.params.id);
		if (blog) req.blog = blog;
		else return res.status(404).end();
		next();
	} catch (error) {
		next(error);
	}
}

export const userFinder = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.params.id);
		if (user) req.user = user;
		else return res.status(404).end();
		next();
	} catch (error) {
		next(error);
	}
}