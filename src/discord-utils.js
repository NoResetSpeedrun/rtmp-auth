import axios from 'axios';
import FormData from 'form-data';
import hat from 'hat';

import db from './db';

require('dotenv').config();

const API_BASE = 'https://discord.com/api/v6';
const makeRedirectUri = req =>
  process.env.REDIRECT_URI || `${req.protocol}://${req.get('Host')}${req.path}`;

const exchangeToken = async req => {
  const { code } = req.query;
  const raw_data = {
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: makeRedirectUri(req),
    scope: 'identify',
  };

  const form = new FormData();

  for (const [k, v] of Object.entries(raw_data)) {
    form.append(k, v);
  }

  const response = await axios.post(`${API_BASE}/oauth2/token`, form, {
    headers: {
      ...form.getHeaders(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

const getUserInfo = async req => {
  const tokenResponse = await exchangeToken(req);
  const identityResponse = await axios.get(`${API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
  });

  const result = identityResponse.data;

  result.discordId = result.id;
  delete result.id;

  // Lowercase and remove unicode
  result.username = result.username.toLowerCase().replace(/[^\x00-\x7F]/g, '');

  return result;
};

export const storeUser = async req => {
  const userInfo = await getUserInfo(req);
  const { discordId } = userInfo;

  const existing = await db.users.findOne({ discordId });

  if (existing !== null) {
    return existing;
  }

  const newUser = await db.users.insert({ ...userInfo, token: hat() });

  return newUser;
};

export const userCanStream = async req => {
  const { name: username, token } = req.body;
  const user = await db.users.findOne({ username, token });

  // If the lookup fails, bail early
  if (!username || !token || !user) {
    return false;
  }

  const response = await axios.get(
    `${API_BASE}/guilds/${process.env.DISCORD_SERVER_ID}/members/${user.discordId}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    },
  );

  return response.data.roles.includes(process.env.STREAMER_ROLE_ID);
};
