import React from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import useAdmins from "@/hooks/useAdmins";
import Table from "@/components/Table";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import HomeLayout from "@/components/HomeLayout";
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

  return (
    <HomeLayout>
      <Head>
        <title>Openvino - Admin users</title>
      </Head>
      <div className=" border rounded-lg">
        {admins?.length && (
          <Table columnas={columnas} data={admins} n={10} route="/admin" />
        )}
      </div>
    </HomeLayout>
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
