import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import HomeLayout from "@/components/HomeLayout";
import useTokenShipping from "@/hooks/useTokenShipping";
import Table from "@/components/Table";
import { useTranslation } from "react-i18next";

const TokenShippingInfo = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { tokens } = useTokenShipping(id);

  const columnas = [
    { title: "", field: "acciones" },
    { title: t("province"), field: "province_id" },
    { title: t("base_cost"), field: "base_cost" },
    { title: t("cost_per_unit"), field: "cost_per_unit" },
    { title: t("id"), field: "id" },
  ];

  return (
    <HomeLayout>
      <Head>
        <title>Openvino - Admin info</title>
      </Head>

      {/* <h1 className="text-xl font-bold m-2">{tokens[0]?.token_id}</h1> */}

      <div className="w-full overflow-x-scrolllg: overflow-x-hidden">
        {tokens && <Table data={tokens} columnas={columnas} route="/shipping/edit" n={50} />}
      </div>
    </HomeLayout>
  );
};

export default TokenShippingInfo;
