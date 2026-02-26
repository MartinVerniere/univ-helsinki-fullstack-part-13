import { Note } from './note.js';
import { User } from './user.js';
import { Team } from './team.js';
import { Membership } from './membership.js';

User.hasMany(Note);
Note.belongsTo(User);

User.belongsToMany(Team, { through: Membership })
Team.belongsToMany(User, { through: Membership })

export default { Note, User, Team, Membership }