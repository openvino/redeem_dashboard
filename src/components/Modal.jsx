import { collapseNotificationModal } from '@/redux/actions/notificationActions';
import clientAxios from '@/config/clientAxios';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const clearNotifications = async (data, reloadRedeems) => {
  const promisifiedNotifications = data.map((e) => {
    return clientAxios.post('/notificationRoute', {
      id: e.id,
    });
  });

  await Promise.all(promisifiedNotifications);
  reloadRedeems();
};

const Modal = ({ data, reloadRedeems }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClick = (id) => {
    dispatch(collapseNotificationModal());
    router.push(`/detail/${id}`);
  };

  function getTimeDifference(created_at) {
    const currentTime = new Date();
    const createdAt = new Date(created_at);
    const timeDifference = currentTime.getTime() - createdAt.getTime();

    const minutes = Math.floor(timeDifference / (1000 * 60));
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (hours >= 1 && hours < 24) {
      return `${hours} ${hours === 1 ? t('hora') : t('horas')}`;
    } else {
      return `${days} ${days === 1 ? t('día') : t('días')}`;
    }
  }
  const filterData = () => {
    let filteredData;

    filteredData = data.length > 5 ? data.slice(-5) : data;

    return filteredData;
  };

  data = filterData(data);
  const showModal = useSelector((state) => state.notification.showModal);

  if (!showModal) return null;
  else
    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur flex justify-center items-center shadow-xl ">
        <div className="fixed top-[6rem] right-8 bg-opacity-25 md:right[10%] md:top-[9rem] ">
          <div className="bg-[#F1EDE2] bg-opacity-70 shadow-xl p-2 rounded-lg">
            {data.map((e) => (
              <p
                className="text-xs cursor-pointer"
                onClick={() => handleClick(e.id)}
                key={e.id}
              >
                {e.name ? (
                  <span>
                    {e.name} {t('ha_realizado_reddem')}
                    {getTimeDifference(e.created_at)} {t('ago')}
                  </span>
                ) : (
                  <span>
                    Un cliente ha realizado un redeem hace{' '}
                    {getTimeDifference(e.created_at)}
                  </span>
                )}
              </p>
            ))}
            <p
              className="text-xs cursor-pointer font-bold"
              onClick={() => clearNotifications(data, reloadRedeems)}
            >
              {t('limpiar_noti')}
            </p>
          </div>
        </div>
      </div>
    );
};

export default Modal;
