const joi = require('joi');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');

const {
  generateError,
  createPathIfNotExists,
  createSubjectIfNotExsists,
} = require('../helpers');

const {
  getNewById,
  getDeleteNewById,
  createNew,
  getNews,
  voteNews,
  updateNew,
  getNewsByKeyword,
  insertSubjectNew,
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
    const { title, introduction, subject, subject2, subject3, body } = req.body;
    const userId = req.userId;
    const schema = joi.object().keys({
      title: joi.string().max(150).required(),
      introduction: joi.string().max(300).required(),
      subject: joi.string().max(25).required(),
      subject2: joi.string().max(25),
      subject3: joi.string().max(25),
      body: joi.string().required(),
    });

    const validation = await schema.validateAsync({
      title,
      introduction,
      subject,
      subject2,
      subject3,
      body,
    });
    if (validation.error) {
      res.status(500).send(validation.error);
    }

    await createSubjectIfNotExsists(subject);
    // console.log(subject, subject2, subject3);
    if (subject2 !== undefined) {
      console.log('holas');
      await createSubjectIfNotExsists(subject2);
    }
    if (subject3 !== undefined) {
      await createSubjectIfNotExsists(subject3);
    }

    await insertSubjectNew(subject, subject2, subject3);

    let imageFileName;

    if (req.files && req.files.image) {
      const imagesDir = path.join(__dirname, process.env.UPLOADS_DIRNEWS);
      await createPathIfNotExists(imagesDir);

      const image = sharp(req.files.image.data);
      image.resize(1000);

      imageFileName = `${nanoid(30)}.jpg`;
      await image.toFile(path.join(imagesDir, imageFileName));
    }

    const id = await createNew(
      title,
      introduction,
      imageFileName,
      body,
      userId
    );

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

    if (!searchParam) {
      throw generateError('Introduzca un término de búsqueda', 400);
    }

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
    console.log(newItem);
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
  try {
    const { title, introduction, subject, subject2, subject3, body } = req.body;
    const { id } = req.params;
    //validar con joi
    const schema = joi.object().keys({
      title: joi.string().max(150),
      body: joi.string(),
      introduction: joi.string().max(300),
      subject: joi.string().max(25),
      subject2: joi.string().max(25),
      subject3: joi.string().max(25),
    });
    const validation = await schema.validateAsync({
      title,
      subject,
      subject2,
      subject3,
      body,
    });

    if (validation.error) {
      throw generateError(`${validation.error}`, 401);
    }

    const newItem = await getNewById(id);

    if (newItem.user_id !== req.userId) {
      throw generateError('No tienes permiso para modificar esta noticia', 403);
    }
    await createSubjectIfNotExsists(subject);

    let imageFileName;

    if (req.files && req.files.image) {
      const imagesDir = path.join(__dirname, process.env.UPLOADS_DIRNEWS);

      await createPathIfNotExists(imagesDir);

      const image = sharp(req.files.image.data);
      image.resize(1000);

      imageFileName = `${nanoid(30)}.jpg`;
      await image.toFile(path.join(imagesDir, imageFileName));
    }

    await updateNew(
      title,
      introduction,
      subject,
      subject2,
      subject3,
      (imageFileName = ''),
      body,
      id
    );
    res.send({
      status: 'ok',
      message: `La Noticia ha sido modificada.`,
    });
  } catch (err) {
    next(err);
  }
};

const voteNewController = async (req, res) => {
  try {
    const type = req.params.type;
    const newId = req.params.id;
    const userId = req.userId;
    await getNewById(newId);
    await voteNews(type, newId, userId);

    res.send({
      status: 'ok',
      message: 'Voto ha sido registrasdo',
    });
  } catch (error) {
    throw generateError('Error en la base de datos', 500);
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
