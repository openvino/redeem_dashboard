import React, { useEffect } from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import useAdmins from "@/hooks/useAdmins";
import Table from "@/components/Table";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { scrollStyle } from "@/styles/table";
const Admin = () => {
  const { t } = useTranslation();
  const { admins } = useAdmins();

  const columnas = [
    {
      title: t("action"),
      field: "acciones",
    },
    {
      title: t("clave"),
      field: "id",
    },
    {
      title: "ENS",
      field: "ens",
    },
    {
      title: t("nombre"),
      field: "name",
    },
    {
      title: t("apellido"),
      field: "last_name",
    },
    {
      title: "Email",
      field: "email",
    },
    {
      title: t("bodega"),
      field: "winery_id",
    },
  ];
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
      <Topbar />
      <Sidebar />
      <Head>
        <title>Openvino - Admin users</title>
      </Head>
      <div className="ml-20  top-4 border rounded-lg overflow-x-scroll custom-scroll">
        {admins?.length && (
          <Table columnas={columnas} data={admins} n={10} route="/admin" />
        )}
      </div>
    </>
  );
};

export default Admin;
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
  return {
    props: {},
  };
}
