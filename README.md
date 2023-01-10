# Proyecto Noticias Colaborativas (HACK A BOSS JSB12RT)

Segundo proyecto del _Bootcamp Full Stack Developer_ para crear una **API** de noticias colaborativas tipo _Reddit_ o _Menéame_ correspondiente a la parte de _Backend_.

Esta **API** permite varias funcionalidades como son el registro de usuarios, login, listado de noticias... Que se expondrán con más detalle en su apartado correspondiente.

## Comenzando 🚀

Sigue estos pasos para poder usar esta **API** en tu máquina local a efectos de pruebas o desarrollo. Clona el repositorio en la carpeta que prefieras y continúa leyendo.

### Pre-requisitos 📋

❗ _Importante_ ❗

Para que la **API** funcione correctamente y antes de ejecutarse el iniciador de la _base de datos_ (en adelante _BD_), debe existir _préviamente_ una _BD_ local llamada **News_Server**.

### Instalación 🔧

Una vez clonado el repositorio en local y creada la _BD_ se debe ejecutar el comando de la terminal:

```
npm i
```

en la misma ruta donde se encuentra el archivo _server.js_ para instalar todas las dependencias necesarias para el funcionamineto de la **API** ya incluídas en el archivo _package.json_.

A continuación, hay que iniciar la _BD_ para crear las tablas correspondientes dentro de dicha _BD_ y que también incluyen usuarios y noticias préviamente creados para permitir hacer pruebas directamente sin necesidad de crearlos nuevos. Usa el comando siguiente de la terminal y en la misma ruta donde se encuentre el archivo _server.js_ para crear los elementos de la _BD_.

```
node db/initDB.js
```

Por supuesto, eres libre de testear todos los _endpoints_ de este proyecto por tu cuenta (crear tu propio usuario y noticias, por ejemplo) 😉

## Corriendo el servidor ⚙️

Cuando ya tengas los pre-requisitos listos, podrás lanzar el servidor con el siguiente comando de la terminal en la misma ruta que el archivo _server.js_ :

```
npm run dev
```

y si todo está correcto deberías ver algo así en la terminal:

```
> proyecto_noticias_colaborativas@1.0.0 dev
> nodemon server.js

[nodemon] 2.0.20
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
APP listening on port 8888
```

Pues ya está la **API** lista para usarse y el servidor corriendo.
Ahora desde este [enlace](https://lively-escape-602067.postman.co/workspace/ProyectoNews~80820a40-7334-4843-8458-e13eda568925/collection/24930100-a6e1b07c-1d40-4152-9308-0fb89d1abaff?action=share&creator=24930100) podrás utilizar todas las funcionalidades desde tu navegador con la herramienta **Postman** que fue utilizada para testear todos los _endpoints_.
