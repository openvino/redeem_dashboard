import React from "react";
import { FaSearch } from "react-icons/fa";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsBellFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "@/redux/actions/filterActions.js";
const Topbar = () => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  // const filter = useSelector((state) => state.filter);
  const handleFilter = (e) => {
    dispatch(setFilter(e.target.value));
  };
  return (
    <div>
      <div className="grid lg:grid-cols-5 gap-4 p-4 ">
        <div className="lg:col-span-3 col-span-1 bg-[#F1EDE2] flex justify-between w-full border p-4 rounded-lg h-[6rem]">
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
        <div className="lg:col-span-1 col-span-1 bg-[#F1EDE2] flex justify-between w-full border p-4 rounded-lg items-center h-[6rem]">
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
        </div>

        <div className="lg:col-span-1 col-span-1 bg-[#F1EDE2]  w-full border p-4 rounded-lg flex justify-end items-center h-[6rem]">
          <Link href="/">
            <div className=" cursor-pointer my-4 p-3 rounded-full inline-block text-[#840C4A] pr-4">
              <BsBellFill className="hover:bg-gray-200 " size={15} />
            </div>
          </Link>
          <Link href="/">
            <div className="bg-white hover:bg-gray-200 cursor-pointer p-3 rounded-full inline-block text-[#840C4A] mr-8">
              <Image
                src={"/assets/costafloresLogo.png"}
                width={30}
                height={30}
                alt="wineryLogo"
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
