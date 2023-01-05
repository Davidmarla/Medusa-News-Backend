require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { authUser } = require('./middlewares/auth');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const port = 8888;
const {
  getNewsController,
  createNewController,
  getSingleNewController,
  deleteNewController,
  updateNewController,
} = require('./controllers/news');
const app = express();

const {
  newUserController,
  loginController,
  updateUserProfile,
} = require('./controllers/users');

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(fileUpload());
app.use('./images', express.static('./images'));

//endpoints NEWS
app.get('/', getNewsController);
app.post('/', authUser, createNewController);
app.get('/new/:id', getSingleNewController);
app.delete('/new/:id', authUser, deleteNewController);
app.put('/new/:id', authUser, updateNewController);

//Endpoints de usuario
app.post('/user', newUserController);
app.post('/login', loginController);
app.put('/profile/:id', authUser, updateUserProfile);

//Middleware que gestiona rutas no definidas
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
