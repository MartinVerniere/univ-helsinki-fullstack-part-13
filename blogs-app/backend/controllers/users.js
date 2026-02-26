import express from 'express';
import bcrypt from 'bcrypt';
import models from '../models/index.js';
import { isAdmin, tokenExtractor } from '../util/middleware.js';
const { User, Blog } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	const users = await User.findAll({
		include: {
			model: Blog,
			attributes: {
				exclude: ['userId']
			}
		}
	});
	res.json(users);
});

router.post('/', async (req, res) => {
	try {
		const { username, name, password, admin, disabled } = req.body;
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ username, name, passwordHash, admin, disabled });
		res.json(user);
	} catch (error) {
		return res.status(400).json({ error });
	}
});

router.put('/:username', tokenExtractor, isAdmin, async (req, res) => {
	const user = await User.findOne({ where: { username: req.params.username } });
	if (user) {
		user.name = req.body.name;
		await user.save();
		res.json(user);
	} else {
		res.status(404).end();
	}
});