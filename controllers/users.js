//const bcrypt = require('bcrypt');
const joi = require('joi');
//const jwt = require('jsonwebtoken');

const { generateError } = require('../helpers');
const { createUser } = require('../db/users');

const newUserController = async (req, res, next) => {
  try {
    const { user_name, email, password } = req.body;

    const schema = joi.object().keys({
      user_name: joi.string().min(4).max(100).required(),
      email: joi.string().email().required(),
      password: joi.string().min(6),
    });

    const validation = schema.validate({ user_name, email, password });

    if (validation.error) {
      throw generateError(
        'Nombre de usuario min. 4 caracteres, una dirección de email válida, password min. 6 caracteres',
        400
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

module.exports = {
  newUserController,
};
