import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";

const LaunchActionButton = ({
  token,
  isCreateMode,
  isEditMode,
  isViewMode,
  handleDeployAll,
  loading,
  disableDeploy,
  transferTokensToCrowdsale,
  transferDisabled,
  transferDone,
  createTokenInDatabase,
  finalizeCrowdsale,
  finalizeAndRenewCrowdsale
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  return (
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
            onClick={() => router.push(`/provisioning/crowdsale/${id}`)}
            className="px-6 py-2 bg-gray-300 rounded"
          >
            {t("update_crowdsale")}
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
                {token?.token_address && !token?.crowdsale_address
                  ? t("resume_crowdsale_deploy")
                  : t("deploy_contracts")}
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
  );
};

export default LaunchActionButton;
