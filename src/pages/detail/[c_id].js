import { useSession, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import clientAxios from "@/config/clientAxios";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getRedeems } from "@/redux/actions/winaryActions";
import Head from "next/head";
import HomeLayout from "@/components/HomeLayout";
import FormField from "@/components/FormField";

function Detail({ redeems, countries, provinces }) {
  const { t } = useTranslation();
  const session = useSession();
  const router = useRouter();
  const { c_id } = router.query;
  const { register, handleSubmit, setValue } = useForm({});
  const [countrieSelector, setCountrieSelector] = useState("");
  const [provinceSelector, setProvinceSelector] = useState("");
  const [statusSelector, setStatusSelector] = useState("");
  const id = redeems.findIndex((r) => r.id === c_id);
  const dispatch = useDispatch();
  const reloadRedeems = () => {
    dispatch(getRedeems(session.data.is_admin));
  };
  useEffect(() => {
    reloadRedeems();
  }, [id]);

  useEffect(() => {
    if (redeems.length > 0) {
      setValue("id", redeems[id]?.id, { shouldDirty: false });
      setValue("customer_id", redeems[id]?.customer_id, { shouldDirty: false });
      setValue("amount", redeems[id]?.amount, { shouldDirty: false });
      setValue("status", redeems[id]?.status, { shouldDirty: false });
      setValue("country_id", redeems[id]?.country_id, { shouldDirty: false });
      setValue("province_id", redeems[id]?.province_id, { shouldDirty: false });
      setValue("email", redeems[id]?.email, { shouldDirty: false });
      setValue("city", redeems[id]?.city, { shouldDirty: false });
      setValue("phone", redeems[id]?.phone, { shouldDirty: false });

      setCountrieSelector(redeems[id].country_id);
      setProvinceSelector(redeems[id].province_id);
      setStatusSelector(redeems[id].status);
    }
  }, [redeems]);

  const onSubmit = async (data) => {
    const toastId = toast("Updating Redeem...", {
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
      const response = await clientAxios.put("/redeemRoute", {
        data,
      });

      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.SUCCESS,
        render: "Redeem updated",
        autoClose: 5000,
      });
    } catch (error) {
      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.ERROR,
        render: "Error ",
        autoClose: 5000,
      });
    }
  };

  const redeem = redeems[id];

  useEffect(() => {
    const setTrue = async () => {
      await clientAxios.post("/notificationRoute", {
        id: redeem.id,
      });
      dispatch(getRedeems(session.data.is_admin));
    };
    if (session.data?.is_admin) {
      setTrue();
    }
  }, [redeem, session]);

  return (
    <HomeLayout>
      <Head>
        <title>OpenVino - Detail redeems</title>
      </Head>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      <ToastContainer />
      <div className="z-1">
        <h1 className="text-2xl font-bold text-center mb-4">{t("detalle")}</h1>

        <form
          className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* ID + Monto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Id:"
              disabled
              value={redeem.id}
              {...register("id")}
            />
            <FormField
              label={t("monto")}
              disabled
              value={redeem.amount}
              {...register("amount")}
            />
          </div>

          {/* Nombre + Customer_id */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("nombre")}
              defaultValue={redeem.name}
              {...register("name")}
            />
            <FormField
              label="Customer ID:"
              disabled
              defaultValue={redeem.customer_id}
              {...register("customer_id")}
            />
          </div>

          {/* Email + Telegram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Email:"
              defaultValue={redeem.email}
              {...register("email")}
            />
            <FormField
              label="Telegram:"
              defaultValue={redeem.telegram_id}
              {...register("telegram_id")}
            />
          </div>

          {/* Teléfono + Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("tel")}
              type="number"
              defaultValue={redeem.phone}
              {...register("phone")}
            />
            <FormField
              label={t("ciudad")}
              defaultValue={redeem.city}
              {...register("city")}
            />
          </div>

          {/* País + Provincia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                {t("pais")}:
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#840C4A]"
                defaultValue={redeem.country_id}
                onChange={(e) => {
                  setCountrieSelector(e.target.value);
                  setValue("country_id", e.target.value);
                }}
              >
                {countries.map((country) => (
                  <option key={country.country_id} value={country.country_id}>
                    {country.place_description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                {t("provincia")}:
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#840C4A]"
                value={provinceSelector}
                onChange={(e) => {
                  setProvinceSelector(e.target.value);
                  setValue("province_id", e.target.value);
                }}
              >
                {provinces
                  .filter((p) =>
                    p.province_id.startsWith(countrieSelector + "-")
                  )
                  .map((province, id) => (
                    <option key={id} value={province.province_id}>
                      {province.place_description}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Calle + Número */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("calle")}
              defaultValue={redeem.street}
              {...register("street")}
            />
            <FormField
              label={t("numero")}
              defaultValue={redeem.number}
              {...register("number")}
            />
          </div>

          {/* CP + Token */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("cp")}
              defaultValue={redeem.zip}
              {...register("zip")}
            />
            <FormField
              label="Token:"
              disabled
              defaultValue={redeem.year}
              {...register("year")}
            />
          </div>

          {/* Creado + Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("creado")}
              disabled
              defaultValue={redeem.created_at.substring(0, 10)}
              {...register("created_at")}
            />
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                {t("estado")}:
              </label>
              <select
                id="status"
                name="status"
                defaultValue={redeem.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#840C4A]"
                {...register("status")}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              {t("volver")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#840C4A] text-white rounded-md hover:bg-[#6c093d] transition"
            >
              {t("guardar")}
            </button>
          </div>
        </form>
      </div>
    </HomeLayout>
  );
}

export default Detail;

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
      is_admin: session.is_admin,
    },
    headers: {
      Cookie: cookie,
    },
  });

  const countries = await clientAxios.get("/countriesRoute", {
    public_key: session.address,
    headers: {
      Cookie: cookie,
    },
  });

  const provinces = await clientAxios.get("/provinceRoute", {
    public_key: session.address,
    headers: {
      Cookie: cookie,
    },
  });

  return {
    props: {
      redeems: response.data,

      countries: countries.data,
      provinces: provinces.data,
    },
  };
}
