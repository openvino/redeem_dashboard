import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from 'next-auth/react';
//redux
import { Provider } from 'react-redux';
import store from '../redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from '../config/i18n';
import Router from 'next/router';
import Loader from '../components/Loader';
import { useState } from 'react';
import { Montserrat } from '@next/font/google';
const roboto = Montserrat({
  subsets: ['latin'],

  weight: ['400', '700'],
});
export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  // Route change event listener
  Router.events.on('routeChangeStart', (url) => {
    setLoading(true);
  });
  Router.events.on('routeChangeComplete', (url) => {
    setLoading(false);
  });

  return (
    // Application providers
    <I18nextProvider i18n={i18n}>
      <SessionProvider>
        <Provider store={store}>
          {loading && <Loader />}
          <main className={roboto.className}>
            <Component {...pageProps} />
          </main>
        </Provider>
      </SessionProvider>
    </I18nextProvider>
  );
}
