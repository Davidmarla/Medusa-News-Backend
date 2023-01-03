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

module.exports = {
  getNewById,
  getDeleteNewById,
};
