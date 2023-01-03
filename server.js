require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const port = 8888;
const { getnews, createNew } = require('./news');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//endpoints NEWS
app.get('/', getnews);
app.post('/', createNew);

app.listen(port, () => {
  console.log(`APP listening on port ${port}`);
});
