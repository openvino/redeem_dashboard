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
  console.log("server message:", mensaje);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(mensaje);
    }
  });
}

// Ejemplo de uso
iniciarServidorWebSocket();

// ... Resto del código de tu aplicación ...

// Manejador del punto final POST
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { data } = req.body;

      // Procesar la solicitud POST y realizar las operaciones necesarias
      // ...

      // Enviar el mensaje al cliente a través del servidor WebSocket
      enviarMensaje("¡Notificación actualizada!");

      // Cerrar manualmente la conexión WebSocket
      wss.close();

      return res.status(200).json("notification");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }
}

// const wss = require("../../lib/websocket");

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     console.log("HOLA post");
//     try {
//       const { data } = req.body;

//       // Envía el mensaje al WebSocket
//       wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send("¡Notificación actualizada!");
//         }
//       });

//       return res.status(200).json("notification");
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({ message: error.message });
//     }
//   }
// }
// import store from "../../redux/store";

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     console.log("HOLA VOS");
//     try {
//       const { data } = req.body;

//       // Acceder al estado actual del store
//       const currentState = store.getState();
//       console.log(currentState);

//       // Actualizar el estado "notification" a true
//       currentState.notification.notification = true;

//       // Obtener el estado actualizado
//       const updatedState = store.getState();
//       console.log(updatedState);

//       return res.status(200).json("notification");
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({ message: error.message });
//     }
//   }
// }
