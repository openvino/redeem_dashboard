import clientAxios from "@/config/clientAxios";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useProfile from "./useProfile";
const useAdmins = (id) => {
  const [admins, setAdmins] = useState();
  const { data: session } = useSession();

  const { profile, status } = useProfile();

  const fetchAdmins = async () => {
    try {
      if (id) {
        const response = await clientAxios.get("/adminRoute", {
          params: { id },
        });

        setAdmins(response.data);
      } else {
        const response = await clientAxios.get("/adminRoute", {
          params: { is_admin: session.is_admin, winery_id: profile?.winery_id },
        });

        setAdmins(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchAdmins();
    }
  }, [status, session, profile]);

  return {
    admins,
  };
};

export default useAdmins;
