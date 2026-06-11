import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import HomeLayout from "@/components/HomeLayout";
import useTokenShipping from "@/hooks/useTokenShipping";
import Table from "@/components/Table";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { getProvinces } from "@/redux/actions/winaryActions";

const TokenShippingInfo = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { tokens } = useTokenShipping(id);
  const dispatch = useDispatch();
  const provinces = useSelector((state) => state.winaryAdress.provinces);

  useEffect(() => {
    if (!provinces?.length) dispatch(getProvinces());
  }, []);

  const provinceName = (province_id) => {
    const province = provinces?.find((p) => p.province_id === province_id);
    return province ? province.place_description : province_id;
  };

  const data = tokens?.map((row) => ({
    ...row,
    province_name: provinceName(row.province_id),
  }));

  const columns = [
    { title: "", field: "actions" },
    { title: "Código", field: "province_id" },
    { title: t("provincia"), field: "province_name" },
    { title: t("base_cost"), field: "base_cost" },
    { title: t("cost_per_unit"), field: "cost_per_unit" },
    { title: t("id"), field: "id" },
  ];

  return (
    <HomeLayout>
      <Head>
        <title>Openvino - Admin info</title>
      </Head>

      <div className="w-full overflow-x-scrolllg: overflow-x-hidden">
        {data && <Table data={data} columns={columns} route="/shipping/edit" n={50} />}
      </div>
    </HomeLayout>
  );
};

export default TokenShippingInfo;
