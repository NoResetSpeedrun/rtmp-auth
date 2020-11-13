import db from './db';
import hat from 'hat';

db.permAuth.insert({ username: process.argv[process.argv.length - 1], token: hat() });
