const WebSocket = require('ws');

let wss = null;

function iniciarServidorWebSocket() {
  wss = new WebSocket.Server({ port: 8080 });
}

function enviarMensaje(mensaje) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(mensaje);
    }
  });
}

iniciarServidorWebSocket();
