import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HomeLayout from "@/components/HomeLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { activeNetwork } from "@/config";
import {
  createTokenForLaunch,
  updateTokenInfo,
} from "@/utils/provisioningUtils";
import { isAdminUser } from "@/utils/authUtils";
import { formatDateForInput, toTimestamp } from "@/utils/dateUtils";
import { useIpfsUpload } from "@/hooks/useIpfsUpload";
import FormField from "@/components/FormField";
import useDeployment from "@/hooks/useDeployment";
import { Form, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import useWineries from "@/hooks/useWineries";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { chain, client } from "@/config/thirdwebClient";
import { CrowdsaleConfogurationForm } from "@/components/CrowdsaleConfigurationForm";

const Launch = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const [disableDeploy, setDisableDeploy] = useState(false);
  const [transferDisabled, setTransferDisabled] = useState(true);
  const [transferDone, setTransferDone] = useState(false);

  const { wineries } = useWineries();
  const router = useRouter();
  const { t } = useTranslation();

  const { id } = router.query;

  const { register, handleSubmit, setValue, getValues, reset } = useForm({
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      cap: "",
      redeem_wallet_address: "",
      token_image: "",
      wallet_address: "",
      price_per_token: "",
      rate: "",
      opening_time: "",
      closing_time: "",
      tokens_to_crowdsale: "",
      winery_id: "",
      token_address: "",
      crowdsale_address: "",
    },
  });

  const {
    finalizeAndRenewCrowdsale,
    transferTokensToCrowdsale,
    finalizeCrowdsale,
    loading,
    token,
    tokenAddress,
    crowdsaleAddress,
    setLoading,
    selectedWinery,
    updateCrowdsale,
  } = useDeployment(
    getValues,
    setTransferDisabled,
    setTransferDone,
    setDisableDeploy
  );

  const session = useSession();

  useEffect(() => {
    if (token?.transfered_to_crowdsale) {
      setTransferDone(true);
      setTransferDisabled(true);
    }
  }, [token]);
  useEffect(() => {
    if (!router.isReady) return;

    const editParam = router.query.edit;
    const idParam = router.query.id;

    setIsEditMode(editParam === "true" && isAdminUser(session));
    setIsViewMode(idParam && editParam !== "true");
    setIsCreateMode(idParam === "launch" && isAdminUser(session));
  }, [router.isReady, router.query, session]);

  useEffect(() => {
    if (token) {
      if (token.transfered_to_crowdsale) {
        setDisableDeploy(true);
        setTransferDisabled(true);
      } else if (token.tokenAddress && token.crowdsaleAddress) {
        setDisableDeploy(true);
        setTransferDisabled(false);
      }
      reset({
        id: token.id,
        redeem_wallet_address: token.redeem_wallet_address,
        wallet_address: token.wallet_address,
        price_per_token: token.price_per_token,
        rate: token.rate,
        opening_time: formatDateForInput(token.opening_time),
        closing_time: formatDateForInput(token.closing_time),
        tokens_to_crowdsale: token.tokens_to_crowdsale,
      });
      const newPrice = 1 / token.rate;
      setValue("pricePerToken", parseFloat(newPrice.toFixed(8)));
    }
  }, [token, reset, setValue]);

  const isFieldDisabled = () => {
    return false
    if (isViewMode && !isEditMode && !isCreateMode) return true;
    if (isCreateMode || isEditMode) return false;
    return true;
  };

  const createTokenInDatabase = async () => {
    const v = getValues();
    const name = v.name?.trim();
    const walletAddress = v.wallet_address?.trim();
    const rate = v.rate;
    const openingTime = v.opening_time;
    const closingTime = v.closing_time;
    const tokensToCrowdsale = v.tokens_to_crowdsale;
    if (!name || !symbol || !cap || !selectedWinery) {
      toast.error("Missing required fields");
      return;
    }
    setLoading(true);
    const toastId = toast.loading(
      isEditMode
        ? "Updating token in database..."
        : "Saving token in database...",
      { theme: "dark" }
    );
    try {
      if (isEditMode) {
        await updateTokenInfo(symbol, {
          name,
          walletAddress,
          rate,
          openingTime,
          closingTime,
          tokensToCrowdsale,
          winery_id: selectedWinery,
        });
      } 
      toast.update(toastId, {
        render: isEditMode
          ? "Token updated successfully!"
          : "Token saved successfully!",
        isLoading: false,
        type: "success",
        autoClose: 2000,
      });
      router.push("/provisioning");
    } catch (err) {
      console.error("Error saving token:", err);
      toast.update(toastId, {
        render: isEditMode ? "Failed to update token" : "Failed to save token",
        isLoading: false,
        type: "error",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const OnUpdateCrowdsale = async () => {
    await updateCrowdsale();
  };

  return (
    <HomeLayout>
      <ToastContainer />
      <div className="p-4 w-full overflow-x-auto lg:overflow-x-hidden">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("update_crowdsale")}
        </h1>
        <form
          className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md"
          onSubmit={handleSubmit((e) => e.preventDefault())}
        >
          {/* Crowdsale Config */}
          <h2 className="text-xl font-semibold">{t("crowdsale_config")}</h2>

          <CrowdsaleConfogurationForm
            register={register}
            isFieldDisabled={isFieldDisabled}
            setValue={setValue}
          />

          {/* Token Address (solo si existe) */}
          {token?.token_address && (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <FormField
                label={t("token_address")}
                type="text"
                value={token?.token_address}
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
          )}
          {token?.crowdsale_address && (
            <div className="lg:col-span-3">
              <FormField
                label={t("crowdsale_address")}
                type="text"
                value={token?.crowdsale_address}
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
          )}
          {/* Buttons */}

          <div className="flex justify-between space-x-4 mt-4">
            {/* Volver */}
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-300 rounded"
            >
              {t("volver")}
            </button>
            <div className="flex space-x-4">
              {token?.crowdsale_address && (
                <button
                  type="button"
                  onClick={OnUpdateCrowdsale}
                  className="px-6 py-2 bg-purple-400 rounded"
                >
                  {t("update!")}
                </button>
              )}
              {/* Guardar token en DB en modos crear o editar */}
              {(isCreateMode || isEditMode) && (
                <button
                  type="button"
                  onClick={createTokenInDatabase}
                  disabled={loading}
                  className={`px-6 py-2 rounded text-white ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700"
                  }`}
                >
                  {t("save_token")}
                </button>
              )}

              {/* Acciones */}
              {isViewMode &&
                !token?.crowdsale_finalized &&
                !token?.tokens_transfered && (
                  <>
                    <button
                      type="button"
                      onClick={transferTokensToCrowdsale}
                      disabled={loading || transferDisabled}
                      className={`px-6 py-2 rounded text-white ${
                        loading || transferDisabled
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600"
                      }`}
                    >
                      {t("transfer_tokens_to_crowdsale")}
                    </button>
                  </>
                )}
              {isViewMode && transferDone && !token?.crowdsale_finalized && (
                <button
                  type="button"
                  onClick={finalizeAndRenewCrowdsale}
                  disabled={loading}
                  className={`px-6 py-2 rounded text-white ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-700"
                  }`}
                >
                  {t("finalize_and_renew")}
                </button>
              )}
              {isViewMode && transferDone && !token?.crowdsale_finalized && (
                <button
                  type="button"
                  onClick={finalizeCrowdsale}
                  disabled={loading}
                  className={`px-6 py-2 rounded text-white ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
                  }`}
                >
                  {t("finalize_crowdsale")}
                </button>
              )}
            </div>
          </div>
        </form>
        {(tokenAddress || crowdsaleAddress) && !token?.crowdsale_finalized && (
          <div className="mt-8 space-y-2 text-center">
            {tokenAddress && (
              <>
                <p>
                  {t("token_address")}:{" "}
                  <a
                    href={`https://${
                      activeNetwork === "baseSepolia"
                        ? "sepolia.basescan.org"
                        : "basescan.org"
                    }/address/${tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {tokenAddress}
                  </a>
                </p>
              </>
            )}
            {crowdsaleAddress && (
              <>
                <p>
                  {t("crowdsale_address")}:{" "}
                  <a
                    href={`https://${
                      activeNetwork === "baseSepolia"
                        ? "sepolia.basescan.org"
                        : "basescan.org"
                    }/address/${crowdsaleAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {crowdsaleAddress}
                  </a>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default Launch;
