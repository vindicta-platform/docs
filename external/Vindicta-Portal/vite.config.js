import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    // Expose VITE_* env variables to the client
    const env = loadEnv(mode, process.cwd(), '');

    return {
        root: '.', // Root is the project directory
        publicDir: 'public', // Static assets (if any)

        build: {
            outDir: 'dist',
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    club: resolve(__dirname, 'club/index.html'),
                    clubAbout: resolve(__dirname, 'club/about.html'),
                    clubTeam: resolve(__dirname, 'club/team.html'),
                    clubEvents: resolve(__dirname, 'club/events.html'),
                    clubJoin: resolve(__dirname, 'club/join.html'),
                    clubPartners: resolve(__dirname, 'club/partners.html'),
                    clubCode: resolve(__dirname, 'club/code.html'),
                    clubElements: resolve(__dirname, 'club/elements.html'),
                    clubGeneric: resolve(__dirname, 'club/generic.html'),
                    platform: resolve(__dirname, 'platform/index.html'),
                    platformDashboard: resolve(__dirname, 'platform/dashboard.html'),
                    platformWarscribe: resolve(__dirname, 'platform/warscribe.html'),
                },
            },
        },

        server: {
            open: '/index.html', // Open main page on dev start
        },

        // Define global constants from environment variables
        define: {
            __FIREBASE_API_KEY__: JSON.stringify(env.VITE_FIREBASE_API_KEY),
            __FIREBASE_AUTH_DOMAIN__: JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
            __FIREBASE_PROJECT_ID__: JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
            __FIREBASE_STORAGE_BUCKET__: JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
            __FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
            __FIREBASE_APP_ID__: JSON.stringify(env.VITE_FIREBASE_APP_ID),
            __FIREBASE_MEASUREMENT_ID__: JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID),
        },
    };
});
