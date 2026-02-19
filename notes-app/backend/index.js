import dotenv from 'dotenv';
dotenv.config();
import { Sequelize, Model, DataTypes } from 'sequelize';
import express from 'express';

const app = express();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialectOptions: { ssl: false },
});

app.use(express.json());

class Note extends Model { }
Note.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	content: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	important: {
		type: DataTypes.BOOLEAN
	},
	date: {
		type: DataTypes.DATE
	}
}, {
	sequelize,
	underscored: true,
	timestamps: false,
	modelName: 'note'
});

Note.sync();

app.get('/api/notes', async (req, res) => {
	const notes = await Note.findAll();
	res.json(notes);
});

app.post('/api/notes', async (req, res) => {
	try {
		const note = await Note.create(req.body);
		return res.json(note);
	} catch (error) {
		return res.status(400).json({ error });
	}
});

app.get('/api/notes/:id', async (req, res) => {
	const note = await Note.findByPk(req.params.id);
	if (note) {
		res.json(note);
	} else {
		res.status(404).end();
	}
})

app.put('/api/notes/:id', async (req, res) => {
	const note = await Note.findByPk(req.params.id);
	if (note) {
		note.important = req.body.important;
		await note.save();
		res.json(note);
	} else {
		res.status(404).end();
	}
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});