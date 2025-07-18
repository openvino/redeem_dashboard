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
import useProfile from "@/hooks/useProfile";
import { getBalance } from "../../helpers";
import FormField from "./FormField";
import SidebarMobile from "./SidebarMobile";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../config/thirdwebClient";

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

const wsPort = process.env.NEXT_PUBLIC_WS_SERVER_URL;

const Topbar = () => {
	const { profile } = useProfile();
	const account = useActiveAccount();
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
	const [walletBalance, setWalletBalance] = useState(0);

	const reloadRedeems = () => {
		dispatch(getRedeems(session.data.is_admin));
	};

	useEffect(() => {
		const fetchBalance = async () => {
			try {
				const balance = await getBalance();
				setWalletBalance(balance);
			} catch (error) {
				console.error("Error fetching balance:", error);
			}
		};

		fetchBalance();
	}, []);

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

		const socket = new WebSocket(`${wsPort}/api/sendMessage`);
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
				dispatch(getRedeems(session.data.isAdmin));
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
	}, [session]);

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
			// dispatch(closeNotification());
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
			<div className="bg-[#F1EDE2] md:bg-transparent md:px-4 md:py-3">
				<div className="flex flex-col md:flex-row gap-3 ">
					<div className="hidden md:flex bg-[#F1EDE2] bg-opacity-70 shadow-xl border p-4 md:rounded-lg flex-1 ">
						<div className="flex flex-col w-full  pb-4 text-lg">
							<p className=" font-bold">{walletBalance} ETH</p>
							<p className="text-gray-600  text-[16px]">{t("deuda")}</p>
						</div>
					</div>

					<div className="w-calc-full-6rem md:w-full bg-[#F1EDE2]    bg-opacity-70 md:shadow-xl flex flex-col md:flex-row justify-evenly gap-2 border p-4 rounded-lg items-center flex-1">
						<div className="flex justify-evenly items-center w-full gap-3 px-2">
							<div>
								<SidebarMobile />
							</div>
							{router.pathname === "/dashboard" && (
								<div className="relative inline-block">
									<FormField
										type="text"
										className={`w-full rounded-lg border-none pl-10 focus:outline-[#925d78]`}
										placeholder={t("buscar")}
										onFocus={() => setIsFocused(true)}
										onBlur={() => setIsFocused(false)}
										ref={inputRef}
										onChange={handleFilter}
									/>
									<span
										id="search-icon"
										className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer ${
											isFocused ? "opacity-0" : "opacity-100"
										}`}
										onClick={() => inputRef.current?.focus()}
									>
										<FaSearch className="hidden md:block" />
									</span>
								</div>
							)}

							<ConnectButton
								client={client}
								locale="es_ES"
								connectModal={{
									size: "compact",
									title: "Viniswap",
									welcomeScreen: {
										title: "eskere",
										img: "/mtb.png",
									},
								}}
								connectButton={{
									label: "Connect Wallet",
									style: {
										padding: "12px 24px",
										background: "#000",
										color: "#fff",
										fontSize: "16px",
										fontWeight: "bold",
										borderRadius: "12px",
										boxShadow:
											"0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
									},
								}}
							/>
							{allNotifications.length ? (
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
							) : null}
							<div
								onClick={() => setShowMenu(!showMenu)}
								className="relative shadow-xl  rounded-full hover:transform hover:scale-110 transition-all duration-500"
							>
								{profile?.profile_img && (
									<Image
										className="rounded-full w-full h-full min-w-[3rem]"
										src={profile?.profile_img}
										width={30}
										height={30}
										alt="wineryLogo"
									/>
								)}

								{/* {showMenu && (
									<div className="absolute w-[112px] cursor-pointer right-[-25px] top-15 bg-[#F1EDE2] border rounded-lg shadow-lg text-center text-sm ">
										<p
											className="m-0 p-2 cursor-pointer"
											onClick={async () => await signOut({ redirect: "/" })}
										>
											Cerrar Sesión
										</p>
									</div>
								)} */}
							</div>
							<button onClick={toggleLanguage}>
								{selectLanguage ? "EN" : "ES"}
							</button>
						</div>
					</div>
				</div>
			</div>
			<Modal data={allNotifications} reloadRedeems={reloadRedeems} />
			{router.asPath.includes("/wineryDetail") && (
				<SearchModal data={winarys} />
			)}
			{router.asPath.includes("/detail") && <SearchModal data={allRedeems} />}
		</>
	);
};

export default Topbar;
