import { DataTypes } from 'sequelize'

export async function up({ context: queryInterface }) {
	await queryInterface.createTable('sessions', {
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
			unique: true
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false
		}
	});
}

export async function down({ context: queryInterface }) {
	await queryInterface.dropTable('session');
}
