import express from 'express';
import models from '../models/index.js';
import { isAdmin, tokenExtractor } from '../util/middleware.js';
const { User, Note } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	const users = await User.findAll({
		include: {
			model: Note,
			attributes: {
				exclude: ['userId']
			}
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

router.put('/:username', tokenExtractor, isAdmin, async (req, res) => {
	const user = await User.findOne({
		where: {
			username: req.params.username
		}
	})

	if (user) {
		user.disabled = req.body.disabled
		await user.save()
		res.json(user)
	} else {
		res.status(404).end()
	}
})