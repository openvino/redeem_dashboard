import React from "react";
import Web3 from "web3";
import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

// NextAuth.js signIn will help us create a session
import { signIn } from "next-auth/react";
import { ethers } from "ethers";
// hooks that allow to use metamask informations

const useLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const handleLogin = async () => {
    const toastId = toast("Login...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      isLoading: true,
    });
    try {
      if (typeof window.ethereum !== "undefined") {
        const injectedProvider = new ethers.providers.Web3Provider(
          window.ethereum
        );

        const account = await injectedProvider.send("eth_requestAccounts", []);

        const callbackUrl = "/dashboard";
        signIn("credentials", { address: account[0], callbackUrl });
      } else {
        throw new Error("No web3 provider");
      }
    } catch (error) {
      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.ERROR,
        render: error.message,
        autoClose: 5000,
      });
    }
  };

  const LoginButton = () => {
    return (
      <button
        disabled={isLoading}
        onClick={handleLogin}
        className={`border
      flex
      items-center
      gap-2
      text-white
      bg-black
       border-pink-900
        hover:bg-pink-900
         hover:text-white
          px-3 py-2  
          transition 
          disabled:text-gray-200
           disabled:border-gray-900
           disabled:hover:bg-white
            
           `}
      >
        <Image
          src="/assets/icon.svg"
          className="w-auto h-auto"
          width={100}
          height={100}
        />{" "}
        Ingresar con metamask
      </button>
    );
  };

  return {
    LoginButton,
    error,
  };
};

export default useLoginButton;
