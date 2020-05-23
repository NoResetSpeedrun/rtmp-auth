import express from 'express';
import { storeUser, userCanStream } from './discord-utils';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/discord-auth', async (req, res) => {
  try {
    const user = await storeUser(req);
    res.send(`rtmp://rtmp.noresetspeed.run/stream/${user.username}?token=${user.token}`);
  } catch (e) {
    console.log(e);
    res.status(500).send('Invalid request');
  }
});

app.post('/check', async (req, res) => {
  const fail = () => res.status(404).send('');

  try {
    const result = await userCanStream(req);

    if (!result) {
      return fail();
    }
  } catch {
    return fail();
  }

  res.send('');
});

app.listen(port);
