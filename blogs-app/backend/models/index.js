import { Blog } from './blog.js';
import { User } from './user.js';

Blog.sync();
User.sync();

export default { Blog, User }