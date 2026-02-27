import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../util/db.js'

export class UserNotes extends Model { }

UserNotes.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	userId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: { model: 'users', key: 'id' },
	},
	noteId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: { model: 'notes', key: 'id' },
	},
}, {
	sequelize,
	underscored: true,
	timestamps: false,
	modelName: 'user_notes'
});