const bcrypt = require('bcrypt');
const joi = require('joi');
const jwt = require('jsonwebtoken');

const { generateError, processAndSaveImage } = require('../helpers');
const { createUser, getUserByEmail, getUserById } = require('../db/users');
const { getConnection } = require('../db/db');

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
      throw generateError(validation.error, 400);
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

    const validation = await schema.validateAsync({ email, password });

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
    const payload = { id: user.id };

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

/* TODO: */ const updateUserProfile = async (req, res, next) => {
  let connection;

  try {
    connection = await getConnection();

    const { id } = req.params;
    const { name, bio } = req.body;

    const [currentUser] = await connection.query(
      `
      SELECT id, name, bio, profile_image
      FROM users
      WHERE id=?
      `,
      [id]
    );

    console.log(id, getUserById);

    if (id !== getUserById) {
      throw generateError('No tienes permisos para editar este usuario', 403);
    }

    if (currentUser.length === 0) {
      throw generateError(`El usuario con id ${id} no existe`, 404);
    }

    let updatedProfileImage;

    if (req.files) {
      try {
        // Procesar y guardar imagen
        updatedProfileImage = await processAndSaveImage(req.files.image);
      } catch (error) {
        throw generateError(
          'No se pudo procesar la imagen. Inténtalo de nuevo',
          400
        );
      }
    }

    const updatedName = name;
    const updatedBio = bio;
    const schema = joi.object().keys({
      updatedName: joi
        .string()
        .min(10)
        .max(100)
        .error(generateError('Nombre (mín. 10 , máx. 100 caracteres', 400)),
      updatedBio: joi
        .string()
        .max(500)
        .error(generateError('Bio (máx. 500 caracteres', 400)),
    });

    const validation = await schema.validateAsync({
      updatedName,
      updatedBio,
    });

    if (validation.error) {
      res.send({
        status: 'Error',
        message: 'Datos introducidos incorrectos',
      });
    }
    try {
      await connection.query(
        `
      UPDATE users SET name = ?, bio = ?, profile_image = ?
      WHERE id = ?;
      `,
        [updatedName, updatedBio, updatedProfileImage, id]
      );
    } catch (err) {
      throw generateError('Error en la base de datos', 500);
    } finally {
      if (connection) connection.release();
    }
    res.send({
      status: 'ok',
      message: `Perfil actualizado correctamente`,
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  newUserController,
  loginController,
  updateUserProfile,
};
