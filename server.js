require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
//const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const port = 8888;
const { getNews, createNew } = require('./news');
const app = express();

const { newUserController, loginController } = require('./controllers/users');

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//endpoints NEWS
app.get('/', getNews);
app.post('/', createNew);

//Rutas de usuario
app.post('/user', newUserController);
app.post('/login', loginController);

//Middleware que gestiona las rutas que no pasan por ninguna ruta definida
app.use((req, res) => {
  res.status(404).send({
    status: 'error',
    message: 'Not found',
  });
});

//Middleware de gestión de errores
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatus || 500).send({
    status: 'error',
    message: error.message,
  });
});


//Levantando el server
app.listen(port, () => {
  console.log(`APP listening on port ${port}`);
});
