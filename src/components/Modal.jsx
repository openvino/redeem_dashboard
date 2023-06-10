import React from "react";

const Modal = ({ isVisible, data }) => {
  if (!isVisible) return null;
  else
    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur flex justify-center items-center">
        <div className="fixed top-20 right-[30%] bg-opacity-25 md:right[10%] md:top-[8rem]">
          <div className="bg-[#F1EDE2] bg-opacity-70 shadow-xl p-2 rounded-lg">
            Modal
          </div>
        </div>
      </div>
    );
};

export default Modal;
