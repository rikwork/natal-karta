import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyDVbcm8B9MW4v3_yyF-nI4EIJSiLlN326c",
    authDomain: "natal-karta.firebaseapp.com",
    projectId: "natal-karta",
    storageBucket: "natal-karta.firebasestorage.app",
    messagingSenderId: "1081661555220",
    appId: "1:1081661555220:android:3c549ed159c305ce1b1d01" // Используем существующий ID для старта
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth, signInAnonymously };
