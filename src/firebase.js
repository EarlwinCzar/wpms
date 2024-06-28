// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from "firebase/compat/app"; // Update import statement
import "firebase/compat/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyB6yHRbtkjiewE8zwlkbtqVXI6f65GmhJw",
  authDomain: "wpms-53b67.firebaseapp.com",
  projectId: "wpms-53b67",
  storageBucket: "wpms-53b67.appspot.com",
  messagingSenderId: "111383567669",
  appId: "1:111383567669:web:49a77e091022fd6064c07c",
  measurementId: "G-2KLBFNPZVG",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore(); // Export Firestore instance
