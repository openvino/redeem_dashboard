import Table from "@/components/Table";
import { getSession } from "next-auth/react";
import React, { useEffect } from "react";
import clientAxios from "@/config/clientAxios";
import { dataFormater, logDataFormater } from "../utils/dataFormater.js";
import Sidebar from "@/components/Sidebar.jsx";
import Topbar from "@/components/Topbar.jsx";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Head from "next/head.js";
import { scrollStyle } from "@/styles/table.js";
const redeemLogs = ({ logs }) => {
  console.log(logs);
  const { t } = useTranslation();
  const filters = useSelector((state) => state.filter);
  const countries = useSelector((state) => state.winaryAdress.countries);
  const provinces = useSelector((state) => state.winaryAdress.provinces);

  const countryName = (country_id) => {
    const country = countries.find((e) => e.country_id === country_id);
    return country ? country.place_description : country_id;
  };

  const provinceName = (province_id) => {
    const province = provinces.find((e) => e.province_id === province_id);
    return province ? province.place_description : province_id;
  };

  const countryAndProvinceNames = (data) => {
    const newData = data.map((item) => ({
      ...item,
      country_id: countryName(item.country_id),
      province_id: provinceName(item.province_id),
    }));

    return newData;
  };

  const columnas = [
    {
      title: t("creado"),
      field: "created_at",
    },
    {
      title: "id",
      field: "id",
    },
    {
      title: "customer_id",
      field: "customer_id",
    },
    {
      title: t("año"),
      field: "year",
    },

    {
      title: t("numero"),
      field: "number",
    },
    {
      title: t("monto"),
      field: "amount",
    },
    {
      title: "error_message",
      field: "error_message",
    },

    {
      title: t("pais"),
      field: "country_id",
    },
    {
      title: t("provincia"),
      field: "province_id",
    },
    {
      title: t("ciudad"),
      field: "city",
    },
    {
      title: t("cp"),
      field: "zip",
    },
    {
      title: "Telegram_ID",
      field: "telegram_id",
    },
    {
      title: t("telefono"),
      field: "phone",
    },

    {
      title: "Email",
      field: "email",
    },

    {
      title: t("calle"),
      field: "street",
    },
    {
      title: t("numero"),
      field: "number",
    },
    {
      title: t("winerie_id"),
      field: "winerie_id",
    },
    {
      title: t("signature"),
      field: "signature",
    },
    {
      title: t("burn_tx_hash"),
      field: "burn_tx_hash",
    },
    {
      title: t("shipping_tx_hash"),
      field: "shipping_tx_hash",
    },
    {
      title: t("shipping_paid_status"),
      field: "shipping_paid_status",
    },
    {
      title: t("pickup"),
      field: "pickup",
    },
  ];

  const filterData = (data) => {
    if (filters.filter) {
      const searchString = filters.filter.toLowerCase();

      return data.filter((obj) =>
        Object.values(obj).some((value) =>
          String(value).toLowerCase().includes(searchString)
        )
      );
    } else {
      return data;
    }
  };
  const data = filterData(countryAndProvinceNames(logDataFormater(logs)));
  console.log(data);
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = scrollStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  return (
    <>
      <Head>
        <title>OpenVino - Redeems</title>
      </Head>
      <div className="">
        <Sidebar />
        <Topbar />

        <div className="top-4 overflow-x-scroll custom-scroll ml-20">
          <Table data={data} columnas={columnas} n={15} />
        </div>
      </div>
    </>
  );
};

export default redeemLogs;

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
  const { req } = context;
  const { cookie } = req.headers;
  console.log(session);

  const response = await clientAxios.get("/logsRoute", {
    params: {
      is_admin: session.is_admin,
    },
    headers: {
      Cookie: cookie,
    },
  });
  console.log(response.data);
  return {
    props: { logs: response.data },
  };
}
