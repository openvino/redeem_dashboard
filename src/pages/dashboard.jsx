import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Table from "@/components/Table";
import clientAxios from "@/config/clientAxios";

const Dashboard = ({ redeems }) => {
  console.log("*/*/*/*/*/*/*/*/*/*/*/*/*                       :", redeems);
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
          <Table />
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
