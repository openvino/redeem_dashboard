import Link from "next/link";
import { FaPencilAlt } from "react-icons/fa";
import {
  MdSkipNext,
  MdSkipPrevious,
  MdNavigateNext,
  MdNavigateBefore,
} from "react-icons/md";
import { useState } from "react";

const Table = ({ data, columnas, n }) => {
  console.log(n);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnOrder, setColumnOrder] = useState(null);
  const [ascOrder, setAscOrder] = useState(true);
  const elementsPerPage = n;

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

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(data.length / elementsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSelectPage = (pagina) => {
    setCurrentPage(pagina);
  };

  const handleOrdenarColumna = (columna) => {
    if (columnOrder === columna) {
      setAscOrder(!ascOrder);
    } else {
      setColumnOrder(columna);
      setAscOrder(true);
    }
  };

  const orderData = () => {
    if (columnOrder) {
      return [...data].sort((a, b) => {
        const valorA = a[columnOrder];
        const valorB = b[columnOrder];
        if (valorA < valorB) {
          return ascOrder ? -1 : 1;
        }
        if (valorA > valorB) {
          return ascOrder ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  };

  const orderPagedData = () => {
    const orderedData = orderData();
    const totalPages = Math.ceil(orderedData.length / elementsPerPage);
    const validPage = Math.max(1, Math.min(currentPage, totalPages));
    const initIndex = (validPage - 1) * elementsPerPage;
    const indiceFinal = initIndex + elementsPerPage;
    return orderedData.slice(initIndex, indiceFinal);
  };

  const renderbuttonsPages = () => {
    const totalPages = Math.ceil(data.length / elementsPerPage);
    const buttons = [];
    const inicio = Math.max(currentPage - 4, 1);
    const fin = Math.min(currentPage + 4, totalPages);

    buttons.push(
      <MdSkipPrevious
        key="primera"
        size={40}
        onClick={() => handleSelectPage(1)}
        className={`mx-1 px-2 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={currentPage === 1}
      />
    );

    buttons.push(
      <MdNavigateBefore
        size={40}
        key="anterior"
        onClick={handlePrevPage}
        className={`mx-1 px-2 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={currentPage === 1}
      />
    );

    for (let i = inicio; i <= fin; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handleSelectPage(i)}
          className={`mx-1 px-2 py-1 rounded ${
            i === currentPage
              ? "bg-gray-200 text-[#840C4A]"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <MdNavigateNext
        size={40}
        key="siguiente"
        onClick={handleNextPage}
        className={`mx-1 px-2 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={currentPage === totalPages}
      />
    );

    buttons.push(
      <MdSkipNext
        size={40}
        key="ultima"
        onClick={() => handleSelectPage(totalPages)}
        className={`mx-1 px-2 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500"
            : "bg-gray-200 text-[#840C4A]"
        }`}
        disabled={currentPage === totalPages}
      />
    );

    return buttons;
  };
  return (
    <div className="overflow-x-auto rounded-lg w-[95%]">
      <table
        className="w-full divide-y divide-gray-200 border border-gray-100 table-fixed"
        style={{ padding: "2px" }}
      >
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna.field}
                className={`px-1 py-1 bg-[#840C4A] text-left text-xs text-white font-medium uppercase tracking-wider justify-center ${
                  columna.field === "acciones" || columna.field === "pais"
                    ? "w-12 sm:w-16"
                    : ""
                }`}
                onClick={() => handleOrdenarColumna(columna.field)}
              >
                {columna.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orderPagedData().map((fila, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              {columnas.map((columna) => {
                if (columna.field === "acciones") {
                  return (
                    <td
                      key={columna.field}
                      className="px-2 py-1 text-xs text-gray-900"
                      style={{
                        width: "1rem",
                        maxWidth: "1rem",
                      }}
                    >
                      <Link href={`/detail/${index}`}>
                        <FaPencilAlt
                          size={5}
                          className="h-5 w-3 text-gray-400 cursor-pointer hover:text-gray-700"
                        />
                      </Link>
                    </td>
                  );
                }

                if (columna.field === "status") {
                  return (
                    <td
                      key={columna.field}
                      className={`px-2 py-1 text-sm font-medium ${getStatusColor(
                        fila[columna.field]
                      )}`}
                    >
                      {fila[columna.field]}
                    </td>
                  );
                }

                if (columna.field === "pais") {
                  return (
                    <td
                      key={columna.field}
                      className="px-2 py-1 text-sm text-gray-900"
                      style={{
                        maxWidth: "2rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div>{fila[columna.field]}</div>
                    </td>
                  );
                }

                return (
                  <td
                    key={columna.field}
                    className="px-2 py-1 text-sm text-gray-900"
                    style={{
                      maxWidth: "5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>{fila[columna.field]}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center relative bottom left-0 w-full">
        {renderbuttonsPages()}
      </div>
    </div>
  );
};

export default Table;
