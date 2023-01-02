const express = require('express');
const bodyParser = require('body-parser');
const port = 8888;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
