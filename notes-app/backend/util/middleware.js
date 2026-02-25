import jwt from 'jsonwebtoken';
import { SECRET } from '../util/config.js';
import models from '../models/index.js';

const { User, Note } = models;

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
	const user = await User.findByPk(req.decodedToken.id)
	if (!user.admin) {
		return res.status(401).json({ error: 'operation not allowed' });
	}
	next();
};

export const noteFinder = async (req, res, next) => {
	req.note = await Note.findByPk(req.params.id);
	next();
}