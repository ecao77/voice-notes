// File: pages/_app.js
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      // This code only runs on the server
      console.log('Importing setupDb');
      import('../lib/db').then(({ setupDb }) => {
        console.log('Running setupDb');
        setupDb().catch(err => console.error('Error setting up database:', err));
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;