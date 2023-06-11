import { useSession, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import clientAxios from "@/config/clientAxios";
import { useForm } from "react-hook-form";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useDispatch } from "react-redux";
import { getRedeems } from "@/redux/actions/winaryActions";

function Detail({ redeems, profile, countries, provinces }) {
  const router = useRouter();
  const { c_id } = router.query;
  const [statusSelector, setStatusSelector] = useState("");
  const { register, handleSubmit, setValue } = useForm();
  const [countrieSelector, setCountrieSelector] = useState("");
  const [provinceSelector, setProvinceSelector] = useState("");
  const id = redeems.findIndex((r) => r.id === c_id);
  const dispatch = useDispatch();

  useEffect(() => {
    setStatusSelector(redeems[id].redeem_status);
    dispatch(getRedeems());
  }, [id]);

  useEffect(() => {
    if (redeems.length > 0) {
      setCountrieSelector(redeems[id].country_id);
      setProvinceSelector(redeems[id].province_id);
    }
  }, [redeems]);

  const onSubmit = async (data) => {
    // const redeemId = data.id;
    // const status = data.status;
    // try {
    //   const response = await clientAxios.put("/redeemRoute", {
    //     redeemId,
    //     status,
    //   });
    //   window.alert("Cambios guardados");
    // } catch (error) {
    //   console.log(error.message);
    //   alert("Error: No se pudo actualizar el Redeem");
    // }
  };
  const redeem = redeems[id];

  return (
    <>
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
          Detalle del Redeem
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
                defaultValue={redeem.id}
                {...register("id")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Monto:</label>
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
              <label className="w-24 font-bold">Nombre:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={redeem.name}
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
                value={redeem.customer_id}
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
                value={redeem.email}
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
                value={redeem.telegram_id}
                {...register("telegram_id")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">País:</label>

              <select
                className="flex-1 md:w-[199px] px-2 py-1 border border-gray-300 rounded-md"
                value={countrieSelector}
                onChange={(e) => {
                  setCountrieSelector(e.target.value);
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
              <label className="w-24 font-bold">Provincia:</label>
              <select
                className="flex-1 md:w-[199px] px-2 py-1 border border-gray-300 rounded-md"
                value={provinceSelector}
                onChange={(e) => {
                  console.log(e.target.value);
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
              <label className="w-24 font-bold">Calle:</label>
              <input
                type="text"
                id="street"
                name="street"
                value={redeem.street}
                {...register("street")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Número:</label>
              <input
                type="text"
                id="number"
                name="number"
                value={redeem.number}
                {...register("number")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">Código postal:</label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={redeem.zip}
                {...register("zip")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 font-bold">Año:</label>
              <input
                type="text"
                id="year"
                name="year"
                value={redeem.year}
                {...register("year")}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
            <div className="flex items-center">
              <label className="w-24 font-bold">Creado:</label>
              <input
                disabled
                type="text"
                id="created_at"
                name="created_at"
                value={redeem.created_at.substring(0, 10)}
                {...register("created_at")}
                className="flex-1 px-2 py-1 border disabled:bg-gray-200 border-gray-300 rounded-md"
              />
            </div>
            {/* <div className="flex">
            <label className="w-26 font-bold">Actualizado:</label>
            <input
              type="text"
              id="updated_at"
              name="updated_at"
              value={redeem.updated_at.substring(0, 10)}
              {...register("updated_at")}
              className="flex-1 px-2  py-1 border border-gray-300 rounded-md"
            />
          </div> */}
            {/* </div> */}
            <div className="flex items-center">
              <label className="w-24 font-bold" htmlFor="status">
                Estado:
              </label>
              <select
                id="status"
                name="status"
                onChange={(e) => {
                  const selectedStatus = e.target.value;
                  setStatusSelector(selectedStatus);
                  setValue("status", selectedStatus);
                }}
                value={statusSelector} // Set the value here
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
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
              Volver
            </button>
            <button
              type="submit"
              className="px-4 py-2 ml-4 bg-[#840C4A] text-white rounded-md"
            >
              Guardar
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
