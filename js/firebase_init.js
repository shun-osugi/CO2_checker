//
//firebaseを使うためのスニペット
//モジュール

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyCrY_bI-S8BFkH-mG5HRDtrlXZ_96cf1nM",
    authDomain: "jp-co2-checker.firebaseapp.com",
    projectId: "jp-co2-checker",
    storageBucket: "jp-co2-checker.firebasestorage.app",
    messagingSenderId: "380281511593",
    appId: "1:380281511593:web:5bf556efa30213a85293b8",
    measurementId: "G-WHNH6TP77Y"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
