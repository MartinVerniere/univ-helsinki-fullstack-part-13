import express from 'express';
import { sequelize } from '../util/db.js';

export const router = express.Router();

router.post('/', async (request, response) => {
	try {
		await sequelize.sync({ force: true });
		return response.status(200).json({ message: "Database emptied." });
	} catch (error) {
		console.log(error);
		return response.status(500).json({error: "Failed clearing database"})
	};
})