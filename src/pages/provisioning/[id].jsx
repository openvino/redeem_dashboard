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
import useDeployment from "@/hooks/useDeployment";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { TokenConfigurationForm } from "@/components/TokenConfigurationForm";
import { CrowdsaleConfogurationForm } from "@/components/CrowdsaleConfigurationForm";
import DeployedAddresses from "@/components/DeployedAddresses";
import LaunchActionButton from "@/components/LaunchActionButton";

const Launch = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [disableDeploy, setDisableDeploy] = useState(false);
  const [transferDisabled, setTransferDisabled] = useState(true);
  const [transferDone, setTransferDone] = useState(false);
  const [bottleImage, setBottleImage] = useState("");
  const [tokenImage, setTokenImage] = useState("");

  const router = useRouter();
  const { t } = useTranslation();

  const { register, handleSubmit, setValue, getValues, reset } = useForm({
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      cap: "",
      redeem_wallet_address: "",
      vintage: "esker",
      bottle_image: "",
      token_image: "",
      winery_id: "",
      description: "",
      wallet_address: "",
      price_per_token: "",
      rate: "",
      opening_time: "",
      closing_time: "",
      tokens_to_crowdsale: "",
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

      if(token.bottle_image && token.token_image) {
        setBottleImage(token.bottle_image);
        setTokenImage(token.token_image);
      }

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
        redeem_wallet_address: token.redeem_wallet_address,
        vintage: token.vintage,
        bottle_image: token.bottle_image,
        token_image: token.token_image,
        winery_id: token.winery_id,
        description: token.description,
        wallet_address: token.wallet_address,
        price_per_token: token.price_per_token,
        rate: token.rate,
        opening_time: formatDateForInput(token.opening_time),
        closing_time: formatDateForInput(token.closing_time),
        tokens_to_crowdsale: token.tokens_to_crowdsale,
      });
      const newPrice = 1 / token.rate;
      setValue("price_per_token", parseFloat(newPrice.toFixed(8)));
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
    const redeemWalletAddress = v.redeem_wallet_address?.trim();
    const vintage = v.vintage;
    const bottleImage = v.bottle_image?.trim();
    const tokenImage = v.token_image?.trim();
    const winery_id = v.winery_id;
    const description = v.description;
    const walletAddress = v.wallet_address?.trim();
    const pricePerToken = v.price_per_token;
    const rate = v.rate;
    const openingTime = v.opening_time;
    const closingTime = v.closing_time;
    const tokensToCrowdsale = v.tokens_to_crowdsale;

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
          redeem_wallet_address: redeemWalletAddress,
          vintage,
          bottle_image: bottleImage || "",
          token_image: tokenImage || "",
          winery_id,
          description,
          wallet_address: walletAddress,
          price_per_token: pricePerToken,
          rate,
          opening_time: openingTime,
          closing_time: closingTime,
          tokens_to_crowdsale: tokensToCrowdsale,
          winery_id: selectedWinery,
        });
      } else {
        await createTokenForLaunch(symbol, {
          name,
          symbol,
          cap,
          redeemWalletAddress,
          vintage,
          bottleImage,
          tokenImage,
          winery_id,
          walletAddress,
          pricePerToken,
          rate,
          openingTime,
          closingTime,
          tokensToCrowdsale,
          winery_id: selectedWinery,
          token_address: "",
          crowdsale_address: "",
          description,
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
          <TokenConfigurationForm
            register={register}
            isFieldDisabled={isFieldDisabled}
            uploadImage={uploadImage}
            tokenPreview={tokenImage}
            bottlePreview={bottleImage}
            setValue={setValue}
            setSelectedWinery={setSelectedWinery}
            selectedWinery={selectedWinery}
            setBottleImage={setBottleImage}
            bottleImage={bottleImage}
            setTokenImage={setTokenImage}
            tokenImage={tokenImage}
        
          />

          <h2 className="text-xl font-semibold">{t("crowdsale_config")}</h2>

          <CrowdsaleConfogurationForm
            register={register}
            isFieldDisabled={isFieldDisabled}
            setValue={setValue}
          />

          <DeployedAddresses token={token} />

          <LaunchActionButton
            token={token}
            isCreateMode={isCreateMode}
            isEditMode={isEditMode}
            isViewMode={isViewMode}
            handleDeployAll={handleDeployAll}
            loading={loading}
            disableDeploy={disableDeploy}
            transferTokensToCrowdsale={transferTokensToCrowdsale}
            transferDisabled={transferDisabled}
            transferDone={transferDone}
            createTokenInDatabase={createTokenInDatabase}
            finalizeAndRenewCrowdsale={finalizeAndRenewCrowdsale}
            finalizeCrowdsale={finalizeCrowdsale}
          />
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
