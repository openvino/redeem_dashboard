import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Table from "../components/Table";
import { dataFormater } from "../utils/dataFormater.js";
import clientAxios from "../config/clientAxios";
import { useDispatch, useSelector } from "react-redux";
import Chart from "chart.js/auto";
import Head from "next/head.js";

import { getRedeems } from "@/redux/actions/winaryActions";

const Dashboard = ({ redeemsState, profile }) => {
  const filters = useSelector((state) => state.filter);

  useEffect(() => {
    dispatch(getRedeems());
  }, []);

  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const polarChartRef = useRef(null);

  const redeems = useSelector((state) => state.winaryAdress.redeems);

  useEffect(() => {
    const chartLabels = [];
    const chartData = {};

    // Obtener las fechas de los últimos 7 meses
    const currentDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      chartLabels.push(date.toLocaleString("default", { month: "long" })); // Obtener el nombre del mes
    }

    // Contar los redeems por fecha
    chartLabels.forEach((label) => {
      const redeemCount = redeems.filter((redeem) => {
        const redeemDate = new Date(redeem.created_at);
        return (
          redeemDate.toLocaleString("default", { month: "long" }) === label &&
          redeemDate.getFullYear() === currentDate.getFullYear()
        );
      }).length;
      chartData[label] = redeemCount;
    });

    // Configurar el gráfico
    const chartConfig = {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Redeems",
            data: Object.values(chartData),
            backgroundColor: "rgba(245, 39, 84, 0.8)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      },
    };

    // Crear el gráfico usando Chart.js
    const chart = new Chart(chartRef.current, chartConfig);

    // Limpiar el gráfico al desmontar el componente
    return () => {
      chart.destroy();
    };
  }, [redeems]);

  useEffect(() => {
    const chartLabels = [];
    const chartData = [];

    // Obtener los últimos 7 años
    const currentYear = new Date().getFullYear();
    for (let i = 6; i >= 0; i--) {
      const year = currentYear - i;
      chartLabels.push(year.toString());
    }

    // Contar los redeems por año
    chartLabels.forEach((label) => {
      const redeemCount = redeems.filter((redeem) => {
        const redeemDate = new Date(redeem.created_at);
        return redeemDate.getFullYear().toString() === label;
      }).length;
      chartData.push(redeemCount);
    });

    // Configurar el gráfico
    const polarChartConfig = {
      type: "polarArea",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Redeems",
            data: chartData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
              "rgba(153, 102, 255, 0.8)",
              "rgba(255, 159, 64, 0.8)",
              "rgba(255, 99, 132, 0.8)",
            ],
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
          },
        },
      },
    };

    // Crear el gráfico usando Chart.js
    const polarChart = new Chart(polarChartRef.current, polarChartConfig);

    // Limpiar el gráfico al desmontar el componente
    return () => {
      polarChart.destroy();
    };
  }, [redeems]);

  const columnas = [
    {
      title: "",
      field: "acciones",
    },
    // {
    //   title: "Id",
    //   field: "id",
    // },
    // {
    //   title: "Cliente",
    //   field: "customer_id",
    // },
    {
      title: "Nombre",
      field: "name",
    },
    {
      title: "Monto",
      field: "amount",
    },
    {
      title: "País",
      field: "country_id",
    },
    {
      title: "Provincia",
      field: "province_id",
    },

    // {
    //   title: "Actualizado",
    //   field: "updated_at",
    // },
    // {
    //   title: "Borrado",
    //   field: "deleted_at",
    // },
    {
      title: "Email",
      field: "email",
    },

    // {
    //   title: "Calle",
    //   field: "street",
    // },
    // {
    //   title: "Número",
    //   field: "number",
    // },

    // {
    //   title: "Telegram_ID",
    //   field: "telegram_id",
    // },

    // {
    //   title: "Vinería",
    //   field: "winerie_id",
    // },
    {
      title: "Año",
      field: "year",
    },
    {
      title: "CP",
      field: "zip",
    },
    {
      title: "Creado",
      field: "created_at",
    },
    {
      title: "Estado",
      field: "status",
    },
  ];

  const filterData = (data) => {
    if (filters.filter) {
      const searchString = filters.filter.toLowerCase();

      return data.filter((obj) =>
        Object.values(obj).some((value) =>
          String(value).toLowerCase().includes(searchString)
        )
      );
    } else {
      return data;
    }
  };

  const data = filterData(dataFormater(redeems));

  const [{ data: accountData }, disconnect] = useAccount();

  const session = useSession();
  console.log(session);

  return (
    <>
      <Head>
        <title>OpenVino - Dashboard</title>
      </Head>
      <div className="flex flex-col ">
        <Sidebar />
        <Topbar profile={profile} />

        <div className=" ml-12 md:ml-24 top-4">
          <Table data={data} columnas={columnas} n={5} />
          {/* <button className="bg-green-900" onClick={handleNoti}>
          noti
  </button>*/}
          <div className="flex flex-col lg:flex-row gap-2 min-h-screen">
            {/* Gráfico de barras */}
            <div className="w-full ml-[6rem] mx-auto lg:w-1/2 ">
              <h2 className="text-center">Estadisticas mensuales</h2>
              <canvas ref={chartRef} />
            </div>

            {/* Gráfico de área polar */}
            <div className="w-full ml-[6rem] mx-auto lg:w-1/2 ">
              <h2 className="text-center">Estadistica Anuales</h2>
              <canvas ref={polarChartRef} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

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

  return {
    props: { redeemsState: response.data, profile: profile.data },
  };
}
