import express from 'express';
import { authenticate } from '../util/middleware.js';
import models from '../models/index.js';

const { Session } = models;

export const router = express.Router();

router.delete('/', authenticate, async (req, res) => {
	await Session.destroy({ where: { user_id: req.session.user_id } });
	res.status(204).send({ message: 'Logged off successfully!' });
})