import { collapseNotificationModal } from "@/redux/actions/notificationActions";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";

function getTimeDifference(created_at) {
  const currentTime = new Date();
  const createdAt = new Date(created_at);
  const timeDifference = currentTime.getTime() - createdAt.getTime();

  const minutes = Math.floor(timeDifference / (1000 * 60));
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (hours >= 1 && hours < 24) {
    return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  } else {
    return `${days} ${days === 1 ? "día" : "días"}`;
  }
}

const Modal = ({ data }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleClick = (id) => {
    dispatch(collapseNotificationModal());
    router.push(`/detail/${id}`);
  };

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
        <div className="fixed top-20 right-8 bg-opacity-25 md:right[10%] md:top-[8rem]">
          <div className="bg-[#F1EDE2] bg-opacity-70 shadow-xl p-2 rounded-lg">
            {data.map((e) => (
              <p
                className="text-xs cursor-pointer"
                onClick={() => handleClick(e.id)}
                key={e.id}
              >
                {e.name} ha realizado un redeem hace{" "}
                {getTimeDifference(e.created_at)}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
};

export default Modal;
