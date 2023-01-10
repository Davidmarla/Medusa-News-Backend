# Proyecto Noticias Colaborativas (HACK A BOSS JSB12RT)

Segundo proyecto del _Bootcamp Full Stack Developer_ para crear una **API** de noticias colaborativas tipo _Reddit_ o _Menéame_ correspondiente a la parte de _Backend_.

Esta **API** permite varias funcionalidades como son el registro de usuarios, login, listado de noticias... Que se expondrán con más detalle en su apartado correspondiente.

## Comenzando 🚀

Sigue estos pasos para poder usar esta **API** en tu máquina local a efectos de pruebas o desarrollo. Clona el repositorio en la carpeta que prefieras y continúa leyendo.

### Pre-requisitos

❗ _Importante_ ❗

Para que la **API** funcione correctamente y antes de ejecutarse el iniciador de la _base de datos_ (en adelante _BD_), debe existir _préviamente_ una _BD_ local llamada **News_Server**.

### Instalación 🔧

Una vez clonado el repositorio en local y creada la _BD_ se debe ejecutar el comando de la terminal:

```
npm i
```

en la misma ruta donde se encuentra el archivo _server.js_ para instalar todas las dependencias necesarias para el funcionamineto de la **API** ya incluídas en el archivo _package.json_.

A continuación, se crearán las tablas correspondientes dentro de dicha _BD_ y que también incluyen usuarios y noticias préviamente creados para permitir hacer pruebas directamente sin necesidad de crearlos nuevos. Usa el comando siguiente en la terminal y en la misma ruta donde se encuentre el _server.js_ para crear los elementos de la _BD_.

```
node db/initDB.js
```

Por supuesto, eres libre de testear todos los _endpoints_ de este proyecto por tu cuenta (crear tu propio usuario y noticias, por ejemplo) 😉
