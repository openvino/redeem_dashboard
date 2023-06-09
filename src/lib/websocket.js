// Código para configurar y mantener el servidor WebSocket
const WebSocket = require("ws");

let wss = null; // Variable para almacenar la instancia del servidor WebSocket

// Función para iniciar el servidor WebSocket
function iniciarServidorWebSocket() {
  // Crea el servidor WebSocket en el puerto 8080
  wss = new WebSocket.Server({ port: 8080 });

  // Resto del código para manejar conexiones, mensajes y cierre de conexión
  // ...
}

// Función para enviar un mensaje a todos los clientes conectados
function enviarMensaje(mensaje) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(mensaje);
    }
  });
}

// Ejemplo de uso
iniciarServidorWebSocket();
// const WebSocket = require("ws");

// // Crea el servidor WebSocket en el puerto 8080
// const wss = new WebSocket.Server({ port: 8080 });

// // Manejo de conexiones entrantes de clientes
// wss.on("connection", (ws) => {
//   console.log("Cliente conectado");
//   // Evento que se dispara cuando se recibe un mensaje del cliente
//   ws.on("message", (message) => {
//     console.log("Mensaje del cliente:", message);
//   });

//   // Evento que se dispara cuando se cierra la conexión con el cliente
//   ws.on("close", () => {
//     console.log("Cliente desconectado");
//   });
// });

// // Enviar un mensaje a todos los clientes conectados
// function enviarMensaje(mensaje) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(mensaje);
//     }
//   });
// }

// // Ejemplo de uso: enviar un mensaje a todos los clientes cada 5 segundos
// setInterval(() => {
//   enviarMensaje("¡Notificación actualizada!");
// }, 5000);

// module.exports = wss;
