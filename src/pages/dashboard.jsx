import { useSession, signOut, getSession } from "next-auth/react";
// import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Table from "@/components/Table";
import { dataFormater } from "../utils/dataFormater.js";
import { setFilter, getFilter } from "@/redux/actions/filterActions.js";
import clientAxios from "@/config/clientAxios";
import { useDispatch, useSelector } from "react-redux";
import {
  showNotification,
  closeNotification,
} from "@/redux/actions/notificationActions.js";

const Dashboard = ({ redeems }) => {
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
  // const handleNoti = () => {
  //   console.log(notifications);
  //   if (notifications.notification) {
  //     dispatch(closeNotification());
  //   } else {
  //     dispatch(showNotification());
  //   }
  // };
  return (
    <div>
      <Sidebar />
      <div className="fixed left-[6rem] top-4 flex flex-col ">
        <Topbar />
        {/* <button className="bg-green-900" onClick={handleNoti}>
          noti
        </button> */}
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

  return {
    props: { redeems: response.data },
  };
}
