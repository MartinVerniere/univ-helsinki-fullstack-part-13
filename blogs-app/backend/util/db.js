import Sequelize from 'sequelize';
import { DATABASE_URL } from './config.js';
import { syncModels } from '../models/index.js';

export const sequelize = new Sequelize(DATABASE_URL);

export const connectToDatabase = async () => {
  try {
	await sequelize.authenticate();
	console.log('connected to the database');
	await syncModels(); 
  } catch (err) {
	console.log('failed to connect to the database');
	return process.exit(1);
  }

  return null;
}