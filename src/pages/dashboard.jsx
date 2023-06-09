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
import Image from "next/image";

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
        console.log("###########################3");
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

  return (
    <div className="flex flex-col">
      {/* <Image
        src="/assets/background-login.png"
        width={100}
        height={100}
        className="h-[100vh] w-[100vh] cover z-0"
      /> */}
      <Sidebar />
      <Topbar profile={profile} />

      <div className="ml-20 top-4">
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
