import React, { useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsBellFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "@/redux/actions/filterActions.js";
const Topbar = ({ profile }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.notification);
  const handleFilter = (e) => {
    dispatch(setFilter(e.target.value));
  };

  // useEffect(() => {
  //   // console.log("NOTINOTI", notification);
  // }, [notification]);
  return (
    <>
    <div className="fixed w-[90%] left-[5rem]">
        <div className="  flex-col md:flex-row  gap-2 p-4  md:flex  ">
          <div className=" bg-[#F1EDE2] w-full border p-4 hidden md:block rounded-lg h-[6rem]">
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
          <div className="bg-[#F1EDE2] flex justify-evenly gap-2 w-full border p-4 rounded-lg items-center h-[6rem]">
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
              <div className="bg-white hover:bg-gray-200 cursor-pointer p-3 rounded-full inline-block text-[#840C4A] mr-8">
                <Image
                  className="rounded-2xl w-full h-full"
                  src={profile.image}
                  width={50}
                  height={50}
                  alt="wineryLogo"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;
