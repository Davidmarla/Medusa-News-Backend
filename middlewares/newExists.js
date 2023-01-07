const { generateError } = require('../helpers');
const { getConnection } = require('../db/db');

const newExists = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const { id } = req.params;
    //mirar si existe la noticia
    const [result] = await connection.query(
      `
          SELECT id FROM news WHERE id = ?
          `,
      [id]
    );

    const [currentNew] = result;

    if (!currentNew) {
      throw generateError('Noticia no enconrada', 404);
    }

    next();
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  newExists,
};
