import express from 'express'
import { tokenExtractor } from '../util/controllers.js';
import models from '../models/index.js';
const { User, Blog } = models;

export const router = express.Router();

const blogFinder = async (req, res, next) => {
	try {
		const blog = await Blog.findByPk(req.params.id);
		if (blog) req.blog = blog;
		else return res.status(404).end();
		next();
	} catch (error) {
		next(error);
	}
}

router.get('/', async (req, res) => {
	const blogs = await Blog.findAll({
		attributes: { exclude: ['userId'] },
		include: {
			model: User,
			attributes: ['name']
		}
	});
	res.json(blogs);
});

router.post('/', tokenExtractor, async (req, res) => {
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

router.delete('/:id', blogFinder, async (req, res) => {
	if (req.blog) {
		await req.blog.destroy();
	}
	res.status(204).end();
});

router.put('/:id', blogFinder, async (req, res) => {
	if (req.blog) {
		req.blog.likes = (req.blog.likes || 0) + 1;
		await req.blog.save();
		res.json(req.blog);
	} else {
		res.status(404).end();
	}
});