import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Provider as WagmiProvider } from "wagmi";
//redux
import { Provider } from "react-redux";
import store from "../redux/store";
import { I18nextProvider } from "react-i18next";
import i18n from "../config/i18n";
import Router from "next/router";
import Loader from "../components/Loader";
import { useState } from "react";

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  // Route change event listener
  Router.events.on("routeChangeStart", (url) => {
    setLoading(true);
  });
  Router.events.on("routeChangeComplete", (url) => {
    setLoading(false);
  });
  return (
    // Application providers
    <I18nextProvider i18n={i18n}>
      <WagmiProvider autoConnect>
        <SessionProvider>
          <Provider store={store}>
            {loading && <Loader />}
            <Component {...pageProps} />
          </Provider>
        </SessionProvider>
      </WagmiProvider>
    </I18nextProvider>
  );
}

// export default function App({ Component, pageProps }) {
//   Router.events.on("routeChangeStart", (url) => {
//     console.log("Route is changing");
//   });
//   return (
//     <I18nextProvider i18n={i18n}>
//       <WagmiProvider autoConnect>
//         <SessionProvider>
//           <Provider store={store}>
//             <Component {...pageProps} />
//           </Provider>
//         </SessionProvider>
//       </WagmiProvider>
//     </I18nextProvider>
//   );
// }
