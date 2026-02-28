import { Blog } from './blog.js';
import { ReadingList } from './readingList.js';
import { User } from './user.js';
import { Session } from './session.js';

User.hasMany(Blog);
Blog.belongsTo(User);

User.belongsToMany(Blog, { through: ReadingList, as: 'user_reading_list' })
Blog.belongsToMany(User, { through: ReadingList, as: 'readers' })

User.hasOne(Session);
Session.belongsTo(User);

export default { Blog, User, ReadingList, Session }