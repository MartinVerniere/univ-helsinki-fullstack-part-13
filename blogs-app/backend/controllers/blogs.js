import express from 'express'
import models from '../models/index.js';
import { Op } from 'sequelize';
import { authenticate, blogFinder } from '../util/middleware.js';

const { User, Blog } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	let where = {};
	let order = {};

	if (req.query.search) {
		where = {
			[Op.or]: [
				{ title: { [Op.iLike]: `%${req.query.search}%` } },
				{ author: { [Op.iLike]: `%${req.query.search}%` } }
			]
		}
	}

	order = [['likes', 'DESC']];

	const blogs = await Blog.findAll({
		attributes: { exclude: ['userId'] },
		include: {
			model: User,
			attributes: ['name']
		},
		where,
		order
	});
	res.json(blogs);
});

router.post('/', authenticate, async (req, res) => {
	try {
		const user = await User.findByPk(req.decodedToken.id);
		const blog = await Blog.create({ ...req.body, userId: user.id })
		res.json(blog);
	} catch (error) {
		return res.status(400).json({ error });
	}
});

router.get('/:id', blogFinder, async (req, res) => {
	if (req.blog) {
		res.json(req.blog);
	} else {
		res.status(404).end();
	}
});

router.delete('/:id', authenticate, blogFinder, async (req, res) => {
	if (req.blog) {
		if (req.decodedToken.id === req.blog.userId) { // If associated token from request is the same as the user id inside the blog object, its same user
			await req.blog.destroy();
		} else {
			return res.status(403).json({ error: "Can't delete a blog created by another user." });
		}
	}
	res.status(204).end();
});

router.put('/:id', blogFinder, async (req, res) => {
	if (req.blog) {
		await req.blog.update(req.body);
		res.status(200).json(req.blog);
	} else {
		res.status(404).end();
	}
});