import Table from "@/components/Table";
import { useSession, signOut, getSession } from "next-auth/react";
import React, { useEffect } from "react";
import clientAxios from "@/config/clientAxios";
import { dataFormater } from "../utils/winaryDataFormater.js";
import Sidebar from "@/components/Sidebar.jsx";
import Topbar from "@/components/Topbar.jsx";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Head from "next/head.js";
import { scrollStyle } from "@/styles/table.js";
const Winarys = ({ winarys }) => {
  const { t } = useTranslation();
  const filters = useSelector((state) => state.filter);

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
      title: t("nombre"),
      field: "name",
    },
    {
      title: t("website"),
      field: "website",
    },
    {
      title: t("Imagen"),
      field: "image",
    },
    {
      title: t("primary_color"),
      field: "primary_color",
    },

    // {
    //   title: t("actualizado"),
    //   field: "updated_at",
    // },

    {
      title: "Email",
      field: "email",
    },

    {
      title: t("Secret"),

      field: "secret",
    },
    {
      title: t("key"),

      field: "public_key",
    },
    {
      title: "ENS",

      field: "ens",
    },

    {
      title: t("es_admin"),
      field: "isAdmin",
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
  const data = filterData(dataFormater(winarys));
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = scrollStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  return (
    <>
      <Head>
        <title>OpenVino - Wineries</title>
      </Head>
      <div className="">
        <Sidebar />
        <Topbar />
        <div className="ml-20  top-4 overflow-x-scroll custom-scroll ">
          <Table data={data} columnas={columnas} route="/winaryDetail" n={15} />
        </div>
      </div>
    </>
  );
};

export default Winarys;

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

  const response = await clientAxios.get("/winarysRoute", {
    params: {
      is_admin: session.is_admin,
    },
    headers: {
      Cookie: cookie,
    },
  });

  return {
    props: { winarys: response.data },
  };
}
