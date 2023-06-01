import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Provider as WagmiProvider } from "wagmi";
//redux
import { Provider } from "react-redux";
import store from "@/redux/store";

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider autoConnect>
      <SessionProvider>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </SessionProvider>
    </WagmiProvider>
  );
}
