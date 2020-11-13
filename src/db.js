import Datastore from 'nedb-promises';

const db = {};

db.users = Datastore.create('users.db');
db.permAuth = Datastore.create('permauth.db');

db.users.ensureIndex({ fieldName: 'token' });
db.users.ensureIndex({ fieldName: 'discordId' });
db.users.ensureIndex({ fieldName: 'username' });

for (const database of Object.values(db)) {
  database.persistence.setAutocompactionInterval(5000);
}

export default db;
