import { FaWineGlass, FaUser, FaWineBottle, FaShippingFast, FaRocket } from "react-icons/fa";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Sidebar = () => {
	const session = useSession();

	const router = useRouter();

  const menuItems = [
    { href: "/dashboard", icon: <FaWineGlass size={20} />, title: "Home" },
    { href: "/admin", icon: <FaUser size={20} />, title: "Admin" },
    // { href: "/redeems", icon: <FaWineBottle size={20} />, title: "Redeems" },
    {
      href: "/orders",
      icon: <RiMoneyDollarCircleLine size={20} />,
      title: "Orders",
    },
    {
			href: "/provisioning",
			icon: <FaRocket size={20} />,
			title: "Launch!",
		},
    {
      href: "/shipping",
      icon: <FaShippingFast size={20} />,
      title: "Shipping",
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
			icon: <IoMdSettings size={20} />,
			title: "Settings",
		});
	}

	return (
		<div className="hidden md:flex p-5 bg-[#F1EDE2] border-r  flex-col  shadow-xl">
			<div className="flex flex-col items-center justify-center gap-5 ">
				{menuItems.map((item, index) => (
					<Link key={index} href={item.href}>
						<div
							title={item.title}
							className={`h-12 w-12 flex justify-center items-center cursor-pointer rounded-lg
                            ${
                              router.pathname.includes(item.href)
                                ? "bg-[#840C4A] text-white"
                                : "bg-white hover:bg-gray-200 text-[#840C4A]  "
                            }
                  `}
						>
							{item.icon}
						</div>
						<p className="text-[.6rem] mt-1  text-center">{item.title}</p>
					</Link>
				))}
			</div>
		</div>
	);
};

export default Sidebar;
