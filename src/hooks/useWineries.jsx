import clientAxios from "@/config/clientAxios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
const useWineries = () => {
  const [wineries, setWineries] = useState();
  const { data: session, status } = useSession();
  const fetchWineries = async () => {
    try {
      const response = await clientAxios.get("/winarysRoute", {
        params: {
          is_admin: session?.is_admin,
        },
        withCredentials: true,
      });
      setWineries(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchWineries();
    }
  }, [status, session]);

  return {
    wineries,
  };
};

export default useWineries;
