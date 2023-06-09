import { useEffect } from "react";
import { useRouter } from "next/router";

const WebSocketComponent = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    // Evento que se dispara cuando se establece la conexión WebSocket
    socket.onopen = () => {
      console.log("Conexión WebSocket establecida");
    };

    // Evento que se dispara cuando se recibe un mensaje del servidor WebSocket
    socket.onmessage = (event) => {
      const message = event.data;
      console.log("Mensaje del servidor:", message);

      // Realiza las acciones necesarias en el cliente según el mensaje recibido
      if (message === "Notificación del servidor: Se ha actualizado algo") {
        const router = useRouter();
        router.push("/redeems"); // Redirige a la ruta "/redeems"
      }
    };

    // Evento que se dispara cuando se produce un error en la conexión WebSocket
    socket.onerror = (error) => {
      console.error("Error en la conexión WebSocket:", error);
    };

    // Evento que se dispara cuando se cierra la conexión WebSocket
    socket.onclose = () => {
      console.log("Conexión WebSocket cerrada");
    };

    // Cierra la conexión WebSocket cuando se desmonta el componente
    return () => {
      socket.close();
    };
  }, []);

  return <div>Componente WebSocket</div>;
};

export default WebSocketComponent;

// import { useEffect } from "react";

// const WebSocketComponent = () => {
//   useEffect(() => {
//     const ws = new WebSocket("ws://localhost:3000");

//     // // Maneja los mensajes recibidos desde el servidor
//     // ws.onmessage = (event) => {
//     //   console.log("Mensaje recibido desde el servidor:", event.data);
//     //   // Aquí puedes actualizar el estado de Redux o realizar otras acciones en el cliente
//     // };

//     // // Maneja el cierre de la conexión
//     // ws.onclose = () => {
//     //   console.log("Conexión cerrada");
//     //   // Aquí puedes realizar tareas adicionales al cerrar la conexión, si es necesario
//     // };

//     return () => {
//       // Cierra la conexión al desmontar el componente
//       ws.close();
//     };
//   }, []);

//   return <div>Componente WebSocket</div>;
// };

// export default WebSocketComponent;
