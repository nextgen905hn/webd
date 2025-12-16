// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBrLtWIs-xdcFG2_lDOTZereKZ-VOm5dbA",
  authDomain: "webdev-73fca.firebaseapp.com",
  projectId: "webdev-73fca",
  storageBucket: "webdev-73fca.firebasestorage.app",
  messagingSenderId: "308191456185",
  appId: "1:308191456185:web:eed98c574eb551923c6468",
  measurementId: "G-QSGPGBKNVB"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
