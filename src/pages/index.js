import { ABeeZee } from 'next/font/google'
const aBeeZee = ABeeZee({ subsets: ['latin'], weight:'400' })
import { useSelector } from 'react-redux';
import LoginButton from '../components/LoginButton';
import Image from 'next/image';
import Head from 'next/head';

import React from 'react'
import { useSession, signOut, getSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
export default function Home() {

  
  const [{ data: accountData }, disconnect] = useAccount()

  const session = useSession()

  const alert = useSelector(state => state.alert.alert)

  return (
    <>
    <Head>
      <title>OpenVino - Iniciar Sesion</title>
    </Head>
    <main
    style={{backgroundImage:`url(/assets/background-login.png)`}}
      className={`flex min-h-screen flex-col gap-10 justify-center items-center p-24 ${aBeeZee.className}`}
    >
      {alert && alert}

      <div className='bg-white p-3'>
      <Image src={'/assets/website-logo.png'} width={200} height={200} alt='logo' priority />
      </div>

      <LoginButton />
    </main>
    </>
  )
}
export async function getServerSideProps(context) {
  const session = await getSession(context)

  if(session) {
    return {
      redirect: {
        destination:'/dashboard',
        permanent: false
      }
    }
  }

  return {
    props: {

    }
  }
}