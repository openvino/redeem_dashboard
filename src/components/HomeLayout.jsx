import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SidebarMobile from "./SidebarMobile";

const HomeLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />


      {/* Main section */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default HomeLayout;
