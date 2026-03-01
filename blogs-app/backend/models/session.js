import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../util/db.js';

export class Session extends Model { };

Session.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	user_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: { model: 'users', key: 'id' },
	},
	token: {
		type: DataTypes.STRING,
		allowNull: false,
		//unique: true,
	},
}, {
	sequelize,
	underscored: true,
	timestamps: true,
	modelName: 'session'
});