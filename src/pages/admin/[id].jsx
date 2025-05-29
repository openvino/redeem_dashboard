import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAdmins from "@/hooks/useAdmins";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useProfile from "@/hooks/useProfile";
import useWineries from "@/hooks/useWineries";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clientAxios from "@/config/clientAxios";
import HomeLayout from "@/components/HomeLayout";
import FormField from "@/components/FormField";

const AdminUser = () => {
  const router = useRouter();
  const { id } = router.query;
  const { admins } = useAdmins(id);
  const { wineries } = useWineries();
  const { profile } = useProfile();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      id: "",
      name: "",
      last_name: "",
      winery_id: "",
      email: "",
      profile_img: "",
      is_admin: "false",
    },
  });
  const { t } = useTranslation();
  const [loading, setLoading] = useState();

  useEffect(() => {
    if (admins) {
      reset({
        id: admins.id || "",
        name: admins.name || "",
        last_name: admins.last_name || "",
        winery_id: admins.winery_id || "",
        email: admins.email || "",
        profile_img: admins.profile_img || "",
        is_admin: admins.is_admin ? "true" : "false",
      });
    }
  }, [admins, reset]);
  const onSubmit = async (data) => {

    

    const toastId = toast("Updating winary data...", {
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
      const response = await clientAxios.put("/adminRoute", {
        data,
        previd: admins.id,
      });

      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.SUCCESS,
        render: "Admin updated success",
        autoClose: 5000,
      });
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


  const handleDeleteAdmin = async () => {
    const toastId = toast("Deleting admin...", {
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
      await clientAxios.delete("/adminRoute", {
        params: {
          id,
        },
      });
      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.SUCCESS,
        render: "Admin deleted successfully",
        autoClose: 5000,
      });

      router.back();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <HomeLayout>
      <Head>
        <title>Openvino - Admin info</title>
      </Head>

      <ToastContainer />
      <div className=" w-full overflow-x-scrolllg: overflow-x-hidden">
        <div className="">
          <h1 className="text-2xl font-bold text-center mb-4">
            {t("edit_admin")}
          </h1>

          <form
            className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label={t("clave")}
                {...register("id")}
              />
              <FormField
                label={t("nombre")}
                {...register("name")}
              />
            </div>

            {/* Apellido + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label={t("apellido")}
                {...register("last_name")}
              />
              <FormField
                label="Email:"
                {...register("email")}
              />
            </div>

            {/* Imagen de perfil + Bodega (condicional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label={t("imagenPerfil")}
                {...register("profile_img")}
              />

              {profile?.is_admin === true ? (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    {t("bodega")}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#840C4A]"
                    {...register("winery_id")}
                  >
                    <option>{t("select")}</option>
                    {wineries?.map((element, index) => (
                      <option key={index} value={element.id}>
                        {element.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="w-full h-0" />
              )}
            </div>

            {/* es_admin (condicional) */}
            {profile?.is_admin === true && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    {t("es_admin")}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#840C4A]"
                    {...register("is_admin")}
                  >
                    <option>{t("select")}</option>
                    <option value={"true"}>{t("SI")}</option>
                    <option value={"false"}>No</option>
                  </select>
                </div>
                <div className="w-full h-0" />
              </div>
            )}

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
              <button
                type="button"
                className="px-4 py-2 ml-4 bg-red-600 text-white rounded-md"
                onClick={handleDeleteAdmin}
              >
                Eliminar
              </button>
            </div>
          </form>
        </div>
      </div>
    </HomeLayout>
  );
};

export default AdminUser;
