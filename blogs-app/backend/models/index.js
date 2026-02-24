import { Blog } from './blog.js';
import { User } from './user.js';

User.hasMany(Blog);
Blog.belongsTo(User);

await User.sync({ alter: true });
await Blog.sync({ alter: true });

export default { Blog, User }