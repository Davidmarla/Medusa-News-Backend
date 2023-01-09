const joi = require('joi');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');

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
  voteNews,
  updateNew,
  getNewsByKeyword,
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

    let imageFileName;

    if (req.files && req.files.image) {
      const imagesDir = path.join(__dirname, process.env.UPLOADS_DIRNEWS);
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
      message: `Noticia creada correctamente con id: ${id}`,
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

const searchNewController = async (req, res, next) => {
  try {
    const searchParam = req.query.keyword;
    //console.log(searchParam);

    const searchResult = await getNewsByKeyword(searchParam);

    res.send({
      status: 'ok',
      data: searchResult,
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
        'Estás intentando borrar una noticia que no es tuya',

        401
      );
    }

    await getDeleteNewById(id);

    res.send({
      status: 'ok',

      message: `La noticia con id: ${id} ha sido borrado`,
    });
  } catch (error) {
    next(error);
  }
};
const updateNewController = async (req, res, next) => {
  // sacar los datos cambiados

  try {
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
      throw generateError(`${validation.error}`, 401);
    }

    const newItem = await getNewById(id);

    if (newItem.user_id !== req.userId) {
      throw generateError('No tienes permiso para modificar esta noticia', 403);
    }
    await updateNew(title, subject, body, id);
    res.send({
      status: 'ok',
      message: `La Noticia ha sido modificada.`,
    });
  } catch (err) {
    next(err);
  }
};

const voteNewController = async (req, res, next) => {
  try {
    const type = req.params.type;
    const newId = req.params.id;
    const userId = req.userId;
    await getNewById(newId);
    await voteNews(type, newId, userId);

    res.send({
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNewsController,
  createNewController,
  getSingleNewController,
  deleteNewController,
  updateNewController,
  searchNewController,
  voteNewController,
};
