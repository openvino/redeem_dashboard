import React from 'react'
import { useTranslation } from 'react-i18next';
import FormField from './FormField';

const DeployedAddresses = ({token}) => {
    const { t } = useTranslation();
  return (
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
  )
}

export default DeployedAddresses