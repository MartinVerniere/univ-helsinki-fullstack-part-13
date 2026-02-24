import { Blog } from './blog.js';
import { User } from './user.js';

User.hasMany(Blog);
Blog.belongsTo(User);

Blog.sync({ alter: true });
User.sync({ alter: true });

export default { Blog, User }