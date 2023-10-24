import React from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import useAdmins from "@/hooks/useAdmins";
import Table from "@/components/Table";
import { getSession } from "next-auth/react";
import Head from "next/head";
const Admin = () => {
  const { admins } = useAdmins();

  const columnas = [
    {
      title: "",
      field: "acciones",
    },
    {
      title: "Clave publica",
      field: "id",
    },
    {
      title: "nombre",
      field: "name",
    },
    {
      title: "Apellido",
      field: "last_name",
    },
    {
      title: "Email",
      field: "email",
    },
    {
      title: "Bodega",
      field: "winery_id",
    },
  ];

  return (
    <>
      <Topbar />
      <Sidebar />
      <Head>
        <title>Openvino - Admin users</title>
      </Head>
      <div className="ml-8 md:ml-16 top-4 border rounded-lg">
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
