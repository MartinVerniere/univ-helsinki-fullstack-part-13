import express from 'express';
import { authenticate } from '../util/middleware.js';

export const router = express.Router();

router.delete('/', authenticate, async (req, res) => {
	await req.session.destroy();
	res.status(204).send({ message: 'Logged off successfully!' });
})