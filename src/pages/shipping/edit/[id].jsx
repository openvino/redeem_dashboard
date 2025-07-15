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

const EditShipping = () => {
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const router = useRouter();
  const { id } = router.query;
  const { tokens } = useTokenShippingById(id);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      id: "",
      token_id: "",
      province_id: "",
      base_cost: "",
      cost_per_unit: "",
      active: "",
    },
  });

  useEffect(() => {
    if (tokens) {
      reset({
        id: tokens.id || "",
        token_id: tokens.token_id || "",
        province_id: tokens.province_id || "",
        base_cost: tokens.base_cost || "",
        cost_per_unit: tokens.cost_per_unit || "",
        active: tokens.active || "",
      });
    }
  }, [tokens, reset]);

  const onSubmit = async (data) => {
    console.log(data);

    if (
      !data.province_id ||
      !data.base_cost ||
      !data.cost_per_unit ||
      !data.active
    ) {
      return toast.error("All fields are required");
    }

    const toastId = toast("Updating shipping data...", {
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
      setLoading(true);
      await clientAxios.put("/tokenShippingRoute", {
        data,
      });

      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.SUCCESS,
        render: "Shipping updated success",
        autoClose: 5000,
      });

      return router.back();
    } catch (error) {
      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.ERROR,
        render: "Error ",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <Head>
        <title>Openvino - Edit Shipping</title>
      </Head>

      <div>
        <form
          className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={t("id")} {...register("id")} disabled />
            <FormField
              label={t("token_id")}
              {...register("token_id")}
              disabled
            />
          </div>

          {/* Apellido + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("province_id")}
              {...register("province_id")}
              disabled
            />
            <FormField
              label={t("base_cost")}
              type="number"
              {...register("base_cost")}
            />
          </div>

          {/* Imagen de perfil + Bodega (condicional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("cost_per_unit")}
              type="number"
              {...register("cost_per_unit")}
            />
            <FormField label={t("active")} {...register("active")} />
          </div>

          {/* Botones */}
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

export default EditShipping;
