import Image from "next/image";
import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-[#F1EDE2] ">
      <div className="text-center rounded-full w-[150px] h-[150px] ">
        <Image
          src={"/assets/loading.gif"}
          className="m-auto rounded-full"
          width={200}
          height={200}
        />
      </div>
    </div>
  );
};

export default Loader;
