import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HomeLayout from "@/components/HomeLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { activeNetwork} from "@/config";
import {
  createTokenForLaunch,
  updateTokenInfo,
} from "@/utils/provisioningUtils";
import { isAdminUser } from "@/utils/authUtils";
import { formatDateForInput, toTimestamp } from "@/utils/dateUtils";
import { useIpfsUpload } from "@/hooks/useIpfsUpload";
import FormField from "@/components/FormField";
import useDeployment from "@/hooks/useDeployment";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import useWineries from "@/hooks/useWineries";

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

  const { register, handleSubmit, setValue, getValues, reset } = useForm({
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      cap: "",
      redeemWalletAddress: "",
      tokenImage: "",
      walletAddress: "",
      pricePerToken: "",
      rate: "",
      openingTime: "",
      closingTime: "",
      tokensToCrowdsale: "",
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
    handleDeployAll,
    selectedWinery,
    setSelectedWinery,
  } = useDeployment(
    getValues,
    setTransferDisabled,
    setTransferDone,
    setDisableDeploy
  );

  const session = useSession();

  const { uploadImage, uploading, ipfsUrl } = useIpfsUpload();

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
        name: token.name,
        symbol: token.symbol,
        cap: token.cap,
        redeemWalletAddress: token.redeemWalletAddress,
        tokenImage: token.tokenImage,
        walletAddress: token.walletAddress,
        pricePerToken: token.pricePerToken,
        rate: token.rate,
        openingTime: formatDateForInput(token.openingTime),
        closingTime: formatDateForInput(token.closingTime),
        tokensToCrowdsale: token.tokensToCrowdsale,
      });
      const newPrice = 1 / token.rate;
      setValue("pricePerToken", parseFloat(newPrice.toFixed(8)));
    }
  }, [token, reset, setValue]);

  const isFieldDisabled = () => {
    if (isViewMode && !isEditMode && !isCreateMode) return true;
    if (isCreateMode || isEditMode) return false;
    return true;
  };

  const createTokenInDatabase = async () => {
    const v = getValues();
    const name = v.name?.trim();
    const symbol = v.symbol?.trim();
    const cap = v.cap;
    const redeemWalletAddress = v.redeemWalletAddress?.trim();
    const tokenImage = v.tokenImage?.trim();
    const walletAddress = v.walletAddress?.trim();
    const rate = v.rate;
    const openingTime = v.openingTime;
    const closingTime = v.closingTime;
    const tokensToCrowdsale = v.tokensToCrowdsale;
    if (!name || !symbol || !cap || !redeemWalletAddress || !selectedWinery) {
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
          symbol,
          cap,
          redeemWalletAddress,
          tokenImage,
          walletAddress,
          rate,
          openingTime,
          closingTime,
          tokensToCrowdsale,
          winery_id: selectedWinery,
        });
      } else {
        await createTokenForLaunch(symbol, {
          name,
          symbol,
          cap,
          redeemWalletAddress,
          tokenImage,
          walletAddress,
          rate,
          openingTime,
          closingTime,
          tokensToCrowdsale,
          winery_id: selectedWinery,
          token_address: "",
          crowdsale_address: "",
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

  return (
    <HomeLayout>
      <ToastContainer />
      <div className="p-4 w-full overflow-x-auto lg:overflow-x-hidden">
        <h1 className="text-2xl font-bold text-center mb-6">{t("launch")}</h1>
        <form
          className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md"
          onSubmit={handleSubmit((e) => e.preventDefault())}
        >
          {/* Token Config */}
          <h2 className="text-xl font-semibold">{t("token_config")}</h2>

          {/* Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("token_name")}
              required
              disabled={isFieldDisabled()}
              {...register("name")}
            />

            {/* Símbolo */}
            <FormField
              disabled={isFieldDisabled()}
              label={t("token_symbol")}
              required
              {...register("symbol")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("token_cap")}
              type="number"
              step="any"
              {...register("cap")}
              className="w-full mt-1 p-2 border rounded"
              required
              disabled={isFieldDisabled()}
            />

            <FormField
              label={t("REDEEM_wallet_address")}
              type="text"
              {...register("redeemWalletAddress")}
              className="w-full mt-1 p-2 border rounded"
              required
              disabled={isFieldDisabled()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-bold">{t("token_logo")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const url = await uploadImage(file);
                    setValue("tokenImage", url);
                    toast.success("Logo uploaded to IPFS");
                  } catch {
                    toast.error("Error uploading logo to IPFS");
                  }
                }}
                className="w-full px-3 py-2 h-[39px] border border-gray-300 rounded-md  disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-[#840C4A]"
                disabled={isFieldDisabled() || uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              )}
              {ipfsUrl && (
                <div className="mt-2">
                  <img
                    src={ipfsUrl}
                    alt="Token Logo Preview"
                    className="rounded-lg shadow w-32 h-32 object-contain border"
                  />
                  <p className="text-xs break-all mt-1">{ipfsUrl}</p>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold">{t("select_winery")}</label>
              <select
                value={selectedWinery}
                onChange={(e) => {
                  setSelectedWinery(e.target.value);
                  setValue("winery_id", e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-[#840C4A] "
                disabled={isFieldDisabled()}
              >
                {wineries.map((wineryId) => (
                  <option key={wineryId.id} value={wineryId.id}>
                    {wineryId.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-xl font-semibold">{t("crowdsale_config")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("VCO_wallet_address")}
              type="text"
              {...register("walletAddress")}
              className="w-full mt-1 p-2 border rounded"
              required
              disabled={isFieldDisabled()}
            />

            <FormField
              label={t("price_per_token")}
              type="number"
              step="any"
              {...register("pricePerToken")}
              onChange={(e) => {
                const price = parseFloat(e.target.value);
                if (!isNaN(price) && price > 0) {
                  const newRate = Math.floor(1 / price);
                  setValue("rate", newRate);
                } else {
                  setValue("rate", 0);
                }
              }}
              className="w-full mt-1 p-2 border rounded"
              required
              disabled={isFieldDisabled()}
            />
          </div>

          {/* Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("rate_tokens_per_eth")}
              type="number"
              {...register("rate")}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                if (!isNaN(rate) && rate > 0) {
                  const newPrice = 1 / rate;
                  setValue("pricePerToken", parseFloat(newPrice.toFixed(8)));
                } else {
                  setValue("pricePerToken", 0);
                }
              }}
              className="w-full mt-1 p-2 border rounded"
              required
              disabled={isFieldDisabled()}
            />

            <FormField
              label={t("opening_time")}
              type="datetime-local"
              {...register("openingTime")}
              className="w-full mt-1 p-2 border rounded"
              disabled={isFieldDisabled()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("closing_time")}
              type="datetime-local"
              {...register("closingTime")}
              className="w-full mt-1 p-2 border rounded"
              required
              disabled={isFieldDisabled()}
            />
            <FormField
              label={t("tokens_to_crowdsale")}
              type="number"
              step="any"
              {...register("tokensToCrowdsale")}
              className="w-full mt-1 p-2 border rounded"
              required
              disabled={isFieldDisabled()}
            />
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <textarea />

             
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {token?.token_address && (
              <FormField
                label={t("token_address")}
                type="text"
                value={token?.token_address}
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                disabled
              />
            )}
            {token?.crowdsale_address && (
              <FormField
                label={t("crowdsale_address")}
                type="text"
                value={token?.crowdsale_address}
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                disabled
              />
            )}
          </div>

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

              {/* Deploy y Transfer solo en modo vista */}
              {isViewMode &&
                !token?.crowdsale_finalized &&
                !token?.tokens_transfered && (
                  <>
                    <button
                      type="button"
                      onClick={handleDeployAll}
                      disabled={loading || disableDeploy}
                      className={`px-6 py-2 rounded text-white ${
                        loading || disableDeploy
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-700"
                      }`}
                    >
                      {t("deploy_contracts")}
                    </button>

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
