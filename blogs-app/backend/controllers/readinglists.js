import express from 'express';
import models from '../models/index.js';
import { authenticate } from '../util/middleware.js';

const { Blog, User, ReadingList } = models;

export const router = express.Router();

const findBlogAndUser = async (req, res, next) => {
	try {
		const blogId = req.body.blogId;
		const userId = req.body.userId;

		if (!blogId || !userId) return res.status(400).json({ message: "missing arguments" });

		const blog = await Blog.findByPk(blogId);
		const user = await User.findByPk(userId);

		if (!blog) return res.status(404).json({ message: "Couldn't find the specified blog" });
		if (!user) return res.status(404).json({ message: "Couldn't find the specified user" });

		req.blog = blog;
		req.user = user;

		next();
	} catch (error) {
		next(error);
	}
};

router.get('/', async (req, res) => {
	const readingListEntries = await ReadingList.findAll();
	return res.status(200).json(readingListEntries);
});

router.post('/', findBlogAndUser, async (req, res) => {
	try {
		const alreadyExists = await ReadingList.findOne({ where: { userId: req.user.id, blogId: req.blog.id } });
		if (alreadyExists) return res.status(400).json({ error: 'Blog already added to reading list' });

		await req.user.addUser_reading_list(req.blog);

		//Get last entry added
		const newEntry = await ReadingList.findOne({ where: { userId: req.user.id, blogId: req.blog.id } });

		return res.status(201).json({
			message: "Blog added to reading list",
			id: newEntry.id,
			user_id: newEntry.userId,
			blog_id: newEntry.blogId,
			read: newEntry.read
		});
	} catch (error) {
		return res.status(400).json({ error });
	}
});

router.put('/:id', authenticate, async (req, res) => {
	try {
		const user = await User.findByPk(req.decodedToken.id);
		if (!user) return res.status(404).json({ error: 'User not found' });

		const readingListEntry = await ReadingList.findByPk(req.params.id);
		if (!readingListEntry) return res.status(404).json({ message: "Couldn't find entry in reading list" });

		if (readingListEntry.userId !== user.id) return res.status(401).json({ message: "Can't mark as read entry in blog list of another user" });

		readingListEntry.read = req.body.read;
		await readingListEntry.save();

		res.status(200).json(readingListEntry);
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
});