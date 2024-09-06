// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: "jobs-bored-47992.firebaseapp.com",
  projectId: "jobs-bored-47992",
  storageBucket: "jobs-bored-47992.appspot.com",
  messagingSenderId: "336232399104",
  appId: process.env.FIREBASE_APP_ID,
  measurementId: "G-PSV00CFFLR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export { functions };