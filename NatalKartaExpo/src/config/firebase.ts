import { Platform } from 'react-native';

// Web config
const firebaseConfig = {
  apiKey: 'AIzaSyDVbcm8B9MW4v3_yyF-nI4EIJSiLlN326c',
  authDomain: 'natal-karta.firebaseapp.com',
  projectId: 'natal-karta',
  storageBucket: 'natal-karta.firebasestorage.app',
  messagingSenderId: '1081661555220',
  appId: '1:1081661555220:android:3c549ed159c305ce1b1d01',
};

let auth: any;
let signInAnonymously: () => Promise<any>;

if (Platform.OS === 'web') {
  // Web: Use standard JS SDK
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { getAuth, signInAnonymously: signInWeb } = require('firebase/auth');
  
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  signInAnonymously = () => signInWeb(auth);
} else {
  // Mobile: Use native SDK
  const nativeAuth = require('@react-native-firebase/auth').default;
  auth = nativeAuth;
  signInAnonymously = () => nativeAuth().signInAnonymously();
}

export { auth, signInAnonymously };
