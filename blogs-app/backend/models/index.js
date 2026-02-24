import { Blog } from './blog.js';
import { User } from './user.js';

User.hasMany(Blog);
Blog.belongsTo(User);

User.sync({ alter: true });
Blog.sync({ alter: true });

export default { Blog, User }