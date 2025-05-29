import React, { useEffect, useState } from "react";
import clientAxios from "@/config/clientAxios";
import { useSession } from "next-auth/react";

const useTokenShipping = ( tokenId ) => {
  const [tokens, setTokens] = useState();
  const { data: session, status } = useSession();

  const fetchToken = async () => {
    try {
      if (status === "authenticated" && session) {
        const response = await clientAxios.get("/tokenShippingRoute", {
          params: {
            tokenId,
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

export default useTokenShipping;
