import express from 'express';
import models from '../models/index.js';

const { Session } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	const sessionEntries = await Session.findAll();
	res.json(sessionEntries);
});