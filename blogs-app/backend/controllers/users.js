import express from 'express';
import bcrypt from 'bcrypt';
import models from '../models/index.js';
import { authenticate, isAdmin, userFinder } from '../util/middleware.js';
const { User, Blog } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	const users = await User.findAll({
		attributes: { exclude: ['passwordHash'] },
		include: [
			{
				model: Blog,
				attributes: { exclude: ['userId'] }
			},
			{
				model: Blog,
				as: 'user_reading_list',
				attributes: ['id', 'url', 'title', 'author', 'likes', 'year_written'],
				through: {
					attributes: ['read']
				},
			}
		],
	});
	res.status(200).json(users);
});

router.get('/:id', userFinder, async (req, res) => {
	let where = {};

	if (req.query.read) { where.read = req.query.read === "true" }

	const users = await User.findByPk(req.user.id, {
		attributes: { exclude: ['passwordHash'] },
		include: [
			{
				model: Blog,
				attributes: { exclude: ['userId'] }
			},
			{
				model: Blog,
				as: 'user_reading_list',
				attributes: ['id', 'url', 'title', 'author', 'likes', 'year_written'],
				through: {
					attributes: ['id', 'read'],
					where
				},
			}
		],
	});
	res.status(200).json(users);
});

router.post('/', async (req, res) => {
	try {
		const { username, name, password, admin, disabled } = req.body;
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ username, name, passwordHash, admin, disabled });
		res.status(200).json(user);
	} catch (error) {
		return res.status(400).json({ error });
	}
});

router.put('/:username', authenticate, isAdmin, async (req, res) => {
	const user = await User.findOne({ where: { username: req.params.username } });
	if (user) {
		user.name = req.body.name;
		await user.save();
		res.status(200).json(user);
	} else {
		res.status(404).end();
	}
});