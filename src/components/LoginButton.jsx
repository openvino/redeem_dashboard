import React from "react";
import Web3 from "web3";
import { closeAlert, showAlert } from "@/redux/actions/alertActions";
import { useDispatch } from "react-redux";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { loginApp } from "@/redux/actions/winaryActions";

// NextAuth.js signIn will help us create a session
import { signIn } from 'next-auth/react'
// hooks that allow to use metamask informations
import { useConnect, useAccount } from 'wagmi'


const LoginButton = () => { 
  const router = useRouter()
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [{ data: connectData }, connect] = useConnect()
  const [{ data: accountData }] = useAccount()
  const metamaskInstalled = connectData.connectors[0].name === 'MetaMask'
 

  const handleLogin = async () => {
    try {
      const callbackUrl = '/dashboard'
      if (accountData?.address) {
        signIn('credentials', { address: accountData.address, callbackUrl })
        return
      }
      const { data, error } = await connect(connectData.connectors[0])
      if (error) {
        throw error
      }
      console.log(data.account)
      signIn('credentials', { address: data?.account, callbackUrl })
    } catch (error) {
      window.alert('Metamask is not installed')
    }
  }

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
      <Image src='/assets/icon.svg' className='w-auto h-auto' width={100} height={100} /> Ingresar con metamask
    </button>
  );
};

export default LoginButton;
