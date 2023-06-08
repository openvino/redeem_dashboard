import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Table from "../components/Table";
import { dataFormater } from "../utils/dataFormater.js";
import { setFilter, getFilter } from "@/redux/actions/filterActions.js";
import clientAxios from "../config/clientAxios";
import { useDispatch, useSelector } from "react-redux";
import {
  showNotification,
  closeNotification,
} from "@/redux/actions/notificationActions.js";
// import WebSocketComponent from "../components/WebSocketComponent.jsx";
// import WebSocketSingleton from "../components/WebSocketSingleton.jsx";

const Dashboard = ({ redeems, profile }) => {
  useEffect(() => {
    // Create a new WebSocket instance and specify the server URL
    const socket = new WebSocket("ws://localhost:8081/api/sendMessage");

    // Connection opened
    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
    });

    // Listen for messages from the server
    socket.addEventListener("message", (event) => {
      const message = event.data;
      console.log("Received message from server:", message);
      // Handle the incoming message from the server
      if (message === "Notification updated!") {
        dispatch(showNotification());
      } else {
        console.log("no se hizo");
      }
      // Update your state or perform any necessary actions
    });

    // Connection closed
    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, []);

  const filters = useSelector((state) => state.filter);
  const notifications = useSelector((state) => state.notification);
  const dispatch = useDispatch();

  const columnas = [
    {
      title: "",
      field: "acciones",
    },
    // {
    //   title: "Id",
    //   field: "id",
    // },
    // {
    //   title: "Cliente",
    //   field: "customer_id",
    // },
    {
      title: "Nombre",
      field: "name",
    },
    {
      title: "Monto",
      field: "amount",
    },
    {
      title: "País",
      field: "country_id",
    },
    {
      title: "Provincia",
      field: "province_id",
    },

    // {
    //   title: "Actualizado",
    //   field: "updated_at",
    // },
    // {
    //   title: "Borrado",
    //   field: "deleted_at",
    // },
    {
      title: "Email",
      field: "email",
    },

    // {
    //   title: "Calle",
    //   field: "street",
    // },
    // {
    //   title: "Número",
    //   field: "number",
    // },

    // {
    //   title: "Telegram_ID",
    //   field: "telegram_id",
    // },

    // {
    //   title: "Vinería",
    //   field: "winerie_id",
    // },
    {
      title: "Año",
      field: "year",
    },
    {
      title: "CP",
      field: "zip",
    },
    {
      title: "Creado",
      field: "created_at",
    },
    {
      title: "Estado",
      field: "status",
    },
  ];

  const filterData = (data) => {
    if (filters.filter) {
      const searchString = filters.filter.toLowerCase();

      return data.filter((obj) =>
        Object.values(obj).some((value) =>
          String(value).toLowerCase().includes(searchString)
        )
      );
    } else {
      return data;
    }
  };

  const data = filterData(dataFormater(redeems));

  const router = useRouter();

  const [{ data: accountData }, disconnect] = useAccount();

  const session = useSession();
  console.log(session);
  const handleNoti = () => {
    console.log(notifications);
    if (notifications.notification) {
      dispatch(closeNotification());
    } else {
      dispatch(showNotification());
    }
  };

  // useEffect(() => {
  //   const webSocketInstance = new WebSocketSingleton();
  //   webSocketInstance.connect();

  //   return () => {
  //     webSocketInstance.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   const socket = new WebSocket("ws://localhost:8080");

  //   socket.onmessage = (event) => {
  //     const message = event.data;

  //     if (
  //       message === "Notificación del servidor: Se ha actualizado algo" ||
  //       message === "¡Notificación actualizada!"
  //     ) {
  //       console.log("Mensaje del servidor:", message);
  //       // Redirigir a la ruta "/redeems"
  //       // router.push("/redeems");
  //       dispatch(showNotification());
  //     }
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, [router]);
  // useEffect(() => {
  //   // const socket = new WebSocket("ws://localhost:8080");

  //   // Evento que se dispara cuando se establece la conexión WebSocket
  //   socket.onopen = () => {
  //     console.log("Conexión WebSocket establecida");
  //   };

  //   // Evento que se dispara cuando se recibe un mensaje del servidor WebSocket
  //   socket.onmessage = (event) => {
  //     const message = event.data;
  //     console.log("Mensaje del servidor:", message);

  //     // Realiza las acciones necesarias en el cliente según el mensaje recibido
  //   };

  //   // Evento que se dispara cuando se produce un error en la conexión WebSocket
  //   socket.onerror = (error) => {
  //     console.error("Error en la conexión WebSocket:", error);
  //     setWebSocketError(true); // Establece el estado de error a true
  //   };

  //   // Evento que se dispara cuando se cierra la conexión WebSocket
  //   socket.onclose = () => {
  //     console.log("Conexión WebSocket cerrada");
  //   };

  //   // Cierra la conexión WebSocket cuando se desmonta el componente
  //   return () => {
  //     socket.close();
  //   };
  // }, []);

  // // Agrega webSocketError al array de dependencias
  // useEffect(() => {
  //   if (webSocketError) {
  //     // Realiza las acciones necesarias en el cliente cuando ocurre un error en la conexión WebSocket
  //     // Por ejemplo, puedes forzar una actualización del componente
  //   }
  // }, [webSocketError]);

  return (
    <div>
      <Sidebar />
      <div className="fixed left-[6rem] top-4 flex flex-col ">
        <Topbar profile={profile} />
        {/* <WebSocketSingleton /> */}
        <button className="bg-green-900" onClick={handleNoti}>
          noti
        </button>
        <div className="mx-auto p-4 flex justify-center">
          <Table data={data} columnas={columnas} n={5} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const { req } = context;
  const { cookie } = req.headers;

  const response = await clientAxios.get("/redeemRoute", {
    headers: {
      Cookie: cookie,
    },
  });

  const profile = await clientAxios.post("/loginRoute", {
    public_key: session.address,
    headers: {
      Cookie: cookie,
    },
  });

  return {
    props: { redeems: response.data, profile: profile.data },
  };
}
