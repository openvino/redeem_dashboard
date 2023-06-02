import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import { useState } from "react";

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

  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenColumna, setOrdenColumna] = useState(null);
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const elementosPorPagina = 10;

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    const totalPaginas = Math.ceil(data.length / elementosPorPagina);
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const handleOrdenarColumna = (columna) => {
    if (ordenColumna === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenColumna(columna);
      setOrdenAscendente(true);
    }
  };

  const ordenarDatos = () => {
    if (ordenColumna) {
      return [...data].sort((a, b) => {
        const valorA = a[ordenColumna];
        const valorB = b[ordenColumna];
        if (valorA < valorB) {
          return ordenAscendente ? -1 : 1;
        }
        if (valorA > valorB) {
          return ordenAscendente ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  };

  const ordenarDatosPaginados = () => {
    const datosOrdenados = ordenarDatos();
    const totalPaginas = Math.ceil(datosOrdenados.length / elementosPorPagina);
    const paginaValida = Math.max(1, Math.min(paginaActual, totalPaginas));
    const indiceInicial = (paginaValida - 1) * elementosPorPagina;
    const indiceFinal = indiceInicial + elementosPorPagina;
    return datosOrdenados.slice(indiceInicial, indiceFinal);
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
                onClick={() => handleOrdenarColumna(columna.field)}
              >
                {columna.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ordenarDatosPaginados().map((fila, index) => (
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
      <div>
        <button onClick={handlePaginaAnterior} disabled={paginaActual === 1}>
          Anterior
        </button>
        <button
          onClick={handlePaginaSiguiente}
          disabled={
            paginaActual === Math.ceil(data.length / elementosPorPagina)
          }
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Table;
