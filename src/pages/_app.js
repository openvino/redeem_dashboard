import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Provider as WagmiProvider } from "wagmi";
//redux
import { Provider } from "react-redux";
import store from "../redux/store";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/config/i18n';
export default function App({ Component, pageProps }) {
  return (
    <I18nextProvider i18n={i18n}>

    <WagmiProvider autoConnect>

      <SessionProvider>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </SessionProvider>

    </WagmiProvider>
    </I18nextProvider>

  );
}
