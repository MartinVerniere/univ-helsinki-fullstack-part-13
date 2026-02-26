import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../util/db.js';

export class Blog extends Model { };

Blog.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	author: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	url: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	title: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	likes: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	},
	date: {
		type: DataTypes.TIME
	},
	year_written: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min: {
				args: 1991,
				msg: 'Invalid year - cant be earlier than 1991',
			},
			max: {
				args: new Date().getFullYear(),
				msg: 'Invalid year - cant be later than current year',
			},
		},
	},
}, {
	sequelize,
	underscored: true,
	timestamps: true,
	modelName: 'blog'
});