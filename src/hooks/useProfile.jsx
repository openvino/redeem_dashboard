import React, { useEffect, useState } from "react";
import clientAxios from "@/config/clientAxios";
import { useSession } from "next-auth/react";

const useProfile = () => {
  const [profile, setProfile] = useState();
  const { data: session, status } = useSession();

  const fetchProfile = async () => {
    try {
      if (status === "authenticated" && session) {
        const response = await clientAxios.post("/loginRoute", {
          public_key: session.address,
          headers: {
            Cookie: session.cookie,
          },
        });
        setProfile(response.data);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchProfile();
    }
  }, [status, session]);

  return {
    profile,
    session,
    status,
  };
};

export default useProfile;
