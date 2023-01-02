require('dotenv').config();

const { getConnection } = require('./db');

async function main() {
  let connection;

  try {
    connection = await getConnection();

    console.log('Creando base de datos y conectando...');

    await connection.query('CREATE DATABASE IF NOT EXISTS News_Server;');
    await connection.query('USE News_Server;');

    console.log('Borrando tablas existentes...');

    await connection.query('DROP TABLE IF EXISTS users;');

    console.log('Creando tablas...');

    await connection.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(25),
        bio VARCHAR(500),
        profile_image VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

main();
