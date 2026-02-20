import { Note } from './note.js';
import { User } from './user.js';

Note.sync();
User.sync();

export default { Note, User }