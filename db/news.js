const {
  generateError,
  getSubjectId,
  getLastNewCreatedId,
  createSubjectIfNotExsists,
  getCurrentIds,
} = require('../helpers');
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
      news.introduction,
      news.body, 
      news.create_date, 
      news.user_id,
      upVote,
      downVote, 
      subjects.subject
    FROM 
      news
    inner join subjects_news
    on subjects_news.id = news.id 
    inner join subjects
    on subjects_news.subject_id = subjects.id
    left join 
    (SELECT  
    news_id,
      SUM(up_vote) as upVote,
      SUM(down_vote) as downVote
    FROM votes_news group by news_id ) s
    on news.id = s.news_id 
    where news.id = ?
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
    SET FOREIGN_KEY_CHECKS=0;
    `
    );

    await connection.query(
      `
    DELETE FROM news WHERE id = ?
    `,
      [id]
    );

    await connection.query(
      `
    SET FOREIGN_KEY_CHECKS=1;
    `
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
    news.introduction,
    news.body, 
    news.create_date, 
    news.user_id,
    upVote,
    downVote, 
    subjects.subject,
    users.user_name
  FROM 
    news
  inner join subjects_news
  on subjects_news.id = news.id 
  inner join subjects
  on subjects_news.subject_id = subjects.id
  left join 
  (SELECT  
  news_id,
    SUM(up_vote) as upVote,
    SUM(down_vote) as downVote
  FROM votes_news group by news_id ) s
  on news.id = s.news_id 
    inner join users
  on news.user_id = users.id
  order by news.create_date DESC
    `);

    return news[0];
  } finally {
    if (connection) connection.release();
  }
};

const createNew = async (
  title,
  introduction,
  imageFileName = '',
  body,
  userId
) => {
  let connection;
  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
      INSERT INTO news(title, introduction, image, body,user_id )
      VALUES (?, ?, ?, ?, ?);
      `,
      [title, introduction, imageFileName ?? '', body, userId]
    );
    console.log(result);

    return result.insertId;
  } catch (err) {
    throw generateError('Error en la base de datos', 500);
  } finally {
    connection.release();
  }
};

const insertSubjectNew = async (subject, subject2, subject3) => {
  let connection;

  try {
    const subjects = [subject, subject2 ?? 'none', subject3 ?? 'none'];
    connection = await getConnection();
    const newId = await getLastNewCreatedId();

    const inserSub = async (subject = 'none') => {
      console.log('Insert', subject);
      console.log(newId);
      await createSubjectIfNotExsists(subject);
      const subjectId = await getSubjectId(subject);
      await connection.query(
        `
            INSERT INTO subjects_news (news_id, subject_id) 
            VAlUES (?, ?)
            `,
        [newId, subjectId]
      );
    };
    subjects.map((subject) => {
      inserSub(subject);
    });
  } catch (error) {
    throw generateError('Error en la base de datos', 500);
  }
};

const updateNew = async (
  title,
  introduction,
  subject,
  subject2,
  subject3,
  imageFileName = '',
  body,
  id
) => {
  let connection;

  try {
    console.log('[UPTADEENEW] =>', imageFileName);

    connection = await getConnection();

    const currentNew = await getNewById(id);

    await connection.query(
      `
    UPDATE news SET title=?, introduction=?, body=?,  image=? WHERE id = ?
    `,
      [
        title ?? currentNew.title,
        introduction ?? currentNew.introduction,
        body ?? currentNew.body,
        imageFileName ?? currentNew.image,
        id,
      ]
    );
    //update subject
    const newId = currentNew.id;

    if (subject !== undefined) {
      const currentSubjects = [subject, subject2 ?? 'none', subject3 ?? 'none'];
      const currentSubject = await getCurrentIds(newId);

      const updateSub = async (subject = 'none', currentSubjectId = 'none') => {
        //paso el tema NUEVO por si no tiene id crearselo
        await createSubjectIfNotExsists(subject);
        //regojo el ID del tema NUEVO
        const subjectId = await getSubjectId(subject);
        console.log(
          'currentSubjectId:',
          currentSubjectId,
          'subjectId:',
          subjectId
        );

        await connection.query(
          `
          UPDATE subjects_news SET  subject_id=? WHERE subject_id=? and news_id=?  
          
          `,
          [subjectId, currentSubjectId, newId]
        );
      };
      console.log(currentSubjects);
      currentSubjects.map((subject, i) => {
        const currentSubjectId = currentSubject[i].subject_id ?? 1;
        console.log('dentro de map [i]:', i, currentSubject[i].subject_id);
        updateSub(subject, currentSubjectId);
      });
    }
  } catch (err) {
    console.log(err);
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

const getNewsByKeyword = async (searchParam) => {
  let connection;

  let finder = searchParam.toLowerCase();
  console.log(finder, searchParam);

  try {
    connection = await getConnection();
    const news = await connection.query(
      ` 
    SELECT 
    news.id,
    news.title,
    news.image,
    news.body, 
    news.create_date, 
    news.user_id,
    upVote,
    downVote, subjects.subject
  FROM 
    news
  inner join subjects_news
  on subjects_news.id = news.id 
  inner join subjects
  on subjects_news.subject_id = subjects.id
  left join 
  (SELECT  
  news_id,
    SUM(up_vote) as upVote,
    SUM(down_vote) as downVote
  FROM votes_news group by news_id ) s
  on news.id = s.news_id  
    WHERE subjects.subject LIKE ? ORDER BY news.create_date DESC
    `,
      [`%${finder}%`]
    );

    if (news[0].length === 0) {
      throw generateError('No hay ningún tema para listar', 500);
    }

    console.log(news);
    return news[0];
  } finally {
    if (connection) connection.release();
  }
};

const getSubjectById = async (id) => {
  let connection;

  try {
    connection = await getConnection();
    const subject = await connection.query(
      `SELECT 
   subjects.subject
    FROM News_Server.news  
   inner join subjects_news
     on subjects_news.id = news.id 
   inner join subjects
     on subjects_news.subject_id = subjects.id 
   where subjects_news.news_id = ?`,
      [id]
    );

    if (subject[0].length === 0) {
      throw generateError('Error en la base de datos', 500);
    }

    return subject[0];
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
  getNewsByKeyword,
  insertSubjectNew,
  getSubjectById,
};
