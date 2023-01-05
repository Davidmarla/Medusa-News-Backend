const { generateError } = require('../helpers');
const { getConnection } = require('./db');

const getNewById = async (id) => {
  let connection;
  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
    SELECT * FROM news WHERE id = ?
    `,
      [id]
    );

    if (result.length === 0) {
      throw generateError(`La noticia con id: ${id} no existe`, 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

const getDeleteNewById = async (id) => {
  let connection;
  try {
    connection = await getConnection();

    await connection.query(
      `
    DELETE FROM news WHERE id = ?
    `,
      [id]
    );

    return;
  } finally {
    if (connection) connection.release();
  }
};
const getNews = async () => {
  let connection;
  try {
    connection = await getConnection();
    const news = await connection.query(`SELECT * FROM news;`);

    return news[0];
  } finally {
    if (connection) connection.release();
  }
};
const createNew = async (title, subject, imageFileName = '', body, userId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.query(
      `
      INSERT INTO news(title, subject, image, body,user_id )
      VALUES (?, ?, ?, ?, ?);
      `, //TODO: no ser tan cuctre con la solucion a esto.
      [title, subject, imageFileName ?? '', body, userId]
    );
    await connection.query(
      `
      INSERT INTO keyword_news (news_id, keyword_id) 
      SELECT news.id, keywords.id from news inner join keywords on news.subject = keywords.keyword 
      where news.subject = ?
      `,
      [subject]
    );
    return result.insertId;
  } catch (err) {
    throw generateError('Error en la base de datos', 500);
  } finally {
    connection.release();
  }
};

module.exports = {
  getNewById,
  getDeleteNewById,
  createNew,
  getNews,
};
