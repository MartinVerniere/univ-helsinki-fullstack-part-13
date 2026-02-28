import express from 'express'
import models from '../models/index.js';
import Sequelize from 'sequelize';

const { Blog } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	let order = {};
	let group = {};
	let attributes = {};

	order = [['likes', 'DESC']];
	group = ['author'];
	attributes = [
		'author',
		[Sequelize.fn('COUNT', Sequelize.col('blog.id')), 'blogs'],
		[Sequelize.fn('SUM', Sequelize.col('blog.likes')), 'likes']
	]

	const blogs = await Blog.findAll({
		attributes,
		group,
		order
	});
	res.status(200).json(blogs);
});