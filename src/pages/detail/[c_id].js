import { useSession, signOut, getSession } from "next-auth/react";
import { Router, useRouter } from "next/router";
import { useState, useEffect } from "react";
import clientAxios from "@/config/clientAxios";
import { useForm } from "react-hook-form";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
function Detail({ redeems, profile }) {
  const router = useRouter();
  const { c_id } = router.query;
  console.log(c_id);
  const [statusSelector, setStatusSelector] = useState("");
  const { register, handleSubmit, setValue } = useForm();

  console.log(redeems);
  const id = redeems.findIndex((r) => r.id === c_id);
  useEffect(() => {
    setStatusSelector(redeems[id].redeem_status);
  }, [id]);

  const onSubmit = async (data) => {
    const redeemId = data.id;
    const status = data.status;
    console.log(data.status);
    try {
      const response = await clientAxios.put("/redeemRoute", {
        redeemId,
        status,
      });
      alert("Cambios guardados");
    } catch (error) {
      console.log(error.message);
      alert("Error: No se pudo actualizar el Redeem");
    }
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
      <h1 className="text-2xl font-bold text-center mb-4">Detalle del Redeem</h1>

      <form className="space-y-2 flex justify-center flex-col" onSubmit={handleSubmit(onSubmit)}>
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
              type="text"
              id="amount"
              name="amount"
              value={redeem.amount}
              {...register("amount")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
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
              type="text"
              id="customer_id"
              name="customer_id"
              value={redeem.customer_id}
              {...register("customer_id")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
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
              l
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10">
          <div className="flex items-center">
            <label className="w-24 font-bold">País:</label>
            <input
              type="text"
              id="country_id"
              name="country_id"
              value={redeem.country_id}
              {...register("country_id")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center">
            <label className="w-24 font-bold">Provincia:</label>
            <input
              type="text"
              id="province_id"
              name="province_id"
              value={redeem.province_id}
              {...register("province_id")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
            />
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
              value={statusSelector}
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

  const countries = await clientAxios.post("/loginRoute", {
    public_key: session.address,
    headers: {
      Cookie: cookie,
    },
  });

  return {
    props: { redeems: response.data, profile: profile.data },
  };
}
