import { useEffect } from 'react';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Si falla el registro (por ejemplo, en un navegador viejo), el
        // sitio sigue funcionando normal, solo sin la parte offline.
      });
    }
  }, []);

  return <Component {...pageProps} />;
}
