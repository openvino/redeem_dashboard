import Table from "@/components/Table";
import { getSession } from "next-auth/react";
import React from "react";
import clientAxios from "@/config/clientAxios";
import { dataFormater } from "../utils/dataFormater.js";
import Sidebar from "@/components/Sidebar.jsx";
import Topbar from "@/components/Topbar.jsx";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Head from "next/head.js";
const redeems = ({ redeems, profile }) => {

 

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
      title: "",
      field: "acciones",
    },
    {
      title: "Id",
      field: "id",
    },
    {
      title: "Cliente",
      field: "customer_id",
    },
    {
      title: t("nombre"),
      field: "name",
    },
    {
      title: t("monto"),
      field: "amount",
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
      title: t("actualizado"),
      field: "updated_at",
    },
    // {
    //   title: "Borrado",
    //   field: "deleted_at",
    // },
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
      title: "Telegram_ID",
      field: "telegram_id",
    },

    // {
    //   title: "Vinería",
    //   field: "winerie_id",
    // },

    {
      title: t("cp"),

      field: "zip",
    },
    {
      title: t("año"),

      field: "year",
    },
    {
      title: t("creado"),

      field: "created_at",
    },
    {
      title: t("estado"),

      field: "status",
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
  const data = filterData(countryAndProvinceNames(dataFormater(redeems)));

  return (
    <>
     <Head>
    <title>OpenVino - Redeems</title>
  </Head>
    <div className="">
      <Sidebar />
      <Topbar profile={profile} />

      <div className="ml-20  min-w-fit top-4 ">
        <Table data={data} columnas={columnas} n={15} />
      </div>
    </div>
    </>
  );
};

export default redeems;

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

  const response = await clientAxios.get("/redeemRoute", {
    params: {
      isAdmin: session.isAdmin,
    },
    headers: {
      Cookie: cookie,
    },
  });
  const profile = await clientAxios.post("/loginRoute", {
    public_key: session.address,
    headers: {
      Cookie: cookie,
    },
  });

  return {
    props: { redeems: response.data, profile: profile.data },
  };
}
