import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDd9oM3Sp1F73j6C4CqEBbeAq7_k-N_CBA",
  authDomain: "arovyacare.firebaseapp.com",
  projectId: "arovyacare",
  storageBucket: "arovyacare.firebasestorage.app",
  messagingSenderId: "196606913843",
  appId: "1:196606913843:web:6d96f36afe96a093342246"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);