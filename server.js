require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const port = 8888;
const { getNews, createNew } = require('./news');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//endpoints NEWS
app.get('/', getNews);
app.post('/', createNew);

app.listen(port, () => {
  console.log(`APP listening on port ${port}`);
});
