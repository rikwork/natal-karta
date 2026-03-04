import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForDevelopmentPurposes123",
    authDomain: "natal-karta-app.firebaseapp.com",
    projectId: "natal-karta-app",
    storageBucket: "natal-karta-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef",
    measurementId: "G-ABCDEF1234"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth, signInAnonymously };
