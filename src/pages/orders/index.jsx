import HomeLayout from "@/components/HomeLayout";
import Table from "@/components/Table";
import { getOrders } from "@/redux/actions/winaryActions";
import { getSession, useSession } from "next-auth/react";
import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
let flag = true;

const index = () => {
  const { t } = useTranslation();

  const session = useSession();

  const dispatch = useDispatch();

  useEffect(() => {
    if (session.status === "authenticated" && flag) {
      dispatch(getOrders(session.data.is_admin));
      flag = false;
    }

    console.log(orders);
  }, [session]);

  const orders = useSelector((state) => state.winaryAdress.orders);

  const columnas = [
    // { title: "", field: "acciones" },
    { title: t("creado"), field: "created_at" },
    { title: t("token"), field: "token" },
    { title: t("nombre"), field: "name" },
    { title: t("monto"), field: "amount" },
    { title: "Email", field: "email" },
  ];

  return (
    <HomeLayout>
      { <Table data={orders} columnas={columnas} n={50} />}
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

export default index;
