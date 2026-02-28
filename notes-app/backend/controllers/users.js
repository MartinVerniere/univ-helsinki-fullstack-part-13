import express from 'express';
import models from '../models/index.js';
import { isAdmin, tokenExtractor } from '../util/middleware.js';
import { Team } from '../models/team.js';
const { User, Note } = models;

export const router = express.Router();

router.get('/', async (req, res) => {
	const users = await User.scope().findAll({ //Add scopes if want to filter
		include: [
			{
				model: Note,
				attributes: { exclude: ['userId'] }
			},
			{
				model: Note,
				as: 'marked_notes',
				attributes: { exclude: ['userId'] },
				through: {
					attributes: []
				},
				include: {
					model: User,
					attributes: ['name']
				}
			},
			{
				model: Team,
				attributes: ['name', 'id'],
				through: {
					attributes: []
				}
			}
		]
	});
	res.json(users);
});

router.post('/', async (req, res) => {
	try {
		const user = await User.create(req.body);
		res.json(user);
	} catch (error) {
		return res.status(400).json({ error });
	}
});

router.get('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id, {
		attributes: { exclude: [''] },
		include: [{
			model: Note,
			attributes: { exclude: ['userId'] }
		},
		{
			model: Note,
			as: 'marked_notes',
			attributes: { exclude: ['userId'] },
			through: {
				attributes: []
			},
			include: {
				model: User,
				attributes: ['name']
			}
		}
		]
	});

	if (!user) return res.status(404).end();

	let teams = undefined;
	if (req.query.teams) {
		teams = await user.getTeams({
			attributes: ['name', 'id'],
			joinTableAttributes: []
		});
	}

	res.json({ ...user.toJSON(), teams });
});

router.put('/:username', tokenExtractor, isAdmin, async (req, res) => {
	const user = await User.findOne({
		where: {
			username: req.params.username
		}
	});

	if (user) {
		user.disabled = req.body.disabled;
		await user.save();
		res.json(user);
	} else {
		res.status(404).end();
	}
});