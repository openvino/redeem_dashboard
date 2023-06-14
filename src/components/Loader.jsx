import Image from "next/image";
import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <Image
          src={"/assets/loading.gif"}
          className="m-auto"
          width={200}
          height={200}
        />
        <h1>Loading...</h1>
      </div>
    </div>
  );
};

export default Loader;
