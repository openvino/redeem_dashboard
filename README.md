### Requirements

- Node.js and Postgresql installed on the system
- Metamask extension
- Backend running on openvino-api

## Installing dependencies

npm install --force

## Running the project

npm run dev

## Project Configuration
The login requires a record in the "wineries" table with the wallet value in the "public_key" field. Add your wallet to this field to log in locally.

## Configuring environment variables

The .env.example file contains examples of the environment variables used in the project.

### Components
Inside the "components" folder, you will find the components displayed in different views.
- LoginButton: Renders a button and handles the login logic along with nextAuth.
- Modal: Renders a modal to display notifications.
- SearchModal: Renders the search modal.
- Sidebar: Renders the sidebar.
- Topbar: Renders the top bar.

### Config
Inside the "config" folder, there are two files:
- clientAxios: Basic configuration for executing requests with Axios.
- i18n: Translation configuration.

### Pages
Inside the "pages" folder, you will find the user views (routing of Next.js).
- api: The "api" folder is the application's backend. Inside it, you will find the "auth," "controllers," "helpers," "routes," and "config" folders.

- The "auth" folder contains the authentication logic.
- The "controllers" folder contains SQL queries to the database.
- The "helpers" folder contains a file to verify the token.
- The "routes" folder contains the handlers for client requests.
- The "config" folder contains the database connection.


## Authors

Pablo Levy - Juan Arguello


# OpenVino - Dashboard

### Requerimientos

- Nodejs instalado en el sistema
- Postgresql
- Extension de Metamask
- Tener corriendo el backend en openvino-api

## Instalar las dependencias
```bash
npm install --force
```
## Ejecutar el proyecto
```bash
npm run dev
```

## Configuracion del proyecto
El inicio de sesion requiere en la tabla wineries exista un registro con el valor de la billetera en el campo public_key
agrega tu billetera a este campo para iniciar sesion de forma local

## Configurar variables de entorno

Dentro del archivo .env.example se encuentran ejemplos de las variables de entorno que se utilizan para el proyecto


### Components
Dentro de la carpeta components se encuentran los componentes que se muestran en las diferentes vistas.
- LoginButton : Renderiza un boton y maneja la logica de inicio de session junto con nextAuth
- Modal : Renderiza un modal para mostrar las notificaciones
- SearchModal : Renderiza el modal de busqueda
- Sidebar: Renderiza la barra lateral
- Topbar: Renderiza la barra superior

### Config
Dentro de la carpeta config hay dos archivos
- clientAxios : Una configuracion base para ejecutar las peticiones con axios
- i18n : La configuracion de la traduccion

### Pages
Dentro de la carpeta pages vamos a encontrar las vistas del usuario (routing de nextjs)
- api: La carpeta api es el backend de la aplicacion, dentro se van a encontrar las carpetas auth , controllers, helpers, routes, config

- La carpeta auth contiene la logica para la autenticacion 
- La carpeta controllers contiene las consultas sql a la base de datos
- La carpeta helpers contiene un archivo para verificar el token
- La carpeta routes contiene los handles para las solicitudes del cliente
- La carpeta config contiene la conexion a la base de datos


## Autores

Pablo Levy - Juan Arguello
