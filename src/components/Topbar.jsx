import React, { useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsBellFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "@/redux/actions/filterActions.js";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import clientAxios from "@/config/clientAxios";

const Topbar = ({ profile }) => {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.notification);
  const handleFilter = (e) => {
    dispatch(setFilter(e.target.value));
  };

  // Websocket
  useEffect(() => {
    // Create a new WebSocket instance and specify the server URL
    const socket = new WebSocket("ws://localhost:8081/api/sendMessage");

    // Connection opened
    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
    });

    // Listen for messages from the server
    socket.addEventListener("message", async (event) => {
      const message = event.data;
      console.log("Received message from server:", message);
      // Handle the incoming message from the server
      if (message === "Notification updated!") {
        // const response = await clientAxios.get("/redeemRoute", {
        //   // headers: {
        //   //   Cookie: cookie,
        //   // },
        // });
        router.reload();
        // console.log(response.data);
        // console.log("HOLA");
      } else {
        console.log("no se hizo");
      }
      // Update your state or perform any necessary actions
    });

    // Connection closed
    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, []);

  return (
    <>
      <div className="fixed w-full md:w-[94%]  z-50 left-[5rem]  ">
        <div className="  flex-col md:flex-row   gap-2 md:p-3  md:flex   ">
          <div className=" bg-[#F1EDE2] w-1/2 shadow-xl border p-4 hidden md:block md:rounded-lg h-[6rem]">
            <div className="flex flex-col w-full  pb-4">
              <p className="text-2xl font-bold">0.1 ETH</p>
              <p className="text-gray-600">
                Deuda total de OPENVINO redeeem wallet.
              </p>
            </div>
            {/* <p className="bg-green-200 flex justify-center items-center rounded-lg">
            <span className="text-green-700 text-lg">+18%</span>
          </p> */}
          </div>
          <div className="bg-[#F1EDE2] shadow-xl flex justify-center gap-2 w-1/2 translate-x-[35%] md:translate-x-0  border p-4 rounded-lg items-center h-[6rem] ">
            <div className="relative inline-block">
              <input
                type="text"
                className={`w-full rounded-lg border-none pl-10 focus:outline-[#925d78] `}
                placeholder="Buscar..."
                onFocus={() => {
                  setIsFocused(true);
                }}
                onBlur={() => {
                  setIsFocused(false);
                }}
                ref={inputRef}
                onChange={handleFilter}
              />
              <span
                id="search-icon"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer ${
                  isFocused ? "opacity-0" : "opacity-100"
                }`}
                onClick={() => {
                  inputRef.current.focus();
                }}
              >
                <FaSearch />
              </span>
            </div>
            <Link href="/">
              <div
                className={
                  notification.notification
                    ? " cursor-pointer my-4 p-3 rounded-full inline-block text-[#840C4A] pr-4"
                    : "hidden"
                }
              >
                <BsBellFill className="hover:bg-gray-200 " size={15} />
              </div>
            </Link>

            <div onClick={() => setShowMenu(!showMenu)} className=" relative">
              <Image
                className="rounded-full w-full h-full"
                src={profile.image}
                width={50}
                height={50}
                alt="wineryLogo"
              />
              {showMenu && (
                <div className="absolute w-[112px] cursor-pointer right-[-25px] top-14 bg-white border rounded-lg shadow-lg text-center ">
                  {/* <p className="m-0 p-2 cursor-pointer" >Perfil</p> */}
                  <p
                    className="m-0 p-2 cursor-pointer"
                    onClick={async () => await signOut({ redirect: "/" })}
                  >
                    Cerrar Sesión
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;
