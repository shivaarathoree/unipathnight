"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAauUref_F-JBdsvTjDZZnWZ0sWxyLTS3w",
  authDomain: "unipath-auth.firebaseapp.com",
  projectId: "unipath-auth",
  storageBucket: "unipath-auth.firebasestorage.app",
  messagingSenderId: "83683329527",
  appId: "1:83683329527:web:084fbe0d104f8e1940daf2",
  measurementId: "G-T1JC4FQP07"
};


let app;
let auth;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
}

export { auth };