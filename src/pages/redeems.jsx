import Table from "@/components/Table";
import { useSession, signOut, getSession } from "next-auth/react";
import React from "react";
import clientAxios from "@/config/clientAxios";
import { dataFormater } from "../utils/dataFormater.js";
const redeems = ({ redeems }) => {
  const columnas = [
    {
      title: "",
      field: "acciones",
    },
    {
      title: "Id",
      field: "id",
    },
    {
      title: "Cliente",
      field: "customer_id",
    },
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

    {
      title: "Actualizado",
      field: "updated_at",
    },
    // {
    //   title: "Borrado",
    //   field: "deleted_at",
    // },
    {
      title: "Email",
      field: "email",
    },

    {
      title: "Calle",
      field: "street",
    },
    {
      title: "Número",
      field: "number",
    },

    {
      title: "Telegram_ID",
      field: "telegram_id",
    },

    // {
    //   title: "Vinería",
    //   field: "winerie_id",
    // },

    {
      title: "CP",
      field: "zip",
    },
    {
      title: "Año",
      field: "year",
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

  const data = dataFormater(redeems);
  return (
    <div className="">
      <Table data={data} columnas={columnas} n={15} />
    </div>
  );
};

export default redeems;

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
