import { useTranslation } from "react-i18next";
import FormField from "./FormField";
import { ImageUploader } from "./ImageUploader";
import { WinerySelector } from "./WinerySelector";

export const CrowdsaleConfogurationForm = ({
  register,
  isFieldDisabled,
  setValue,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t("VCO_wallet_address")}
          type="text"
          {...register("wallet_address")}
          className="w-full mt-1 p-2 border rounded"
          required
          disabled={isFieldDisabled()}
        />

        <FormField
          label={t("price_per_token")}
          type="number"
          step="any"
          {...register("price_per_token")}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t("rate_tokens_per_eth")}
          type="number"
          {...register("rate")}
          onChange={(e) => {
            const rate = parseFloat(e.target.value);
            if (!isNaN(rate) && rate > 0) {
              const newPrice = 1 / rate;
              setValue("price_per_token", parseFloat(newPrice.toFixed(8)));
            } else {
              setValue("price_per_token", 0);
            }
          }}
          className="w-full mt-1 p-2 border rounded"
          required
          disabled={isFieldDisabled()}
        />

        <FormField
          label={t("opening_time")}
          type="datetime-local"
          {...register("opening_time")}
          className="w-full mt-1 p-2 border rounded"
          disabled={isFieldDisabled()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t("closing_time")}
          type="datetime-local"
          {...register("closing_time")}
          className="w-full mt-1 p-2 border rounded"
          required
          disabled={isFieldDisabled()}
        />

        <FormField
          label={t("tokens_to_crowdsale")}
          type="number"
          step="any"
          {...register("tokens_to_crowdsale")}
          className="w-full mt-1 p-2 border rounded"
          required
          disabled={isFieldDisabled()}
        />
      </div>
     
    </div>
  );
};
