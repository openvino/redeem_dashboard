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
import { getRedeems } from "@/redux/actions/winaryActions";
let winary;
function Detail({ winarys, profile }) {
  const { t } = useTranslation();

  const router = useRouter();
  let { c_id } = router.query;
  // useEffect(() => {
  //   if (c_id === "newWinary") winary.id = "nueva bodega";
  // });
  c_id = "costaflores";
  const { register, handleSubmit, setValue } = useForm();
  // const [countrieSelector, setCountrieSelector] = useState("");
  // const [provinceSelector, setProvinceSelector] = useState("");
  // const [statusSelector, setStatusSelector] = useState("");
  if (c_id === "newWinary") {
  } else {
    const id = winarys.findIndex((r) => r.id === c_id);
  }

  const dispatch = useDispatch();

  // useEffect(() => {
  //   // dispatch(getRedeems());
  // }, [id]);

  useEffect(() => {
    if (winarys.length > 0) {
      setValue("id", winarys[id]?.id, { shouldDirty: false });
      setValue("created_at", winarys[id]?.created_at, { shouldDirty: false });
      setValue("updated_at", winarys[id]?.updated_at, { shouldDirty: false });
      setValue("name", winarys[id]?.name, { shouldDirty: false });
      setValue("website", winarys[id]?.website, { shouldDirty: false });
      setValue("image", winarys[id]?.image, { shouldDirty: false });
      setValue("primary_color", winarys[id]?.primary_color, {
        shouldDirty: false,
      });

      setValue("isAdmin", winarys[id]?.isAdmin, { shouldDirty: false });
    }
  }, [winarys]);

  const onSubmit = async (data) => {
    console.log(data);

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

  if (c_id === "newWinary") {
    winary = {
      id: "",
      created_at: "",
      amount: "",
      country_id: "",
      deleted_at: "",
      name: "",
      email: "",
      website: "",
      image: "",
      primary_color: "",
      secret: "",
      public_key: "",
      isAdmin: false,
    };
  } else {
    winary = winarys[c_id];
  }

  // useEffect(() => {
  //   const setTrue = async () => {
  //     await clientAxios.post("/notificationRoute", {
  //       id: redeem.id,
  //     });
  //     dispatch(getRedeems());
  //   };
  //   setTrue();
  // }, [redeem]);
  console.log(winary);
  return (
    <>
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
      <Topbar profile={profile} />
      <Sidebar />
      <div
        className="
      z-1
      mt-[10rem]
      ml-[6rem]
      overflow-x-scroll
    "
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          {t("Detalle de la vinería")}
        </h1>

        <form
          className="space-y-2 flex justify-center flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
            <div className="flex items-center">
              <label className="w-24 font-bold">Id:</label>
              <input
                disabled
                type="text"
                id="id"
                name="id"
                value={winary?.id}
                {...register("id")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">{t("Nombre")}:</label>
              <input
                disabled
                type="text"
                id="name"
                name="name"
                value={winary?.name}
                {...register("name")}
                className="flex-1 px-2 py-1 disabled:bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">{t("Sitio web")}:</label>
              <input
                type="text"
                id="website"
                name="website"
                defaultValue={winary?.website}
                {...register("website")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Imagen:</label>
              <input
                disabled
                type="text"
                id="image"
                name="image"
                defaultValue={winary?.image}
                {...register("image")}
                className="flex-1 px-2 py-1 border disabled:bg-gray-200 border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">Email:</label>
              <input
                type="text"
                id="email"
                name="email"
                defaultValue={winary?.email}
                {...register("email")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Clor Primario:</label>
              <input
                type="text"
                id="primary_color"
                name="primary_color"
                defaultValue={winary?.primary_color}
                {...register("primary_color")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <div className="flex items-center">
                <label className="w-24 font-bold">Secret</label>
                <input
                  type="text"
                  id="secret"
                  name="secret"
                  defaultValue={winary?.secret}
                  {...register("secret")}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Clave pública</label>
              <input
                type="text"
                id="public_key"
                name="public_key"
                defaultValue={winary?.public_key}
                {...register("public_key")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center left-[50%]">
              <label className="w-24 font-bold" htmlFor="isAdmin">
                {t("Es admin")}
              </label>
              <select
                id="isAdmin"
                name="isAdmin"
                defaultValue={winary?.isAdmin}
                className=" px-2 py-1 border border-gray-300 rounded-md w-[2rem]"
                {...register("isAdmin")}
              >
                <option value="true">Si</option>
                <option value="false">No</option>
              </select>
            </div>
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
    props: { winarys: response.data, profile: profile.data },
  };
}
