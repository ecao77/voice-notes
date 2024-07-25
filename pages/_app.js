// File: pages/_app.js
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        async function setup() {
        if (typeof window === 'undefined') {
            // This code only runs on the server
            try {
            console.log('Importing setupDb');
            const { setupDb } = await import('../lib/db');
            console.log('Running setupDb');
            await setupDb();
            console.log('Database setup completed successfully');
            } catch (error) {
            console.error('Error during database setup:', error);
            }
        }
        }
        setup();
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;