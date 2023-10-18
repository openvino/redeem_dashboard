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
import { useDispatch } from "react-redux";
import { getRedeems, getWinarys } from "@/redux/actions/winaryActions";
import Head from "next/head";
let winary;
function Detail({ winarys }) {
  const { t } = useTranslation();
  const session = useSession();
  const [id, setId] = useState("");
  const [isAdminSelect, setIsAdminSelect] = useState(false);

  const router = useRouter();
  let { c_id } = router.query;

  const { register, handleSubmit, setValue } = useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (c_id === "newWinary") {
    } else {
      setId(winarys.findIndex((r) => r.id === c_id));
    }
  }, []);

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

    if (c_id === "newWinary") {
      try {
        const response = await clientAxios.post("/winarysRoute", {
          data,
        });

        toast.update(toastId, {
          isLoading: false,
          type: toast.TYPE.SUCCESS,
          render: "Winary updated",
          autoClose: 5000,
        });

        setTimeout(() => {
          router.back();
        }, 3000);
      } catch (error) {
        toast.update(toastId, {
          isLoading: false,
          type: toast.TYPE.ERROR,
          render: "Error ",
          autoClose: 5000,
        });
      }
    } else {
      try {
        const response = await clientAxios.put("/winarysRoute", {
          data,
        });

        toast.update(toastId, {
          isLoading: false,
          type: toast.TYPE.SUCCESS,
          render: "Winary updated",
          autoClose: 5000,
        });

        setTimeout(() => {
          router.back();
        }, 3000);
      } catch (error) {
        toast.update(toastId, {
          isLoading: false,
          type: toast.TYPE.ERROR,
          render: "Error ",
          autoClose: 5000,
        });
      }
    }
  };

  winary = winarys[id];

  useEffect(() => {
    if (winary) {
      setValue("id", winary.id, { shouldDirty: false });
      setValue("created_at", winary.created_at, { shouldDirty: false });
      setValue("updated_at", winary.updated_at, { shouldDirty: false });
      setValue("name", winary.name, { shouldDirty: false });
      setValue("website", winary.website, { shouldDirty: false });
      setValue("image", winary.image, { shouldDirty: false });
      setValue("secret", winary.secret, { shouldDirty: false });
      setValue("public_key", winary.public_key, { shouldDirty: false });
      setValue("email", winary.email, { shouldDirty: false });
      setValue("primary_color", winary.primary_color, {
        shouldDirty: false,
      });
    }
  }, [winary]);

  useEffect(() => {
    if (session.data?.is_admin) dispatch(getWinarys(session.data.is_admin));
  }, [session]);

  return (
    <>
      <Head>
        <title>OpenVino - Winery Detail</title>
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
      <Topbar />
      <Sidebar />
      <div
        className="
      
      z-1
      mt-[10rem]
      ml-[6rem]
      overflow-x-scroll
      lg:overflow-x-hidden
    "
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          {t("detalle_de_la_vinería")}
        </h1>

        <form
          className=" p-2 space-y-2 flex flex-col bg-[#f4f4f5] w-[99%] border-solid border-gray-200 border-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
            <div className="flex items-center">
              <label className="w-24 font-bold">Id:</label>
              <input
                required
                disabled
                type="text"
                id="id"
                name="id"
                value={winary?.id}
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
                defaultValue={winary?.name}
                {...register("name")}
                className="w-64 px-2 py-1 disabled:bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">{t("Website")}:</label>
              <input
                required
                type="text"
                id="website"
                name="website"
                defaultValue={winary?.website}
                {...register("website")}
                className="w-64 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">{t("imagen")}:</label>
              <input
                required
                type="text"
                id="image"
                name="image"
                defaultValue={winary?.image}
                {...register("image")}
                className="w-64 px-2 py-1 border disabled:bg-gray-200 border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">Email:</label>
              <input
                required
                type="email"
                id="email"
                name="email"
                defaultValue={winary?.email}
                {...register("email")}
                className="w-64 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">{t("primary_color")}:</label>
              <input
                required
                type="color"
                id="primary_color"
                name="primary_color"
                defaultValue={winary?.primary_color}
                onChange={(e) => setValue("primary_color", e.target.value)}
                {...register("primary_color")}
                className="w-64  px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex justify-start ">
              <label className="w-24 font-bold">Secret</label>
              <input
                type="text"
                id="secret"
                name="secret"
                defaultValue={winary?.secret}
                {...register("secret")}
                className="w-64 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-center w-[22rem] "></div>
          </div>

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
              type="submit"
              className="px-4 py-2 ml-4 bg-[#840C4A] text-white rounded-md"
            >
              {t("guardar")}
            </button>
          </div>
        </form>
      </div>
    </>
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

  const response = await clientAxios.get("/winarysRoute", {
    params: {
      is_admin: session.is_admin,
    },
    headers: {
      Cookie: cookie,
    },
  });

  return {
    props: { winarys: response.data },
  };
}
