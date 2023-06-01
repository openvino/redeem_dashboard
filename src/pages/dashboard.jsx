import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";

const Dashboard = () => {
  const router = useRouter();

  const [{ data: accountData }, disconnect] = useAccount();

  const session = useSession();
  console.log(session);
  return (
    <>
      <h1>DASHBOARD</h1>
      <Sidebar />
    </>
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

  return {
    props: {},
  };
}
