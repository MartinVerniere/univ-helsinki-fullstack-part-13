import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';
import { SECRET } from './config.js';

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