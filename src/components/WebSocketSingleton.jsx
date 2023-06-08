class WebSocketSingleton {
  static instance = null;
  socket = null;

  constructor() {
    if (WebSocketSingleton.instance) {
      return WebSocketSingleton.instance;
    }
    WebSocketSingleton.instance = this;
  }

  connect() {
    this.socket = new WebSocket("wss://localhost:8080");

    this.socket.onopen = () => {
      console.log("Conexión WebSocket establecida");
    };

    this.socket.onmessage = (event) => {
      const message = event.data;
      console.log("Mensaje del servidor:", message);
      // Realiza las acciones necesarias en el cliente según el mensaje recibido
      // ...
    };

    this.socket.onerror = (error) => {
      console.error("Error en la conexión WebSocket:", error);
      // Realiza las acciones necesarias en el cliente cuando ocurre un error en la conexión WebSocket
      // ...
    };

    this.socket.onclose = () => {
      console.log("Conexión WebSocket cerrada");
      // Realiza las acciones necesarias en el cliente cuando se cierra la conexión WebSocket
      // ...
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default WebSocketSingleton;

// import { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   showNotification,
//   closeNotification,
// } from "@/redux/actions/notificationActions.js";
// const WebSocketSingleton = () => {
//   const dispatch = useDispatch();
//   const socketRef = useRef(null);

//   useEffect(() => {
//     // Crea la instancia de WebSocket solo si no existe
//     if (!socketRef.current) {
//       socketRef.current = new WebSocket("ws://localhost:8080");

//       socketRef.current.onopen = () => {
//         console.log("Conexión WebSocket establecida");
//       };

//       socketRef.current.onmessage = (event) => {
//         const message = event.data;
//         console.log("Mensaje del servidor:", message);
//         // Realiza las acciones necesarias en el cliente según el mensaje recibido
//         // ...
//         if (message == "¡Notificación actualizada!") {
//           dispatch(showNotification);
//         }
//       };

//       socketRef.current.onerror = (error) => {
//         console.error("Error en la conexión WebSocket:", error);
//         // Realiza las acciones necesarias en el cliente cuando ocurre un error en la conexión WebSocket
//         // ...
//       };

//       socketRef.current.onclose = () => {
//         console.log("Conexión WebSocket cerrada");
//         // Realiza las acciones necesarias en el cliente cuando se cierra la conexión WebSocket
//         // ...
//       };
//     }

//     return () => {
//       // Cierra la conexión WebSocket al desmontar el componente
//       if (socketRef.current) {
//         socketRef.current.close();
//         socketRef.current = null;
//       }
//     };
//   }, []);

//   return null; // Componente funcional sin renderizado
// };

// export default WebSocketSingleton;
