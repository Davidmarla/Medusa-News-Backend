const joi = require('joi');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');

const { getConnection } = require('../db/db');

const { generateError, createPathIfNotExists } = require('../helpers');
const {
  getNewById,
  getDeleteNewById,
  createNew,
  getNews,
} = require('../db/news');

const getNewsController = async (req, res, next) => {
  try {
    const news = await getNews();

    res.send({
      status: 'ok',
      data: news,
    });
  } catch (err) {
    next(err);
  }
};

const createNewController = async (req, res, next) => {
  try {
    const { title, subject, body } = req.body;
    const userId = req.userId;
    const schema = joi.object().keys({
      title: joi.string().max(150).required(),
      subject: joi.string().max(25).required(),
      body: joi.string().required(),
    });

    const validation = await schema.validateAsync({
      title,
      subject,
      body,
    });

    if (validation.error) {
      res.status(500).send(validation.error);
    }
    //IMAGE
    let imageFileName;

    if (req.files && req.files.image) {
      const imagesDir = path.join(__dirname, '../images');

      await createPathIfNotExists(imagesDir);

      const image = sharp(req.files.image.data);
      image.resize(1000);

      imageFileName = `${nanoid(30)}.jpg`;
      await image.toFile(path.join(imagesDir, imageFileName));
    }
    console.log('log de createNewController', userId);
    const id = await createNew(title, subject, imageFileName, body, userId);
    res.send({
      status: 'ok',
      message: `Noticia creada corrartamente con id: ${id}`,
    });
  } catch (err) {
    next(err);
  }
};
const getSingleNewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newItem = await getNewById(id);
    res.send({
      status: 'ok',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNewController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newItem = await getNewById(id);

    if (req.userId !== newItem.user_id) {
      throw generateError(
        'Estás intentando borrar un tweet que no es tuyo',
        401
      );
    }

    await getDeleteNewById(id);

    res.send({
      status: 'ok',
      message: `El tweet con id: ${id} ha sido borrado`,
    });
  } catch (error) {
    next(error);
  }
};
const updateNewController = async (req, res, next) => {
  // sacar los datos cambiados
  let connection;
  try {
    connection = await getConnection();
    const { title, subject, body } = req.body;
    const { id } = req.params;

    //validar con joi
    const schema = joi.object().keys({
      title: joi.string().max(150),
      subject: joi.string().max(25),
      body: joi.string(),
    });
    const validation = await schema.validateAsync({
      title,
      subject,
      body,
    });

    if (validation.error) {
      res.status(500).send(validation.error);
    }
    //selecionar los datos de la entrada que queramos cambiar
    const [result] = await connection.query(
      `
    SELECT title, subject, body, user_id FROM news WHERE id = ?
    `,
      [id]
    );
    const [currentNew] = result;
    console.log(
      'UpdateNewController',
      currentNew,
      currentNew.user_id,
      req.userId
    );
    if (currentNew.user_id !== req.userId) {
      throw generateError('No tienes permiso para modificar esta noticia', 403);
    }
    //cambiarlos datos
    await connection.query(
      `
      UPDATE news SET title=?, subject=?, body=? WHERE id = ?
      `,
      [title, subject, body, id]
    );
    res.send({
      status: 'ok',
      data: {
        id,
        title,
        subject,
        body,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
module.exports = {
  getNewsController,
  createNewController,
  getSingleNewController,
  deleteNewController,
  updateNewController,
};
