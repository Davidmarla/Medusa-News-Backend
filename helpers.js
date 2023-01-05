const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { nanoid } = require('nanoid');

const generateError = (message, status) => {
  const error = new Error(message);
  error.httpStatus = status;
  return error;
};

const createPathIfNotExists = async (path) => {
  try {
    await fs.access(path);
  } catch {
    await fs.mkdir(path);
  }
};

const imageUploadPath = path.join(__dirname, process.env.UPLOADS_DIRPROFILE);

async function processAndSaveImage(uploadedImage) {
  // Creamos el directorio (con recursive: true por si hay subdirectorios y así no da error)
  await fs.mkdir(imageUploadPath, { recursive: true });

  //Procesar la imagen
  const image = sharp(uploadedImage.data);
  image.resize(500);

  // Guardar la imagen en el directorio de subidas
  const imageFileName = `${nanoid(30)}.jpg`;
  await image.toFile(path.join(imageUploadPath, imageFileName));

  // Devolver el nombre con el que fue guardada
  return imageFileName;
}

module.exports = {
  generateError,
  createPathIfNotExists,
  processAndSaveImage,
};
