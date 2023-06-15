import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaSearch } from "react-icons/fa";
import { useState, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "@/redux/actions/filterActions.js";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { getRedeems } from "@/redux/actions/winaryActions";
import { useTranslation } from "react-i18next";
import Loader from "./Loader";
import {
  closeNotification,
  showNotification,
} from "@/redux/actions/notificationActions";
import { FaBell } from "react-icons/fa";
import Modal from "./Modal";
import {
  showNotificationModal,
  collapseNotificationModal,
} from "@/redux/actions/notificationActions";
import SearchModal from "./SearchModal";
const BellIconWithNotification = ({ notificationCount }) => (
  <div className="relative">
    <FaBell className="text-2xl" />
    {notificationCount > 0 && (
      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1">
        {notificationCount}
      </span>
    )}
  </div>
);

const Topbar = ({ profile }) => {
  const session = useSession();
  const router = useRouter();
  const [selectLanguage, setSelectLanguage] = useState(false);
  const winarys = useSelector((state) => state.winaryAdress.winarys);
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.notification);
  const allRedeems = useSelector((state) => state.winaryAdress.redeems);

  const [open, setOpen] = useState(0);
  const showModal = useSelector((state) => state.notification.showModal);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModal && !event.target.closest(".modal-content")) {
        dispatch(collapseNotificationModal());
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showModal, dispatch, open]);
  const handleFilter = (e) => {
    dispatch(setFilter(e.target.value));
  };

  const [toggle, setToggle] = useState(false);

  const toggleLanguage = () => {
    setLoading(true);

    setTimeout(() => {
      setToggle(!toggle);
      const language = toggle ? "es" : "en";
      i18n.changeLanguage(language);
      setSelectLanguage(!selectLanguage);
      setLoading(false);
    }, 500);
  };
  const { t, i18n } = useTranslation();

  // Socket
  useEffect(() => {
    // Create a new WebSocket instance and specify the server URL
    const socket = new WebSocket("ws://localhost:8080/api/sendMessage");

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
        dispatch(getRedeems());
      } 
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

  //Notifications
  const [allNotifications, setAllnotifications] = useState([]);

  useEffect(() => {
    const unwatchedNotifications = allRedeems.filter(
      (e) => e.watched === false
    );
    setAllnotifications(unwatchedNotifications);

    if (unwatchedNotifications.length) {
      dispatch(showNotification());
    } else {
      dispatch(closeNotification());
    }
  }, [allRedeems]);

  // const showModal = useSelector((state) => state.notification.showModal);

  const handleModal = () => {
    // setLoading(true);
    setTimeout(() => {
      if (showModal) {
        dispatch(collapseNotificationModal());
      } else {
        dispatch(showNotificationModal());
      }
      // setLoading(false);
    }, 400);
  };

  return (
    <>
      {loading && <Loader />}
      <div className="fixed w-full md:w-[94%]  z-50 left-[5rem] mt-2">
        <div className="  flex-col md:flex-row   gap-2 md:p-3  md:flex   ">
          <div className=" bg-[#F1EDE2] bg-opacity-70 w-1/2 shadow-xl border p-4 hidden md:block md:rounded-lg h-[6rem]">
            <div className="flex flex-col w-full  pb-4">
              <p className="text-2xl font-bold">0.1 ETH</p>
              <p className="text-gray-600">{t("deuda")}</p>
            </div>
            {/* <p className="bg-green-200 flex justify-center items-center rounded-lg">
            <span className="text-green-700 text-lg">+18%</span>
          </p> */}
          </div>

          <div className="bg-[#F1EDE2] bg-opacity-70 shadow-xl flex justify-center gap-2 w-1/2 translate-x-[10%] md:translate-x-[0] sm:translate-x-[40%]  border p-4 rounded-lg items-center h-[4rem] min-w-[20rem] md:h-[6rem] ">
            <div className="relative inline-block ">
              <input
                type="text"
                className={`w-full rounded-lg border-none pl-10 focus:outline-[#925d78]  `}
                placeholder={t("buscar")}
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

            <div
              className={
                notification.notification
                  ? " cursor-pointer my-4 p-3 rounded-full inline-block text-[#840C4A] pr-4 hover:transform hover:scale-105 transition-all duration-500"
                  : "hidden"
              }
              onClick={handleModal}
            >
              <BellIconWithNotification
                notificationCount={allNotifications.length}
              />
            </div>

            <div
              onClick={() => setShowMenu(!showMenu)}
              className="relative shadow-xl rounded-full hover:transform hover:scale-110 transition-all duration-500"
            >
              <Image
                className="rounded-full w-full h-full "
                src={profile.image}
                width={50}
                height={50}
                alt="wineryLogo"
              />

              {showMenu && (
                <div className="absolute w-[112px] cursor-pointer right-[-25px] top-15 bg-[#F1EDE2] border rounded-lg shadow-lg text-center text-sm ">
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
            <button onClick={toggleLanguage}>
              {/* {t("idioma")} */}
              {selectLanguage ? "EN" : "ES"}
            </button>

            {/* <MdLanguage size={20} /> */}
          </div>
        </div>
      </div>
      <Modal data={allNotifications} />
      {router.asPath.includes("/winaryDetail") && (
        <SearchModal data={winarys} />
      )}
      {router.asPath.includes("/detail") && <SearchModal data={allRedeems} />}
    </>
  );
};

export default Topbar;
