const { generateError } = require('../helpers');
const { getConnection } = require('./db');

const getNewById = async (id) => {
  let connection;
  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
      SELECT 
      news.id,
      news.title,
      news.image, 
      news.subject, 
      news.body, 
      news.create_date, 
      news.user_id,
      upVote,
      downVote
      
      from news 
      left join 
      (SELECT  news_id,  SUM(up_vote) as upVote , SUM(down_vote) as downVote
      FROM votes_news group by news_id ) s
      on (news.id = news_id) where news.id = ?
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
    const news = await connection.query(` 
    SELECT 
    news.id,
    news.title,
    news.image, 
    news.subject, 
    news.body, 
    news.create_date, 
    news.user_id,
    upVote,
    downVote
    
    from news 
    left join 
    (SELECT  news_id,  SUM(up_vote) as upVote , SUM(down_vote) as downVote
    FROM votes_news group by news_id ) s
    on (news.id = news_id) order by news.create_date DESC
    
    `);

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
      `,
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

const updateNew = async (title, subject, body, id) => {
  let connection;

  try {
    connection = await getConnection();

    const currentNew = await getNewById(id);
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
  } catch (err) {
    throw generateError('Error en la base de datos', 500);
  } finally {
    if (connection) connection.release();
  }
};

const voteNews = async (type, newId, userId) => {
  let connection;
  try {
    connection = await getConnection();
    //comprovar si hay voto
    const [currentVote] = await connection.query(
      `
  SELECT id FROM votes_news WHERE news_id = ? and user_id = ?;
  `,
      [newId, userId]
    );

    //si es up
    if (type === 'up') {
      //no hay voto
      if (!currentVote.length) {
        await connection.query(
          `
        INSERT INTO votes_news(up_vote, down_vote, news_id, user_id) VALUES(1, 0, ?, ?);
        `,
          [parseInt(newId), userId]
        );
      }
      //si hay voto
      if (currentVote.length) {
        await connection.query(
          `
          UPDATE votes_news set up_vote = 1, down_vote = 0 WHERE id = ?;
          `,
          [currentVote[0].id]
        );
      }
    }
    if (type === 'down') {
      //no hay voto
      if (!currentVote.length) {
        await connection.query(
          `
        INSERT INTO votes_news(up_vote, down_vote, news_id, user_id) VALUES(0, 1, ?, ?);
        `,
          [parseInt(newId), userId]
        );
      }
      //si hay voto
      if (currentVote.length) {
        await connection.query(
          `
          UPDATE votes_news set up_vote = 0, down_vote = 1 WHERE id = ?;
          `,
          [currentVote[0].id]
        );
      }
    }
  } catch (err) {
    throw generateError('Error en la base de datos', 500);
  } finally {
    if (connection) connection.release();
  }
};
module.exports = {
  getNewById,
  getDeleteNewById,
  createNew,
  getNews,
  voteNews,
  updateNew,
};
