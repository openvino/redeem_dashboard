import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useActiveAccount } from "thirdweb/react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
const useLaunch = () => {
  const session = useSession();

  
 
  const account = useActiveAccount();
  const { t } = useTranslation();

  return {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    account,
    t,
    session,
  };
};

export default useLaunch;
