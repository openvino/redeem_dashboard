import React, { useEffect, useState } from "react";
import Head from "next/head";
import HomeLayout from "@/components/HomeLayout";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import useTokenShippingById from "@/hooks/useTokenShippingById";
import FormField from "@/components/FormField";
import { toast } from "react-toastify";
import clientAxios from "@/config/clientAxios";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { getCountries } from "@/redux/actions/winaryActions";

const EditShipping = () => {
  const [loading, setLoading] = useState(false);
  const [stockZones, setStockZones] = useState([]);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const countriesRaw = useSelector((s) => s.winaryAdress.countries);
  const countries = Array.isArray(countriesRaw) ? countriesRaw : [];
  const router = useRouter();
  const { id } = router.query;
  const { tokens } = useTokenShippingById(id);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      id: "",
      token_id: "",
      province_id: "",
      base_cost: "",
      cost_per_unit: "",
      active: "",
      stock_country: "",
    },
  });

  useEffect(() => {
    if (!countries.length) dispatch(getCountries());
  }, []);

  useEffect(() => {
    if (tokens) {
      reset({
        id: tokens.id || "",
        token_id: tokens.token_id || "",
        province_id: tokens.province_id || "",
        base_cost: tokens.base_cost || "",
        cost_per_unit: tokens.cost_per_unit || "",
        active: tokens.active || "",
        stock_country: tokens.stock_country || "",
      });
      Promise.all([
        clientAxios.get(`/tokenStockByCountryRoute?token_id=${tokens.token_id}`),
        clientAxios.get(`/tokenShippingRoute?tokenId=${tokens.token_id}`),
      ])
        .then(([stockRes, zonesRes]) => {
          const dbZones = Array.isArray(stockRes.data) ? stockRes.data : [];
          const shippingZones = Array.isArray(zonesRes.data) ? zonesRes.data : [];
          const inferred = [...new Set(
            shippingZones.map((z) => z.province_id?.split("-")[0]).filter(Boolean)
          )];
          const merged = [...dbZones];
          inferred.forEach((cid) => {
            if (!merged.find((r) => r.country_id === cid)) {
              merged.push({ country_id: cid, stock: 0 });
            }
          });
          setStockZones(merged);
          // Re-apply stock_country value now that options exist in DOM
          setValue("stock_country", tokens.stock_country || "");
        })
        .catch(() => {});
    }
  }, [tokens, reset]);

  const onSubmit = async (data) => {
    if (!data.province_id) {
      return toast.error("province_id is required");
    }

    try {
      setLoading(true);
      await clientAxios.put("/tokenShippingRoute", { data });
      router.back();
    } catch {
      toast.error("Error al guardar");
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <Head><title>Openvino - Edit Shipping</title></Head>
      <div>
        <form
          className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={t("id")} {...register("id")} disabled />
            <FormField label={t("token_id")} {...register("token_id")} disabled />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={t("province_id")} {...register("province_id")} disabled />
            <FormField label={t("base_cost")} type="number" {...register("base_cost")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={t("cost_per_unit")} type="number" {...register("cost_per_unit")} />
            <FormField label={t("active")} {...register("active")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("zona_stock")}
              </label>
              <select
                {...register("stock_country")}
                className="w-full mt-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#840C4A]"
              >
                <option value="">{t("select")}</option>
                {stockZones.map((z) => {
                  const country = countries.find((c) => c.country_id === z.country_id);
                  return (
                    <option key={z.country_id} value={z.country_id}>
                      {z.country_id}{country ? ` — ${country.place_description}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
            >
              {t("volver")}
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-4 py-2 ml-4 bg-[#840C4A] text-white rounded-md"
            >
              {t("guardar")}
            </button>
          </div>
        </form>
      </div>
    </HomeLayout>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
}

export default EditShipping;
