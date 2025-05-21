import { useSession,  getSession } from "next-auth/react";
import { useEffect, } from "react";
import Table from "../components/Table";
import { dataFormater } from "../utils/dataFormater.js";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head.js";
import { getRedeems } from "@/redux/actions/winaryActions";
import { useTranslation } from "react-i18next";
import { getCountries, getProvinces } from "../redux/actions/winaryActions";
import HomeLayout from "@/components/HomeLayout";
let flag = true;

const Dashboard = () => {
  const session = useSession();
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

  useEffect(() => {
    if (session.status === "authenticated" && flag) {
      dispatch(getRedeems(session.data.is_admin));
      dispatch(getCountries());
      dispatch(getProvinces());
      flag = false;
    }
  }, [session]);

  const dispatch = useDispatch();

  const redeems = useSelector((state) => state.winaryAdress.redeems);

  const columnas = [
    { title: "", field: "acciones" },
    { title: t("creado"), field: "created_at" },
    { title: t("año"), field: "year" },
    { title: t("nombre"), field: "name" },
    { title: t("monto"), field: "amount" },
    { title: t("shipping_paid_status"), field: "shipping_paid_status" },
    { title: t("pickup"), field: "pickup" },
    { title: t("estado"), field: "status" },
    { title: t("pais"), field: "country_id" },
    { title: t("provincia"), field: "province_id" },
    { title: t("ciudad"), field: "city" },
    { title: "Email", field: "email" },
    { title: t("cp"), field: "zip" },
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
  const data = filterData(countryAndProvinceNames(dataFormater(redeems, [])));

  return (
    <HomeLayout>
      <Head>
        <title>OpenVino - Dashboard</title>
      </Head>
      <div>
           <h1 className=" text-xl font-bold m-2">Redeems</h1>
        <div className="border rounded-lg">
          <Table data={data} columnas={columnas} n={50} />
        </div>
      </div>
    </HomeLayout>
  );
};

export default Dashboard;

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
