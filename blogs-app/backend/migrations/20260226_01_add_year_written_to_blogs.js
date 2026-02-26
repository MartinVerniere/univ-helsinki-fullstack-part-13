import { DataTypes } from 'sequelize'

export async function up({ context: queryInterface }) {
	await queryInterface.addColumn('blogs', 'year_written', {
		type: DataTypes.INTEGER,
		defaultValue: new Date().getFullYear(),
	});
}

export async function down({ context: queryInterface }) {
	await queryInterface.removeColumn('blogs', 'year_written');
}
