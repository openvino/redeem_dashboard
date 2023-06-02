import React from "react";
import { FaPencilAlt } from "react-icons/fa";

const Table = () => {
  const columnas = [
    {
      title: "",
      field: "acciones",
    },
    {
      title: "Artista",
      field: "artista",
    },
    {
      title: "País de origen",
      field: "pais",
    },
    {
      title: "Géneros",
      field: "genero",
    },
    {
      title: "Ventas estimadas en millones",
      field: "ventas",
      type: "numeric",
    },
    {
      title: "Status",
      field: "status",
    },
  ];

  const data = [
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
    {
      artista: "Charly Garcia",
      pais: "Argentina",
      genero: "Rock",
      ventas: 100,
      status: "success",
    },
    {
      artista: "The Beatles",
      pais: "England",
      genero: "Rock",
      ventas: 1000,
      status: "pending",
    },
    {
      artista: "Fito Paez",
      pais: "Argentina",
      genero: "Rock",
      ventas: 500,
      status: "rejected",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-100">
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna.field}
                className="px-6 py-3 bg-[#840C4A] text-left text-xs text-white font-medium uppercase tracking-wider"
              >
                {columna.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((fila, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              {columnas.map((columna) => {
                if (columna.field === "acciones") {
                  return (
                    <td
                      key={columna.field}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      <FaPencilAlt className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                    </td>
                  );
                }

                if (columna.field === "status") {
                  return (
                    <td
                      key={columna.field}
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(
                        fila[columna.field]
                      )}`}
                    >
                      {fila[columna.field]}
                    </td>
                  );
                }

                return (
                  <td
                    key={columna.field}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {fila[columna.field]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
