import { Note } from './note.js';
import { User } from './user.js';

User.hasMany(Note);
Note.belongsTo(User);

Note.sync({ alter: true });
User.sync({ alter: true });

export default { Note, User }