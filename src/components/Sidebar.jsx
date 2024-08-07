import {
  FaWineGlass,
  FaUser,
  FaWineBottle,
  FaShippingFast,
} from "react-icons/fa";
import { RiErrorWarningFill } from "react-icons/ri";
import { RxTokens } from "react-icons/rx";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { IoMdSettings } from "react-icons/io";

const Sidebar = () => {
  const session = useSession();
  return (
    <div className="flex">
      <div className="fixed z-41 w-20 h-full p-4 bg-[#F1EDE2] border-r-[1px] flex flex-col justify-between shadow-xl">
        <div className="flex flex-col items-center">
          <Link href="/">
            <div
              className="bg-[#840C4A] hover:opacity-40 cursor-pointer text-white p-3 rounded-lg inline-block"
              title="Home"
            >
              <FaWineGlass size={20} />
            </div>
          </Link>
          <span className="border-b-[1px] border-[#840C4A] w-full p-2"></span>
          <Link href="/admin">
            <div
              className="bg-white hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block text-[#840C4A]"
              title="Admin"
            >
              <FaUser size={20} />
            </div>
          </Link>

          <Link href="/redeems">
            <div
              className="bg-white hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block text-[#840C4A]"
              title="Redeems"
            >
              <FaWineBottle size={20} />
            </div>
          </Link>
          <Link href="/logs">
            <div
              className="bg-white hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block text-[#840C4A]"
              title="Logs"
            >
              <RiErrorWarningFill size={20} />
            </div>
          </Link>
          <Link href="/shipping">
            <div
              className="bg-white hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block text-[#840C4A]"
              title="Shipping"
            >
              <FaShippingFast size={20} />
            </div>
          </Link>
          <Link href="/tokens">
            <div
              className="bg-white hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block text-[#840C4A]"
              title="Tokens"
            >
              <Image
                src={"/assets/mtb.png"}
                width={200}
                height={200}
                alt="mtb23"
              />
            </div>
          </Link>
          {session.data?.is_admin && (
            <Link href="/wineries">
              <div
                className="bg-white hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block text-[#840C4A]"
                title="Settings"
              >
                <IoMdSettings size={25} />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
