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

    await connection.query('DROP TABLE IF EXISTS keyword_news;');
    await connection.query('DROP TABLE IF EXISTS keywords;');
    await connection.query('DROP TABLE IF EXISTS news;');
    await connection.query('DROP TABLE IF EXISTS users;');

    console.log('Creando tablas...');

    await connection.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100),
        user_name VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(25) DEFAULT "user",
        bio VARCHAR(500),
        profile_image VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
    CREATE TABLE news (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(150) NOT NULL,
      image VARCHAR(100),
      subject VARCHAR(25) NOT NULL,
      body TEXT NOT NULL,
      create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );
  `);

    await connection.query(`
    CREATE TABLE keywords(
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      keyword VARCHAR(20) UNIQUE NOT NULL
  )`);

    await connection.query(`
    CREATE TABLE keyword_news(
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      keyword_id INTEGER NOT NULL,
      news_id INTEGER NOT NULL,
      FOREIGN KEY (keyword_id) REFERENCES keywords(id),
      FOREIGN KEY (news_id) REFERENCES news(id)
    )`);
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

main();
