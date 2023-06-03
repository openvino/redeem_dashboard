import React, { useState } from "react";
import { useReactCompat } from "react-compat";

const Wagmi = () => {
  const [isWagmi, setIsWagmi] = useState(false);

  useReactCompat(() => {
    const fetchWagmi = async () => {
      const response = await fetch("https://api.wagmi.com/");
      const data = await response.json();
      setIsWagmi(data.isWagmi);
    };

    fetchWagmi();
  });

  return <div>{isWagmi ? "WAGMI!" : "Not WAGMI..."}</div>;
};

export default Wagmi;
