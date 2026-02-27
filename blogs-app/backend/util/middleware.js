import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';
import { SECRET } from './config.js';
import models from '../models/index.js';
const { User, Blog } = models;

export const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error instanceof Sequelize.ValidationError) {
		return response.status(400).json({ error: error.message });
	}

	if (error instanceof Sequelize.DatabaseError) {
		return response.status(400).json({ error: 'malformatted data' });
	}

	next(error);
}

export const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
}

export const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization');
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		try {
			req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
		} catch {
			return res.status(401).json({ error: 'token invalid' });
		}
	} else {
		return res.status(401).json({ error: 'token missing' });
	}
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

