import express from 'express'
import models from '../models/index.js';
import jwt from 'jsonwebtoken';
import { SECRET } from '../util/config.js';
const { User, Note } = models;

export const router = express.Router();

const tokenExtractor = (req, res, next) => {
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

router.get('/', async (req, res) => {
	const notes = await Note.findAll({
		attributes: { exclude: ['userId'] },
		include: {
			model: User,
			attributes: ['name']
		}
	});
	res.json(notes);
})

router.post('/', tokenExtractor, async (req, res) => {
	try {
		const user = await User.findByPk(req.decodedToken.id);
		const note = await Note.create({ ...req.body, date: new Date(), userId: user.id });
		res.json(note);
	} catch (error) {
		return res.status(400).json({ error });
	}
});

const noteFinder = async (req, res, next) => {
	req.note = await Note.findByPk(req.params.id);
	next();
}

router.get('/:id', noteFinder, async (req, res) => {
	if (req.note) {
		res.json(req.note);
	} else {
		res.status(404).end();
	}
});

router.delete('/:id', noteFinder, async (req, res) => {
	if (req.note) {
		await req.note.destroy();
	}
	res.status(204).end();
});

router.put('/:id', noteFinder, async (req, res) => {
	if (req.note) {
		req.note.important = req.body.important;
		await req.note.save();
		res.json(req.note);
	} else {
		res.status(404).end();
	}
});