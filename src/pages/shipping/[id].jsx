import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAdmins from "@/hooks/useAdmins";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useProfile from "@/hooks/useProfile";
import useWineries from "@/hooks/useWineries";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clientAxios from "@/config/clientAxios";

const AdminUser = () => {
  const router = useRouter();

  const { id } = router.query;

  const { admins } = useAdmins(id);

  const { wineries } = useWineries();

  const { profile } = useProfile();

  const { register, handleSubmit, setValue } = useForm();

  const { t } = useTranslation();

  const [loading, setLoading] = useState();

  useEffect(() => {
    if (admins) {
      setValue("id", admins.id, { shouldDirty: false });
      setValue("name", admins.name, { shouldDirty: false });
      setValue("last_name", admins.last_name, { shouldDirty: false });
      setValue("winery_id", admins.winery_id, { shouldDirty: false });
      setValue("email", admins.email, { shouldDirty: false });

      setValue("profile_img", admins.profile_img, { shouldDirty: false });
      setValue("is_admin", admins.is_admin == true ? "true" : "false", {
        shouldDirty: false,
      });
    }
  }, [admins]);
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
      const response = await clientAxios.delete("/adminRoute", {
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
    <>
      <Head>
        <title>Openvino - Admin info</title>
      </Head>
      <Topbar />

      <Sidebar />
      <ToastContainer />
      <div className="z-1 mt-[10rem] ml-[6rem] w-full overflow-x-scrolllg: overflow-x-hidden">
        <div className="">
          <h1 className="text-2xl font-bold text-center mb-4">
            {t("edit_admin")}
          </h1>

          <form
            className=" p-2 space-y-2 flex flex-col bg-[#F1EDE2] w-[99%] border-solid rounded-xl border-gray-200 border-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
              <div className="flex items-center">
                <label className="w-24 font-bold">{t("clave")}</label>
                <input
                  required
                  type="text"
                  defaultValue={admins?.id}
                  id="id"
                  name="id"
                  {...register("id")}
                  className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold">{t("nombre")}:</label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  {...register("name")}
                  className="w-64 px-2 py-1 disabled:bg-gray-200 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
              <div className="flex items-center">
                <label className="w-24 font-bold">{t("apellido")}</label>
                <input
                  required
                  type="text"
                  id="last_name"
                  defaultValue={admins?.last_name}
                  name="last_name"
                  {...register("last_name")}
                  className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold">Email:</label>
                <input
                  required
                  type="text"
                  id="email"
                  defaultValue={admins?.email}
                  name="email"
                  {...register("email")}
                  className="w-64 px-2 py-1 disabled:bg-gray-200 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
              <div className="flex items-center">
                <label className="w-24 font-bold">{t("imagenPerfil")}</label>
                <input
                  required
                  defaultValue={admins?.profile_img}
                  type="text"
                  id="profile_img"
                  name="profile_img"
                  {...register("profile_img")}
                  className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                />
              </div>

              {profile?.is_admin === true ? (
                <div className="flex items-center">
                  <label className="w-24 font-bold">{t("bodega")}</label>

                  <select
                    className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                    defaultValue={admins?.winery_id}
                    name="winery_id"
                    id="winery_id"
                    {...register("winery_id")}
                  >
                    <option>{t("select")}</option>

                    {wineries &&
                      wineries.map((element, index) => (
                        <option key={index} value={element.id}>
                          {element.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="flex justify-center w-[22rem] "></div>
              )}
            </div>

            {profile?.is_admin === true && (
              <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
                <div className="flex items-center">
                  <label className="w-24 font-bold">{t("es_admin")}</label>

                  <select
                    className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                    name="is_admin"
                    id="is_admin"
                    {...register("is_admin")}
                  >
                    <option>{t("select")}</option>
                    <option value={"true"}>{t("SI")}</option>
                    <option value={"false"}>No</option>
                  </select>
                </div>

                <div className="flex justify-center w-[22rem] "></div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  router.back();
                }}
                className="px-4 py-2  bg-gray-300 text-gray-800 rounded-md"
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
    </>
  );
};

export default AdminUser;
