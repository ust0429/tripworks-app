import '../styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { initializeApiOnBrowser } from '../utils/apiInit';
import { AuthProvider } from '../contexts/AuthContext';
import { AttenderProfileProvider } from '../contexts/AttenderProfileContext';

function MyApp({ Component, pageProps }: AppProps) {
  // APIクライアントの初期化
  useEffect(() => {
    initializeApiOnBrowser();
  }, []);
  
  return (
    <AuthProvider>
      <AttenderProfileProvider>
        <Component {...pageProps} />
      </AttenderProfileProvider>
    </AuthProvider>
  );
}

export default MyApp;
