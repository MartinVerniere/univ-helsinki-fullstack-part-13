import { Blog } from './blog.js';
import { User } from './user.js';

User.hasMany(Blog);
Blog.belongsTo(User);

export const syncModels = async () => {
	await User.sync({ alter: true });
	await Blog.sync({ alter: true });
};

export default { Blog, User }