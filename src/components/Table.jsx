import Link from 'next/link';
import { FaPencilAlt } from 'react-icons/fa';
import {
  MdSkipNext,
  MdSkipPrevious,
  MdNavigateNext,
  MdNavigateBefore,
} from 'react-icons/md';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const Table = ({ data, columnas, n, route = '/detail' }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const showModal = useSelector((state) => state.notification.showModal);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnOrder, setColumnOrder] = useState('created_at');
  const [ascOrder, setAscOrder] = useState(true);
  const elementsPerPage = n;

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
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
        if (columnOrder === 'created_at') {
          return ascOrder
            ? new Date(valorB) - new Date(valorA)
            : new Date(valorA) - new Date(valorB);
        }
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
            ? 'bg-gray-200 text-gray-500}'
            : 'bg-gray-200 text-[1C4A]'
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
            ? 'bg-gray-200 text-gray-500'
            : 'bg-gray-200 text-[1C4A]'
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
              ? 'bg-gray-200 text-[1C4A]'
              : 'bg-gray-200 text-gray-500'
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
            ? 'bg-gray-200 text-gray-500'
            : 'bg-gray-200 text-[1C4A]'
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
            ? 'bg-gray-200 text-gray-500'
            : 'bg-gray-200 text-[1C4A]'
        }`}
        disabled={currentPage === totalPages}
      />
    );

    return buttons;
  };
  console.log('//*/*/*/*/*/*/*/*/*/*/*/*/*/*/*//* :    ', data);
  return (
    <div>
      <div className="overflow-x-scroll ml-12 md:ml-0   rounded-lg  mt-[10rem] md:overflow-x-hidden ">
        <table className=" w-[30%] md:w-[90%] mx-auto  md:table-fixed divide-y divide-gray-200  border border-gray-100 table-auto ">
          <thead>
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna.field}
                  className={`px-1 py-1 bg-[#840C4A]  text-[0.75rem]  text-white font-large  tracking-wider text-center cursor-pointer${
                    columna.field === 'acciones' ? 'w-12 sm:w-16' : ''
                  }
                `}
                  onClick={() => handleOrdenarColumna(columna.field)}
                >
                  <span>{columna.title} </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {orderPagedData().map((fila, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
              >
                {columnas.map((columna) => {
                  if (columna.field === 'acciones') {
                    return (
                      <td
                        key={columna.field}
                        className="px-0 py-1 text-[1em] md:text-[0.75rem] text-gray-900 text-center"
                      >
                        <Link href={`${route}/${fila.id}`}>
                          <div className="inline-flex items-center px-0">
                            <FaPencilAlt className=" text-gray-400 cursor-pointer text-center hover:text-gray-700" />
                          </div>
                        </Link>
                      </td>
                    );
                  }

                  if (columna.field === 'status') {
                    return (
                      <td
                        key={columna.field}
                        className={`px-2 py-1 text-[1em] text-center md:text-[0.75rem] font-medium ${getStatusColor(
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
                      className="px-2 py-1 text-[1em] md:text-[0.9rem] text-gray-900 text-center"
                      style={{
                        maxWidth: '5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
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
      </div>

      <div
        className={
          !showModal
            ? 'mt-4 flex relative md:justify-center bottom translate-x-[10%] md:translate-x-0 w-full transform scale-75'
            : 'hidden'
        }
      >
        {renderbuttonsPages()}
        {route !== '/detail' && route !== '/admin' ? (
          <button
            className="mx-1 px-2 py-1 rounded bg-[#840C4A] text-white ml-4"
            onClick={() => router.push('/winaryDetail/newWinary')}
          >
            {t('crear_bodega')}
          </button>
        ) : (
          route === '/admin' && (
            <button
              className="mx-1 px-2 py-1 rounded bg-[#840C4A] text-white ml-4"
              onClick={() => router.push('/admin/addUser')}
            >
              {t('add_admin')}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Table;
