import { DataTypes } from 'sequelize'

export async function up({ context: queryInterface }) {
	await queryInterface.createTable('users', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password_hash: {
			type: DataTypes.STRING,
			allowNull: false
		},
		admin: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		disabled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		}
	})
	await queryInterface.createTable('blogs', {
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
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'id'
			},
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		}
	})
}

export async function down({ context: queryInterface }) {
	await queryInterface.dropTable('blogs')
	await queryInterface.dropTable('users')
}