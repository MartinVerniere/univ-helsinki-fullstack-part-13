import express from 'express'
import { Blog } from '../models/blog.js';
import { Sequelize } from 'sequelize';

export const router = express.Router();

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

export const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
}

router.get('/', async (req, res) => {
	const blogs = await Blog.findAll();
	res.json(blogs);
});

router.post('/', async (req, res) => {
	try {
		const blog = await Blog.create(req.body);
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