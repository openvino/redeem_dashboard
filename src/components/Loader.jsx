import Image from "next/image";
import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className=" fixed top-[80%] left-[80%] text-center rounded-full w-[100px] h-[100px] ">
        <Image
          src={"/assets/loading.gif"}
          className="rounded-full"
          width={100}
          height={100}
          alt="loading..."
        />
      </div>
    </div>
  );
};

export default Loader;
