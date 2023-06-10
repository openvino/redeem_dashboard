import { useSession, signOut, getSession } from "next-auth/react";
import { Router, useRouter } from "next/router";
import { useState, useEffect } from "react";
import clientAxios from "@/config/clientAxios";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
function Detail({ redeems, profile, countries, provinces }) {
  const { t } = useTranslation();

  const router = useRouter();
  const { c_id } = router.query;
  const { register, handleSubmit, setValue } = useForm();
  const [countrieSelector, setCountrieSelector] = useState("");
  const [provinceSelector, setProvinceSelector] = useState("");

  const id = redeems.findIndex((r) => r.id === c_id);

  useEffect(() => {
    if (redeems.length > 0) {
      setValue("id", redeems[id]?.id, { shouldDirty: false });
      setValue("customer_id", redeems[id]?.customer_id, { shouldDirty: false });
      setValue("amount", redeems[id]?.amount, { shouldDirty: false });
      setValue("status", redeems[id]?.redeem_status, { shouldDirty: false });
      setValue("country_id", redeems[id]?.country_id, { shouldDirty: false });
      setValue("province_id", redeems[id]?.province_id, { shouldDirty: false });
      setCountrieSelector(redeems[id].country_id);
      setProvinceSelector(redeems[id].province_id);

      // Establece los valores de los demás campos deshabilitados aquí
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
      isLoading:true
    });
    try {
      

      const response = await clientAxios.put("/redeemRoute", {
        data,
      });

      toast.update(toastId, {
        isLoading:false,
        type: toast.TYPE.SUCCESS,
        render: "Redeem updated",
        autoClose: 5000,
      });
    } catch (error) {
      toast.update(toastId, {
        isLoading:false,
        type: toast.TYPE.ERROR,
        render: "Error ",
        autoClose: 5000,
      });
    }
    
  };

  
  const redeem = redeems[id];

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
      mt-[8rem]
      ml-[6rem]
      overflow-x-scroll
    "
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          {t('detalle')}
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
                value={redeem.id}
                {...register("id")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">{t('monto')}:</label>
              <input
                disabled
                type="text"
                id="amount"
                name="amount"
                value={redeem.amount}
                {...register("amount")}
                className="flex-1 px-2 py-1 disabled:bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">{t('nombre')}:</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={redeem.name}
                {...register("name")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Customer_id:</label>
              <input
                disabled
                type="text"
                id="customer_id"
                name="customer_id"
                defaultValue={redeem.customer_id}
                {...register("customer_id")}
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
                defaultValue={redeem.email}
                {...register("email")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Telegram:</label>
              <input
                type="text"
                id="telegram_id"
                name="telegram_id"
                defaultValue={redeem.telegram_id}
                {...register("telegram_id")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">{t('pais')}:</label>

              <select
                className="flex-1 md:w-[199px] px-2 py-1 border border-gray-300 rounded-md"
                defaultValue={redeem.country_id}
                onChange={(e) => {
                  //console.log(e.target.value);
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

            <div className="flex items-center">
              <label className="w-24 font-bold">{t('provincia')}:</label>
              <select
                name="province_id"
                className="flex-1 md:w-[199px] px-2 py-1 border border-gray-300 rounded-md"
                value={provinceSelector}
                onChange={(e) => {
                  setValue("province_id", e.target.value);
                  setProvinceSelector(e.target.value);
                }}
              >
                {provinces
                  .filter((province) =>
                    province.province_id.startsWith(countrieSelector + "-")
                  )
                  .map((province, id) => (
                    <option key={id} value={province.province_id}>
                      {province.place_description}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">{t('calle')}:</label>
              <input
                type="text"
                id="street"
                name="street"
                defaultValue={redeem.street}
                {...register("street")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">{t('numero')}:</label>
              <input
                type="text"
                id="number"
                name="number"
                defaultValue={redeem.number}
                {...register("number")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">{t('cp')}:</label>
              <input
                type="text"
                id="zip"
                name="zip"
                defaultValue={redeem.zip}
                {...register("zip")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Token:</label>
              <input
                type="text"
                id="year"
                name="year"
                defaultValue={redeem.year}
                {...register("year")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">{t('creado')}:</label>
              <input
                disabled
                type="text"
                id="created_at"
                name="created_at"
                defaultValue={redeem.created_at.substring(0, 10)}
                className="flex-1 px-2 py-1 border disabled:bg-gray-200 border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center">
              <label className="w-24 font-bold" htmlFor="status">
              {t('estado')}
              </label>
              <select
                id="status"
                name="status"
                defaultValue={redeem.redeem_status} // Set the value here
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                {...register("status")}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                router.push("/");
              }}
              className="px-4 py-2  bg-gray-300 text-gray-800 rounded-md"
            >
             {t('volver')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 ml-4 bg-[#840C4A] text-white rounded-md"
            >
              {t('guardar')}
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

  const response = await clientAxios.get("/redeemRoute", {
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
      profile: profile.data,
      countries: countries.data,
      provinces: provinces.data,
    },
  };
}
