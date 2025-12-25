// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCAG9rGNmG_IK0Pgmr0Yhop4zL83Q_32Mo",
    authDomain: "kraftsnknots-921a0.firebaseapp.com",
    projectId: "kraftsnknots-921a0",
    storageBucket: "kraftsnknots-921a0.firebasestorage.app",
    messagingSenderId: "566392222908",
    appId: "1:566392222908:web:9232182df7666eed3f4cb9",
    measurementId: "G-ZD2BFRMN24"
};

// Initialize only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
