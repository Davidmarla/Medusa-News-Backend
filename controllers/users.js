const bcrypt = require('bcrypt');
const joi = require('joi');
const jwt = require('jsonwebtoken');

const { generateError } = require('../helpers');
const { createUser, getUserByEmail } = require('../db/users');

const newUserController = async (req, res, next) => {
  try {
    const { user_name, email, password } = req.body;

    const schema = joi.object().keys({
      user_name: joi.string().min(4).max(100).required(),
      email: joi.string().email().required(),
      password: joi.string().min(6),
    });

    const validation = await schema.validateAsync({
      user_name,
      email,
      password,
    });

    if (validation.error) {
      throw generateError(
        validation.error,
        /* 'Nombre de usuario min. 4 caracteres, una dirección de email válida, password min. 6 caracteres' */ 400
      );
    }

    const id = await createUser(user_name, email, password);
    console.log(id);

    res.send({
      status: 'ok',
      message: `User created with id: ${id}`,
    });
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Se valida el email y password
    const schema = joi.object().keys({
      email: joi.string().email().required(),
      password: joi.string().min(6),
    });

    const validation = schema.validate({ email, password });

    if (validation.error) {
      throw generateError('Email o password incorrectos', 400);
    }

    //Recojo los datos de la BD del usuario con ese email
    const user = await getUserByEmail(email);

    //Compruebo que las contraseñas coinciden
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw generateError('La contraseña no coincide', 401);
    }

    //Creo el payload del token
    const payload = {
      id: user.id,
    };

    //Firmo el token, válido por 30 días
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: '30d',
    });

    //Envío el token
    res.send({
      status: 'ok',
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

/* TODO: const updateUserProfile = async (req, res, next) => {}; */

module.exports = {
  newUserController,
  loginController,
  /* updateUserProfile, */
};
