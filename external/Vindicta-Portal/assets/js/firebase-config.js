import { initializeApp } from "firebase/app";
import { getRemoteConfig } from "firebase/remote-config";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration from environment variables (via Vite)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Remote Config and get a reference to the service
const remoteConfig = getRemoteConfig(app);

// Configure settings based on environment
// 12 hours for production to respect Firebase quotas, 0 for localhost for instant updates during development
const isDevelopment =
    location.hostname === 'localhost' ||
    location.hostname.includes('127.0.0.1');

remoteConfig.settings.minimumFetchIntervalMillis = isDevelopment ? 0 : 43200000;

export { app, remoteConfig, analytics };
