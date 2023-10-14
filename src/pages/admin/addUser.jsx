import React from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import useProfile from "@/hooks/useProfile";
const addUser = () => {
  const { profile } = useProfile();

  return (
    <>
      <Sidebar />
      <Topbar />
    </>
  );
};

export default addUser;
