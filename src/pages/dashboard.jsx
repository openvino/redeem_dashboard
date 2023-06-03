import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Table from "@/components/Table";
import clientAxios from "@/config/clientAxios";

const Dashboard = ({ redeems }) => {
  // console.log("*/*/*/*/*/*/*/*/*/*/*/*/*                       :", redeems);
  const columnas = [
    {
      title: "",
      field: "acciones",
    },
    {
      title: "Artista",
      field: "artista",
    },
    {
      title: "País de origen",
      field: "pais",
    },
    {
      title: "Géneros",
      field: "genero",
    },
    {
      title: "Ventas estimadas en millones",
      field: "ventas",
      type: "numeric",
    },
    {
      title: "Status",
      field: "status",
    },
  ];

  const data = [
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
  ];
  const router = useRouter();

  const [{ data: accountData }, disconnect] = useAccount();

  const session = useSession();
  console.log(session);
  return (
    <div>
      <Sidebar />
      <div className="fixed left-[6rem] top-4 flex flex-col ">
        <Topbar />
        <div className="w-[75%] mx-auto">
          <Table data={data} columnas={columnas} />
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
  const redeems = await clientAxios.get("/redeemRoute");

  return {
    props: { redeems: redeems.data },
  };
}
