// components/SidebarMobile.tsx
import { useState } from "react";
import { FaBars, FaRocket, FaTimes } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoMdSettings } from "react-icons/io";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { FaUser, FaWineGlass } from "react-icons/fa";
import Image from "next/image";

export default function SidebarMobile() {
	const [isOpen, setIsOpen] = useState(false);
	const session = useSession();
	const router = useRouter();

	const menuItems = [
		{ href: "/dashboard", icon: <FaWineGlass size={20} />, title: "Home" },
		{ href: "/admin", icon: <FaUser size={20} />, title: "Admin" },
		{
			href: "/orders",
			icon: <RiMoneyDollarCircleLine size={20} />,
			title: "Orders",
		},
		{
			href: "/provisioning/launch",
			icon: <FaRocket size={20} />,
			title: "Launch!",
		},
		{
			href: "/tokens",
			icon: (
				<div className="w-6 h-6 relative">
					<Image
						src="/assets/mtb.png"
						fill
						alt="mtb23"
						className="object-contain"
					/>
				</div>
			),
			title: "Tokens",
		},
	];

	if (session.data?.is_admin) {
		menuItems.push({
			href: "/wineries",
			icon: <IoMdSettings size={25} />,
			title: "Settings",
		});
	}

	return (
		<>
			{/* Botón hamburguesa */}
			<button
				className="  text-[#840C4A] md:hidden h-20"
				onClick={() => setIsOpen(true)}
			>
				<FaBars size={24} />
			</button>

			{/* Fondo oscuro (overlay) */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar animado */}
			<div
				className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#F1EDE2] shadow-xl transform transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="p-4 flex justify-between items-center">
					<h2 className="text-lg font-semibold">Menú</h2>
					<button onClick={() => setIsOpen(false)}>
						<FaTimes size={20} />
					</button>
				</div>
				<div className="flex flex-col items-start p-4 gap-4">
					{menuItems.map((item, index) => (
						<Link
							key={index}
							href={item.href}
							className={`flex items-center gap-2 p-2 rounded-md w-full ${
								router.pathname === item.href
									? "bg-[#840C4A] text-white"
									: "hover:bg-gray-200 text-[#840C4A]"
							}`}
							onClick={() => setIsOpen(false)}
						>
							{item.icon}
							<span>{item.title}</span>
						</Link>
					))}
				</div>
			</div>
		</>
	);
}
