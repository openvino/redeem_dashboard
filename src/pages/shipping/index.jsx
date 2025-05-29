import React from "react";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import HomeLayout from "@/components/HomeLayout";
import useTokens from "@/hooks/useTokens";
import Image from "next/image";
import { useRouter } from "next/router";
const Shipping = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { tokens } = useTokens();

  return (
    <HomeLayout>
      <Head>
        <title>Openvino - Shipping costs</title>
      </Head>
      <h1 className=" text-xl font-bold m-2">Shipping costs</h1>

      <div className="grid grid-cols-4 place-items-center gap-4 mt-10">
        {tokens?.length &&
          tokens.map((token) => (
            <div
              onClick={() => router.push(`/shipping/${token.id}`)}
              key={token.id}
              className="flex flex-col items-center cursor-pointer"
            >
              <Image
                src={`/assets/${token.id.toLowerCase()}.png`}
                width={220}
                height={220}
                alt={token.id}
              />

              <p className="mt-2">{token.id}</p>
            </div>
          ))}
      </div>
    </HomeLayout>
  );
};

export default Shipping;
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}
