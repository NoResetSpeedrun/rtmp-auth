import express from 'express';
import URLSearchParams from '@ungap/url-search-params';

import { storeUser, userCanStream } from './discord-utils';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/discord-auth', async (req, res) => {
  try {
    const user = await storeUser(req);
    const queryParams = new URLSearchParams({ stream_key: `${user.username}?token=${user.token}` });
    const hostname = req.headers['x-forwarded-host'];
    const response = {
      'localhost' : 'http://localhost:3000/api/v1/user/discord/link', 
      'dev.noreset.tv' : 'https://dev.noreset.tv/api/v1/user/discord/link',
      'noreset.tv' : 'https://noreset.tv/api/v1/user/discord/link',
      'noresetspeed.run' : 'http://www.noresetspeed.run/en/profile/discord',
    }
    console.log({hostname});
    console.log('Response hostname : ', response[hostname]);
    if(response[hostname]){
      res.redirect(`${response[hostname]}?${queryParams.toString()}`);
    }else{
      res.redirect(`https://error.noreset.tv/`);
    }
    
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
  } catch (e) {
    console.log(e);
    return fail();
  }

  res.send('');
});

app.listen(port);
