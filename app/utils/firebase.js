// src/utils/firebaseConfig.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrLtWIs-xdcFG2_lDOTZereKZ-VOm5dbA",
  authDomain: "webdev-73fca.firebaseapp.com",
  projectId: "webdev-73fca",
  storageBucket: "webdev-73fca.appspot.com",
  messagingSenderId: "308191456185",
  appId: "1:308191456185:web:eed98c574eb551923c6468",
  measurementId: "G-QSGPGBKNVB"
};

// ✅ Prevent duplicate initialization
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
