require('dotenv').config();

const express = require('express');
const app = express();

const port = process.env.PORT || 3001;

app.get('/', (req, res) => res.send('Checkity check check'));
app.get('/discord-auth', (req, res) => {
  console.log(req.query);
  res.send('Yeeep');
});

app.listen(port, () => console.log('Waiting!'));
