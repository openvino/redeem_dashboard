import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Table from "@/components/Table";
import clientAxios from "@/config/clientAxios";

const Dashboard = ({ redeems }) => {
  const router = useRouter();

  console.log(redeems)
  const [{ data: accountData }, disconnect] = useAccount();

  const session = useSession();
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
  const { req } = context;
  const { cookie } = req.headers;

  const response = await clientAxios.get('/redeemRoute', {
    headers: {
      Cookie: cookie,
    },
  });
  return {
    props: {redeems: response.data},
  };
}
