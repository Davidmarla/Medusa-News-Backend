const joi = require('joi');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');

const { getConnection } = require('../db/db');

const {
  generateError,
  createPathIfNotExists,
  createKeywordIfNotExsists,
} = require('../helpers');
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
    //keyword
    await createKeywordIfNotExsists(subject);

    //IMAGE TODO: Meter las imagenes en la carpeta uploads/Images
    let imageFileName;

    if (req.files && req.files.image) {
      const imagesDir = path.join(__dirname, '../newsImages');
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
        'Estás intentando borrar una Noticia que no es tuyo',
        401
      );
    }

    await getDeleteNewById(id);

    res.send({
      status: 'ok',
      message: `La Noticia con id: ${id} ha sido borrado`,
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
    //TODO:separar en una función que vea que la noticia existe
    const [result] = await connection.query(
      `
    SELECT title, subject, body, user_id FROM news WHERE id = ?
    `,
      [id]
    );

    const [currentNew] = result;

    if (!currentNew) {
      throw generateError('Noticia no enconrada', 404);
    }
    if (currentNew.user_id !== req.userId) {
      throw generateError('No tienes permiso para modificar esta noticia', 403);
    }

    //cambiarlos datos
    await connection.query(
      `
      UPDATE news SET title=?, subject=?, body=? WHERE id = ?
      `,
      [
        title ?? currentNew.title,
        subject ?? currentNew.subject,
        body ?? currentNew.body,
        id,
      ]
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

const voteNew = async (req, res, next) => {
  let connection;
  //coseguir de params si es up o donw
  const type = req.params.type;
  const newId = req.params.id;
  const userId = req.userId;
  try {
    connection = await getConnection();
    const [vote] = await connection.query(
      `
      SELECT id FROM votes_news WHERE news_id = ? and user_id = ?;
      `,
      [newId, userId]
    );
    const [currentVote] = await connection.query(
      `
      SELECT id FROM votes_news WHERE news_id = ? and user_id = ?;
      `,
      [newId, userId]
    );

    if (!vote.lenght) {
      await connection.query(
        `
        INSERT INTO votes_news(up_vote, donw_vote, news_id, user_id) VALUES(0, 0, ?, ?);
        `,
        [parseInt(newId), userId]
      );
      console.log('Entrada creada');
    }
    if (vote.lenght) {
      await connection.query(
        `
        UPDATE votes_news set up_vote = 0, donw_vote = 0 WHERE id = ?;
        `,
        [newId]
      );
    }
    //si es up,
    if (type === 'up') {
      await connection.query(
        `
        UPDATE votes_news set up_vote = 1, donw_vote = 0 WHERE id = ?;
        `,
        [currentVote.id]
      );
      console.log('voto up 1');
    }
    if (type === 'donw') {
      //si es donw,
      await connection.query(
        `
        UPDATE votes_news set up_vote = 0, donw_vote = 1 WHERE id = ?;
        `,
        [currentVote.id]
      );
      console.log('voto donw 1');
    }
    res.send({
      status: 'ok',
    });
  } catch (error) {
    next(error);
    return;
  }
};

module.exports = {
  getNewsController,
  createNewController,
  getSingleNewController,
  deleteNewController,
  updateNewController,
  voteNew,
};
