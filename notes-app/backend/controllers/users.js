import express from 'express';
import models from '../models/index.js';
const { User, Note } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	const users = await User.findAll({
		include: {
			model: Note
		}
	});
	res.json(users);
})

router.post('/', async (req, res) => {
	try {
		const user = await User.create(req.body);
		res.json(user);
	} catch (error) {
		return res.status(400).json({ error });
	}
})

router.get('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (user) {
		res.json(user);
	} else {
		res.status(404).end();
	}
})