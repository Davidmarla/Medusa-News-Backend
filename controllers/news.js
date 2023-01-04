const { getConnection } = require('../db/db');
const joi = require('joi');
const { generateError, createPathIfNotExists } = require('../helpers');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');
const { getNewById, getDeleteNewById } = require('../db/news');

let connection;
const getNews = async (req, res) => {
  connection = await getConnection();
  try {
    const news = await connection.query(`SELECT * FROM news;`);
    console.log(news);
    res.send([news[0]]);
  } catch (error) {
    console.log(error);
    res.status(500).send;
  } finally {
    connection.release();
  }
};

const createNew = async (req, res) => {
  //TODO: Se necesita el user id para no meterlo a mano, tendra que pasarlo el meddlewere que comprueba que
  //esta autenticado

  let connection = await getConnection();

  const { title, subject, body } = req.body;
  const user_id = req.userId;
  const schema = joi.object().keys({
    title: joi.string().max(150).required(),
    subject: joi.string().max(25).required(),
    body: joi.string().required(),
    user_id: joi.required(),
  });

  const validation = await schema.validateAsync({
    title,
    subject,
    body,
    user_id,
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
  try {
    await connection.query(
      `
      INSERT INTO news(title, subject, image, body,user_id )
      VALUES (?, ?, ?, ?, ?)
      `,
      [title, subject, imageFileName, body, user_id]
    );
  } catch (err) {
    throw generateError('Error en la base de datos', 500);
  } finally {
    connection.release();
  }
  res.status(201).send();
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

module.exports = {
  getNews,
  createNew,
  getSingleNewController,
  deleteNewController,
};
