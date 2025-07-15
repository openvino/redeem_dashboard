import React, { useEffect, useState } from "react";
import clientAxios from "@/config/clientAxios";
import { useSession } from "next-auth/react";

const useTokens = () => {
  const [tokens, setTokens] = useState();
  const { data: session, status } = useSession();

  const fetchToken = async () => {
    try {
      if (status === "authenticated" && session) {
        const response = await clientAxios.get("/tokensRoute", {
          params: {
            winery_id: session.winery_id,
          },

          withCredentials: true,
        });
        setTokens(response.data);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchToken();
    }
  }, [status, session]);

  return {
    tokens,
    session,
    status,
  };
};

export default useTokens;
