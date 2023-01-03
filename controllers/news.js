const { getConnection } = require('../db/db');
const joi = require('joi');
const { generateError } = require('../helpers');
// const { processAndSaveImage } = require('../helpersImg');
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
  const title = req.body.title;
  const header = req.body.header;
  const body = req.body.body;
  const user_id = req.userId;
  const date = req.body.date;
  const schema = joi.object().keys({
    title: joi.string().max(150).required(),
    header: joi.string().max(250).required(),
    body: joi.string().required(),
    user_id: joi.required(),
    date: joi.date(),
  });

  const validation = await schema.validateAsync({
    title,
    header,
    body,
    user_id,
    date,
  });

  if (validation.error) {
    res.status(500).send('test');
  }
  try {
    await connection.query(
      `
      INSERT INTO news(title, header, body,user_id, date )
      VALUES (?, ?, ?, ?, ?)
      `,
      [title, header, body, user_id, date]
    );
  } catch (err) {
    throw generateError('Error en la base de datos', 500);
  } finally {
    connection.release();
  }
  res.status(201).send();
};

module.exports = {
  getNews,
  createNew,
};
