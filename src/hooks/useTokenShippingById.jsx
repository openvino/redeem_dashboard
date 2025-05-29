import React, { useEffect, useState } from "react";
import clientAxios from "@/config/clientAxios";
import { useSession } from "next-auth/react";

const useTokenShippingById = (shippingId) => {
  const [tokens, setTokens] = useState();
  const { data: session, status } = useSession();

  const fetchToken = async () => {
    try {
      if (status === "authenticated" && session) {
        const response = await clientAxios.get("/tokenShippingRoute", {
          params: {
            shippingId,
          },

          withCredentials: true,
        });
        setTokens(response.data[0]);
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

export default useTokenShippingById;
