import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import {
  MdSkipNext,
  MdSkipPrevious,
  MdNavigateNext,
  MdNavigateBefore,
} from "react-icons/md";
import { useState } from "react";

const Table = ({ data, columnas }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenColumna, setOrdenColumna] = useState(null);
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const elementosPorPagina = 10;

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

  const handleSeleccionarPagina = (pagina) => {
    setPaginaActual(pagina);
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

  const renderBotonesPaginas = () => {
    const totalPaginas = Math.ceil(data.length / elementosPorPagina);
    const botones = [];
    const inicio = Math.max(paginaActual - 4, 1);
    const fin = Math.min(paginaActual + 4, totalPaginas);

    botones.push(
      <MdSkipPrevious
        key="primera"
        size={40}
        onClick={() => handleSeleccionarPagina(1)}
        className={`mx-1 px-2 py-1 rounded ${
          paginaActual === 1
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={paginaActual === 1}
      />
    );

    botones.push(
      <MdNavigateBefore
        size={40}
        key="anterior"
        onClick={handlePaginaAnterior}
        className={`mx-1 px-2 py-1 rounded ${
          paginaActual === 1
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={paginaActual === 1}
      />
    );

    for (let i = inicio; i <= fin; i++) {
      botones.push(
        <button
          key={i}
          onClick={() => handleSeleccionarPagina(i)}
          className={`mx-1 px-2 py-1 rounded ${
            i === paginaActual
              ? "bg-gray-200 text-[#840C4A]"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {i}
        </button>
      );
    }

    botones.push(
      <MdNavigateNext
        size={40}
        key="siguiente"
        onClick={handlePaginaSiguiente}
        className={`mx-1 px-2 py-1 rounded ${
          paginaActual === totalPaginas
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={paginaActual === totalPaginas}
      />
    );

    botones.push(
      <MdSkipNext
        size={40}
        key="ultima"
        onClick={() => handleSeleccionarPagina(totalPaginas)}
        className={`mx-1 px-2 py-1 rounded ${
          paginaActual === totalPaginas
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={paginaActual === totalPaginas}
      />
    );

    return botones;
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
      <div className="mt-4 flex justify-center relative bottom left-0 w-full">
        {renderBotonesPaginas()}
      </div>
    </div>
  );
};

export default Table;
