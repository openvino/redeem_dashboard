// utils/toastHelpers.ts
import { toast } from "react-toastify";

export const showLoadingToast = (toastId, message) => {
  return toast.update(toastId, {
    render: message,
    isLoading: true,
  });
};

export const createLoadingToast = (message) => {
  return toast.loading(message, {
    position: "top-right",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    isLoading: true,
  });
};

export const updateSuccessToast = (id, message) => {
  toast.update(id, {
    render: message,
    type: "success",
    isLoading: false,
    autoClose: 3000,
    closeOnClick: true,
    draggable: true,
  });
};

export const updateErrorToast = (id, error) => {
  const msg =
    error instanceof Error
      ? error.message
      : "Algo salió mal. Intenta de nuevo.";
  toast.update(id, {
    render: msg,
    type: "error",
    isLoading: false,
    autoClose: 5000,
    closeOnClick: true,
    draggable: true,
  });
};
