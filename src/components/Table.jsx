import React, { useState } from "react";
import Link from "next/link";
import { FaPencilAlt } from "react-icons/fa";
import {
  MdSkipNext,
  MdSkipPrevious,
  MdNavigateNext,
  MdNavigateBefore,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { getStatusColor } from "@/utils/tableUtils";
import { toast } from "react-toastify";

const Table = ({ data, columnas, n, route = "/detail" }) => {
  console.log(data);
  
  const { t } = useTranslation();
  const router = useRouter();
  const showModal = useSelector((state) => state.notification.showModal);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnOrder, setColumnOrder] = useState("created_at");
  const [ascOrder, setAscOrder] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);
  const elementsPerPage = n;

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
    if (!columnOrder) return data;

    const ordered = [...data].sort((a, b) => {
      const valA = a[columnOrder];
      const valB = b[columnOrder];

      if (valA == null && valB != null) return ascOrder ? -1 : 1;
      if (valA != null && valB == null) return ascOrder ? 1 : -1;
      if (valA == null && valB == null) return 0;

      // Si es fecha
      if (
        columnOrder.toLowerCase().includes("date") ||
        columnOrder === "created_at"
      ) {
        const normalizeDate = (val) =>
          new Date(
            String(val).replace(" ", "T").replace(/\+00$/, "+00:00")
          ).getTime();

        const dateA = normalizeDate(valA);
        const dateB = normalizeDate(valB);
        return ascOrder ? dateA - dateB : dateB - dateA;
      }

      // Si es número
      if (typeof valA === "number" && typeof valB === "number") {
        return ascOrder ? valA - valB : valB - valA;
      }

      // Si es booleano
      if (typeof valA === "boolean" && typeof valB === "boolean") {
        return ascOrder
          ? valA === valB
            ? 0
            : valA
            ? 1
            : -1
          : valA === valB
          ? 0
          : valA
          ? -1
          : 1;
      }

      // Si es string u otro tipo
      return ascOrder
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return ordered;
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
            : "bg-gray-200 text-[1C4A]"
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
            : "bg-gray-200 text-[1C4A]"
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
              ? "bg-gray-200 text-[1C4A]"
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
            : "bg-gray-200 text-[1C4A]"
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
            : "bg-gray-200 text-[1C4A]"
        }`}
        disabled={currentPage === totalPages}
      />
    );

    return buttons;
  };

  const handleMouseEnter = (content, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      content: content,
      x: rect.x + rect.width / 2,
      y: rect.y + window.scrollY - 10,
    });
  };

  const handleMouseLeave = () => {
    !isDragging && setTooltip({ ...tooltip, visible: false });
  };

  const handleClickTooltip = (content) => {
    navigator.clipboard.writeText(content);
    toast.success(`Contenido copiado: ${content}`);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStartX(e.currentTarget.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    e.currentTarget.scrollLeft = scrollStartX - dx;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleShowTooltip = () => {
    setTooltip({ ...tooltip, visible: true });
  };

  return (
    <>
      <div
        className="overflow-hidden cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: "none" }}
      >
        <table className="w-full divide-y divide-gray-200 border border-gray-100">
          <thead>
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna.field}
                  onClick={() => handleOrdenarColumna(columna.field)}
                  className={`px-2 py-2 bg-[#840C4A] text-[0.75rem] text-white font-medium tracking-wider text-center cursor-pointer ${
                    columna.field === "acciones" ? "w-12 sm:w-16" : ""
                  }`}
                  style={{
                    maxWidth: "5rem",
                  }}
                >
                  <div
                    className={`
            whitespace-nowrap overflow-hidden text-ellipsis 
            sm:whitespace-normal sm:break-words
          `}
                  >
                    {columna.title}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-sm">
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
                        className="px-0 py-1 text-[0.75rem] text-gray-900 text-center"
                      >
                        <Link href={`${route}/${fila.id}`}>
                          <div className="inline-flex items-center px-0">
                            <FaPencilAlt className="text-gray-400 cursor-pointer text-center hover:text-gray-700" />
                          </div>
                        </Link>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={columna.field}
                      className="px-2 py-1 text-[0.9rem] text-gray-900 text-center"
                      style={{
                        maxWidth: "5rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) =>
                        handleMouseEnter(fila[columna.field], e)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      <div>
                        {columna.field === "created_at"
                          ? new Date(fila[columna.field]).toLocaleDateString(
                              "es-AR"
                            )
                          : fila[columna.field]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tooltip.visible && tooltip.content && (
        <div
          className="absolute bg-white border border-gray-300 px-4 py-2 shadow-lg z-50"
          style={{ top: tooltip.y, left: tooltip.x }}
          onMouseEnter={handleShowTooltip}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClickTooltip(tooltip.content)}
        >
          {tooltip.content}
        </div>
      )}

      <div
        className={
          !showModal
            ? "mt-4 ml-4 flex fixed bottom-4 left-1/2 transform -translate-x-1/2 translate-y-0 justify-center w-full"
            : "hidden"
        }
      >
        {renderbuttonsPages()}

        {route !== "/detail" && route !== "/admin" ? (
          <button
            className="mx-1 px-2 py-1 rounded bg-[#840C4A] text-white ml-4"
            onClick={() => router.push("/winaryDetail/newWinary")}
          >
            {t("crear_bodega")}
          </button>
        ) : (
          route === "/admin" && (
            <button
              className="mx-1 px-2 py-1 rounded bg-[#840C4A] text-white ml-4"
              onClick={() => router.push("/admin/addUser")}
            >
              {t("add_admin")}
            </button>
          )
        )}
      </div>
    </>
  );
};

export default Table;
