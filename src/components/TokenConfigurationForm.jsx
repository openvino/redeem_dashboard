import { useTranslation } from "react-i18next";
import FormField from "./FormField";
import { ImageUploader } from "./ImageUploader";
import { WinerySelector } from "./WinerySelector";

export const TokenConfigurationForm = ({
  register,
  isFieldDisabled,
  setValue,
  setSelectedWinery,
  selectedWinery,
  setBottleImage,
  bottleImage,
  tokenImage,
  setTokenImage
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t("token_name")}
          required
          disabled={isFieldDisabled()}
          {...register("name")}
        />

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
          {...register("redeem_wallet_address")}
          className="w-full mt-1 p-2 border rounded"
          required
          disabled={isFieldDisabled()}
        />
      </div>

      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
          label={t("vintage")}
          type="number"
          step="any"
          {...register("vintage")}
          className="w-full mt-1 p-2 border rounded"
          required
          disabled={isFieldDisabled()}
        />

        <WinerySelector
          isFieldDisabled={isFieldDisabled}
          setSelectedWinery={setSelectedWinery}
          selectedWinery={selectedWinery}
          setValue={setValue}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     

        <ImageUploader
        setImage={setBottleImage}
          label={t("bottle_image")}
          value={"bottle_image"}
          imagePreview={bottleImage}
          setValue={setValue}
        />

         <ImageUploader
          label={t("token_logo")}
          value={"token_image"}
          imagePreview={tokenImage}
          setValue={setValue}
          setImage={setTokenImage}
        />
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {t("description")}
        </label>
        <textarea
          rows="10"
          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#840C4A]"
          disabled={isFieldDisabled()}
          {...register("description")}
        />
      </div>
    </div>
  );
};
